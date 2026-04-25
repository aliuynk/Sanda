import { ConflictError, ForbiddenError, NotFoundError } from '@sanda/core';
import { ProductStatus, SellerStatus } from '@sanda/db/types';
import {
  createProductInput,
  createVariantInput,
  listMyProductsInput,
  listProductsInput,
  productSlugInput,
  updateProductInput,
} from '@sanda/validation';
import { z } from 'zod';

import type { Context } from '../context';
import { guardedProcedure, router, sellerProcedure } from '../trpc';

type ProductPriceBoundClient = Pick<Context['prisma'], 'product' | 'productVariant'>;

async function currentSeller(ctx: Context) {
  const seller = await ctx.prisma.sellerProfile.findUnique({
    where: { accountId: ctx.principal!.accountId },
    select: { id: true },
  });
  if (!seller) throw new NotFoundError('SellerProfile');
  return seller;
}

async function assertOwnedProduct(ctx: Context, productId: string) {
  const seller = await currentSeller(ctx);
  const product = await ctx.prisma.product.findFirst({
    where: { id: productId, sellerId: seller.id },
    select: { id: true, sellerId: true },
  });
  if (!product) throw new NotFoundError('Product', productId);
  return { seller, product };
}

async function refreshProductPriceBounds(client: ProductPriceBoundClient, productId: string) {
  const bounds = await client.productVariant.aggregate({
    where: { productId, isActive: true },
    _min: { priceKurus: true },
    _max: { priceKurus: true },
  });

  await client.product.update({
    where: { id: productId },
    data: {
      minPriceKurus: bounds._min.priceKurus,
      maxPriceKurus: bounds._max.priceKurus,
    },
  });
}

function activeSeasonFilter(month: number) {
  const wrappingAfterStart = Array.from({ length: month }, (_, i) => {
    const startMonth = i + 1;
    return { seasonStartMonth: startMonth, seasonEndMonth: { lt: startMonth } };
  });
  const wrappingBeforeEnd = Array.from({ length: 12 - month }, (_, i) => {
    const startMonth = month + i + 1;
    return {
      seasonStartMonth: startMonth,
      seasonEndMonth: { gte: month, lt: startMonth },
    };
  });

  return {
    OR: [
      { isSeasonal: false },
      { seasonStartMonth: null },
      { seasonEndMonth: null },
      { AND: [{ seasonStartMonth: { lte: month } }, { seasonEndMonth: { gte: month } }] },
      ...wrappingAfterStart,
      ...wrappingBeforeEnd,
    ],
  };
}

export const catalogRouter = router({
  // --- Public discovery ------------------------------------------------------
  list: guardedProcedure.input(listProductsInput).query(async ({ ctx, input }) => {
    const variantPriceFilter: { gte?: number; lte?: number } = {};
    if (input.priceMinKurus != null) variantPriceFilter.gte = input.priceMinKurus;
    if (input.priceMaxKurus != null) variantPriceFilter.lte = input.priceMaxKurus;
    const variantWhere = {
      isActive: true,
      ...(Object.keys(variantPriceFilter).length > 0 ? { priceKurus: variantPriceFilter } : {}),
    };
    const variantPriceDirection = input.sort === 'price_desc' ? 'desc' : 'asc';
    const andFilters: ReturnType<typeof activeSeasonFilter>[] = [];
    if (input.inSeasonOnly) {
      andFilters.push(activeSeasonFilter(new Date().getMonth() + 1));
    }

    const where = {
      status: ProductStatus.ACTIVE,
      archivedAt: null,
      seller: { status: SellerStatus.APPROVED },
      variants: { some: variantWhere },
      ...(input.sellerId ? { sellerId: input.sellerId } : {}),
      ...(input.categorySlug ? { category: { slug: input.categorySlug } } : {}),
      ...(input.productionMethod ? { productionMethod: input.productionMethod } : {}),
      ...(input.region ? { originRegion: input.region } : {}),
      ...(input.priceMinKurus != null ? { maxPriceKurus: { gte: input.priceMinKurus } } : {}),
      ...(input.priceMaxKurus != null ? { minPriceKurus: { lte: input.priceMaxKurus } } : {}),
      ...(andFilters.length > 0 ? { AND: andFilters } : {}),
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
        ? [{ minPriceKurus: 'asc' as const }, { publishedAt: 'desc' as const }]
        : input.sort === 'price_desc'
          ? [{ maxPriceKurus: 'desc' as const }, { publishedAt: 'desc' as const }]
          : input.sort === 'rating'
            ? [{ ratingAverage: 'desc' as const }, { publishedAt: 'desc' as const }]
            : input.sort === 'popular'
              ? [{ orderCount: 'desc' as const }, { publishedAt: 'desc' as const }]
              : [{ publishedAt: 'desc' as const }];

    const rows = await ctx.prisma.product.findMany({
      where,
      orderBy,
      take: input.limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      include: {
        variants: { where: variantWhere, orderBy: { priceKurus: variantPriceDirection } },
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
    const product = await ctx.prisma.product.findFirst({
      where: {
        slug: input.slug,
        status: ProductStatus.ACTIVE,
        archivedAt: null,
        seller: { status: SellerStatus.APPROVED },
      },
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
    const seller = await currentSeller(ctx);
    if (input.sellerId !== seller.id) {
      throw new ForbiddenError('product.create', { sellerId: input.sellerId });
    }
    const product = await ctx.prisma.product.create({
      data: {
        ...input,
        sellerId: seller.id,
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
    await assertOwnedProduct(ctx, productId);
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
      await assertOwnedProduct(ctx, input.productId);
      const activeVariantCount = await ctx.prisma.productVariant.count({
        where: { productId: input.productId, isActive: true },
      });
      if (activeVariantCount === 0) {
        throw new ConflictError('Product must have at least one active variant before publishing.');
      }
      await refreshProductPriceBounds(ctx.prisma, input.productId);
      return ctx.prisma.product.update({
        where: { id: input.productId },
        data: { status: ProductStatus.ACTIVE, publishedAt: new Date() },
      });
    }),

  createVariant: sellerProcedure.input(createVariantInput).mutation(async ({ ctx, input }) => {
    await assertOwnedProduct(ctx, input.productId);
    return ctx.prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.create({
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
        await tx.productVariant.updateMany({
          where: { productId: input.productId, id: { not: variant.id } },
          data: { isDefault: false },
        });
      }
      await refreshProductPriceBounds(tx, input.productId);
      return variant;
    });
  }),
});
