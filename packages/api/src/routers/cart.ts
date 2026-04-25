import { ConflictError, NotFoundError, ValidationError } from '@sanda/core';
import { addToCartInput, removeCartItemInput, updateCartItemInput } from '@sanda/validation';

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
    if (!variant.isActive) {
      throw new ConflictError('Variant is not available.');
    }

    const cart = await ctx.prisma.cart.upsert({
      where: { accountId: ctx.principal.accountId },
      update: {},
      create: { accountId: ctx.principal.accountId },
    });

    const existing = await ctx.prisma.cartItem.findUnique({
      where: { cartId_variantId: { cartId: cart.id, variantId: variant.id } },
    });

    const nextQty = (existing ? Number(existing.quantity) : 0) + input.quantity;
    if (nextQty > Number(variant.stockQuantity)) {
      throw new ValidationError('Insufficient stock', [
        { path: ['quantity'], message: 'errors.cart.stock' },
      ]);
    }

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
    return ctx.prisma.cartItem.update({
      where: { id: input.cartItemId },
      data: { quantity: input.quantity.toString() },
    });
  }),

  removeItem: protectedProcedure.input(removeCartItemInput).mutation(async ({ ctx, input }) => {
    return ctx.prisma.cartItem.delete({ where: { id: input.cartItemId } });
  }),
});
