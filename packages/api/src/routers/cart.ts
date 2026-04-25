import { NotFoundError } from '@sanda/core';
import { addToCartInput, removeCartItemInput, updateCartItemInput } from '@sanda/validation';

import { assertPurchasableCartQuantity, assertPurchasableCatalogItem } from '../domain/cart';
import { protectedProcedure, router } from '../trpc';

export const cartRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const cart = await ctx.prisma.cart.upsert({
      where: { accountId: ctx.principal.accountId },
      update: {},
      create: { accountId: ctx.principal.accountId },
      include: {
        items: {
          include: {
            product: {
              include: {
                media: { take: 1, orderBy: { sortOrder: 'asc' } },
                seller: { select: { id: true, slug: true, displayName: true } },
              },
            },
            variant: true,
          },
        },
      },
    });
    return cart;
  }),

  addItem: protectedProcedure.input(addToCartInput).mutation(async ({ ctx, input }) => {
    const variant = await ctx.prisma.productVariant.findUnique({
      where: { id: input.variantId },
      include: { product: true },
    });
    if (!variant || variant.productId !== input.productId) {
      throw new NotFoundError('Variant');
    }
    assertPurchasableCatalogItem({
      productStatus: variant.product.status,
      variantIsActive: variant.isActive,
    });

    const cart = await ctx.prisma.cart.upsert({
      where: { accountId: ctx.principal.accountId },
      update: {},
      create: { accountId: ctx.principal.accountId },
    });

    const existing = await ctx.prisma.cartItem.findUnique({
      where: { cartId_variantId: { cartId: cart.id, variantId: variant.id } },
    });

    const nextQty = (existing ? Number(existing.quantity) : 0) + input.quantity;
    assertPurchasableCartQuantity({
      productId: variant.productId,
      variantId: variant.id,
      sellerId: variant.product.sellerId,
      quantity: nextQty,
      unitPriceKurus: variant.priceKurus,
      stockQuantity: variant.stockQuantity,
      minOrderQty: variant.product.minOrderQty,
      maxOrderQty: variant.product.maxOrderQty,
      stepQty: variant.product.stepQty,
    });

    return ctx.prisma.cartItem.upsert({
      where: { cartId_variantId: { cartId: cart.id, variantId: variant.id } },
      update: {
        quantity: nextQty.toString(),
        priceSnapshotKurus: variant.priceKurus,
      },
      create: {
        cartId: cart.id,
        productId: variant.productId,
        variantId: variant.id,
        quantity: nextQty.toString(),
        priceSnapshotKurus: variant.priceKurus,
      },
    });
  }),

  updateItem: protectedProcedure.input(updateCartItemInput).mutation(async ({ ctx, input }) => {
    const item = await ctx.prisma.cartItem.findFirst({
      where: { id: input.cartItemId, cart: { accountId: ctx.principal.accountId } },
      include: { variant: true, product: true },
    });
    if (!item) throw new NotFoundError('CartItem', input.cartItemId);
    assertPurchasableCatalogItem({
      productStatus: item.product.status,
      variantIsActive: item.variant.isActive,
    });
    assertPurchasableCartQuantity({
      productId: item.productId,
      variantId: item.variantId,
      sellerId: item.product.sellerId,
      quantity: input.quantity,
      unitPriceKurus: item.variant.priceKurus,
      stockQuantity: item.variant.stockQuantity,
      minOrderQty: item.product.minOrderQty,
      maxOrderQty: item.product.maxOrderQty,
      stepQty: item.product.stepQty,
    });

    return ctx.prisma.cartItem.update({
      where: { id: input.cartItemId },
      data: { quantity: input.quantity.toString() },
    });
  }),

  removeItem: protectedProcedure.input(removeCartItemInput).mutation(async ({ ctx, input }) => {
    const item = await ctx.prisma.cartItem.findFirst({
      where: { id: input.cartItemId, cart: { accountId: ctx.principal.accountId } },
      select: { id: true },
    });
    if (!item) throw new NotFoundError('CartItem', input.cartItemId);
    return ctx.prisma.cartItem.delete({ where: { id: item.id } });
  }),
});
