import { ForbiddenError, NotFoundError } from '@sanda/core';
import { ProductStatus } from '@sanda/db/types';
import {
  createProductInput,
  createVariantInput,
  listMyProductsInput,
  listProductsInput,
  productSlugInput,
  updateProductInput,
} from '@sanda/validation';
import { z } from 'zod';

import { guardedProcedure, router, sellerProcedure } from '../trpc';

export const catalogRouter = router({
  // --- Public discovery ------------------------------------------------------
  list: guardedProcedure.input(listProductsInput).query(async ({ ctx, input }) => {
    const where = {
      status: ProductStatus.ACTIVE,
      ...(input.sellerId ? { sellerId: input.sellerId } : {}),
      ...(input.categorySlug ? { category: { slug: input.categorySlug } } : {}),
      ...(input.productionMethod ? { productionMethod: input.productionMethod } : {}),
      ...(input.region ? { originRegion: input.region } : {}),
      ...(input.search
        ? {
            OR: [
              { nameTr: { contains: input.search, mode: 'insensitive' as const } },
              { nameEn: { contains: input.search, mode: 'insensitive' as const } },
              { tags: { hasSome: [input.search] } },
            ],
          }
        : {}),
    };

    const orderBy =
      input.sort === 'price_asc'
        ? [{ variants: { _count: 'desc' as const } }]
        : input.sort === 'rating'
          ? [{ ratingAverage: 'desc' as const }]
          : input.sort === 'popular'
            ? [{ orderCount: 'desc' as const }]
            : [{ publishedAt: 'desc' as const }];

    const rows = await ctx.prisma.product.findMany({
      where,
      orderBy,
      take: input.limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      include: {
        variants: { where: { isActive: true }, orderBy: { priceKurus: 'asc' } },
        media: { take: 1, orderBy: { sortOrder: 'asc' } },
        seller: { select: { id: true, slug: true, displayName: true, ratingAverage: true } },
        category: { select: { slug: true, nameTr: true } },
      },
    });

    const hasMore = rows.length > input.limit;
    const items = hasMore ? rows.slice(0, -1) : rows;
    return {
      items,
      nextCursor: hasMore ? items[items.length - 1]!.id : null,
    };
  }),

  bySlug: guardedProcedure.input(productSlugInput).query(async ({ ctx, input }) => {
    const product = await ctx.prisma.product.findUnique({
      where: { slug: input.slug },
      include: {
        variants: { where: { isActive: true }, orderBy: { priceKurus: 'asc' } },
        media: { orderBy: { sortOrder: 'asc' } },
        category: true,
        seller: {
          include: {
            certifications: { where: { status: 'VERIFIED' } },
            serviceAreas: { where: { isActive: true } },
          },
        },
        certifications: { include: { certification: true } },
      },
    });
    if (!product) throw new NotFoundError('Product', input.slug);
    return product;
  }),

  categories: guardedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.category.findMany({
      where: { isActive: true, parentId: null },
      orderBy: { sortOrder: 'asc' },
      include: {
        children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      },
    });
  }),

  mineById: sellerProcedure
    .input(z.object({ productId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const seller = await ctx.prisma.sellerProfile.findUnique({
        where: { accountId: ctx.principal.accountId },
      });
      if (!seller) throw new NotFoundError('SellerProfile');
      const product = await ctx.prisma.product.findUnique({
        where: { id: input.productId },
        include: {
          variants: { orderBy: [{ isDefault: 'desc' }, { priceKurus: 'asc' }] },
          media: { orderBy: { sortOrder: 'asc' } },
          category: true,
        },
      });
      if (!product) throw new NotFoundError('Product', input.productId);
      if (product.sellerId !== seller.id) {
        throw new ForbiddenError('product.mineById', { productId: input.productId });
      }
      return product;
    }),

  listMine: sellerProcedure.input(listMyProductsInput).query(async ({ ctx, input }) => {
    const seller = await ctx.prisma.sellerProfile.findUnique({
      where: { accountId: ctx.principal.accountId },
    });
    if (!seller) throw new NotFoundError('SellerProfile');
    const where = {
      sellerId: seller.id,
      ...(input.status ? { status: input.status } : {}),
    };
    const rows = await ctx.prisma.product.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: input.limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      include: {
        category: { select: { slug: true, nameTr: true } },
        variants: { where: { isActive: true }, orderBy: { priceKurus: 'asc' }, take: 1 },
        media: { take: 1, orderBy: { sortOrder: 'asc' } },
      },
    });
    const hasMore = rows.length > input.limit;
    const items = hasMore ? rows.slice(0, -1) : rows;
    return {
      items,
      nextCursor: hasMore ? items[items.length - 1]!.id : null,
    };
  }),

  // --- Seller mutations ------------------------------------------------------
  create: sellerProcedure.input(createProductInput).mutation(async ({ ctx, input }) => {
    const product = await ctx.prisma.product.create({
      data: {
        ...input,
        minOrderQty: input.minOrderQty.toString(),
        maxOrderQty: input.maxOrderQty?.toString(),
        stepQty: input.stepQty.toString(),
      },
    });
    await ctx.prisma.sellerProfile.update({
      where: { id: input.sellerId },
      data: { productCount: { increment: 1 } },
    });
    return product;
  }),

  update: sellerProcedure.input(updateProductInput).mutation(async ({ ctx, input }) => {
    const { productId, patch } = input;
    const { minOrderQty, maxOrderQty, stepQty, ...rest } = patch;
    return ctx.prisma.product.update({
      where: { id: productId },
      data: {
        ...rest,
        ...(minOrderQty != null ? { minOrderQty: minOrderQty.toString() } : {}),
        ...(maxOrderQty != null ? { maxOrderQty: maxOrderQty.toString() } : {}),
        ...(stepQty != null ? { stepQty: stepQty.toString() } : {}),
      },
    });
  }),

  publish: sellerProcedure
    .input(z.object({ productId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.product.update({
        where: { id: input.productId },
        data: { status: ProductStatus.ACTIVE, publishedAt: new Date() },
      });
    }),

  createVariant: sellerProcedure.input(createVariantInput).mutation(async ({ ctx, input }) => {
    const variant = await ctx.prisma.productVariant.create({
      data: {
        productId: input.productId,
        sku: input.sku,
        nameTr: input.nameTr,
        unit: input.unit,
        quantityPerUnit: input.quantityPerUnit.toString(),
        priceKurus: input.priceKurus,
        compareAtPriceKurus: input.compareAtPriceKurus,
        stockQuantity: input.stockQuantity.toString(),
        lowStockThreshold: input.lowStockThreshold?.toString(),
        weightGrams: input.weightGrams,
        isDefault: input.isDefault,
      },
    });
    if (input.isDefault) {
      await ctx.prisma.productVariant.updateMany({
        where: { productId: input.productId, id: { not: variant.id } },
        data: { isDefault: false },
      });
    }
    return variant;
  }),
});
