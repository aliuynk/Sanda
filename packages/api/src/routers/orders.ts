import {
  computeCommission,
  ConflictError,
  getServerEnv,
  kurus,
  NotFoundError,
  PaymentError,
} from '@sanda/core';
import type { ShippingCarrier } from '@sanda/db/types';
import {
  FulfillmentMode,
  OrderEventType,
  OrderStatus,
  PaymentStatus,
  ShipmentStatus,
} from '@sanda/db/types';
import {
  cancelOrderInput,
  checkoutInput,
  createReviewInput,
  markOrderShippedInput,
} from '@sanda/validation';
import { z } from 'zod';

import { assertPurchasableCartQuantity, assertPurchasableCatalogItem } from '../domain/cart';
import { protectedProcedure, router, sellerProcedure } from '../trpc';

/**
 * Multi-seller cart checkout.
 *
 * We split the cart into N Orders by sellerId, each with its own payment
 * intent. This keeps PSP submerchant balances, shipping, and disputes clean.
 * The payment provider (iyzico) collects the top-level charge as a marketplace
 * payment and splits per-seller proceeds via subMerchantKey/subMerchantPrice;
 * Sanda is not the money-holding party.
 */
export const orderRouter = router({
  // --- Buyer -----------------------------------------------------------------
  myOrders: protectedProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().int().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const rows = await ctx.prisma.order.findMany({
        where: { buyerAccountId: ctx.principal.accountId },
        orderBy: { placedAt: 'desc' },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
        include: {
          seller: { select: { slug: true, displayName: true } },
          items: { take: 1, include: { product: { select: { slug: true, nameTr: true } } } },
        },
      });
      const hasMore = rows.length > input.limit;
      return {
        items: hasMore ? rows.slice(0, -1) : rows,
        nextCursor: hasMore ? rows[rows.length - 2]!.id : null,
      };
    }),

  detail: protectedProcedure
    .input(z.object({ orderNumber: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.findUnique({
        where: { orderNumber: input.orderNumber },
        include: {
          items: { include: { product: true, variant: true } },
          seller: true,
          events: { orderBy: { createdAt: 'asc' } },
          shipments: { include: { events: { orderBy: { occurredAt: 'asc' } } } },
          payments: true,
          shippingAddress: true,
        },
      });
      if (!order) throw new NotFoundError('Order', input.orderNumber);
      if (
        order.buyerAccountId !== ctx.principal.accountId &&
        !ctx.principal.roles.includes('ADMIN')
      ) {
        throw new NotFoundError('Order', input.orderNumber);
      }
      return order;
    }),

  checkout: protectedProcedure.input(checkoutInput).mutation(async ({ ctx, input }) => {
    if (input.paymentMethod === 'CREDIT_CARD' && !input.cardToken) {
      throw new PaymentError('Missing card token.');
    }

    const env = getServerEnv();
    const cart = await ctx.prisma.cart.findUnique({
      where: { accountId: ctx.principal.accountId },
      include: { items: { include: { variant: true, product: true } } },
    });
    if (!cart || cart.items.length === 0) {
      throw new ConflictError('Cart is empty.');
    }

    const shippingAddress = input.shippingAddressId
      ? await ctx.prisma.address.findFirst({
          where: {
            id: input.shippingAddressId,
            accountId: ctx.principal.accountId,
            archivedAt: null,
          },
          select: { id: true, districtId: true, provinceCode: true },
        })
      : null;
    if (input.shippingAddressId && !shippingAddress) {
      throw new NotFoundError('Address', input.shippingAddressId);
    }

    if (input.billingAddressId) {
      const billingAddress = await ctx.prisma.address.findFirst({
        where: {
          id: input.billingAddressId,
          accountId: ctx.principal.accountId,
          archivedAt: null,
        },
        select: { id: true },
      });
      if (!billingAddress) throw new NotFoundError('Address', input.billingAddressId);
    }

    for (const item of cart.items) {
      assertPurchasableCatalogItem({
        productStatus: item.product.status,
        variantIsActive: item.variant.isActive,
      });
      if (item.priceSnapshotKurus !== item.variant.priceKurus) {
        throw new ConflictError('Cart prices changed. Review cart before checkout.');
      }
      assertPurchasableCartQuantity({
        productId: item.productId,
        variantId: item.variantId,
        sellerId: item.product.sellerId,
        quantity: Number(item.quantity),
        unitPriceKurus: item.variant.priceKurus,
        stockQuantity: item.variant.stockQuantity,
        minOrderQty: item.product.minOrderQty,
        maxOrderQty: item.product.maxOrderQty,
        stepQty: item.product.stepQty,
      });
    }

    // Group by sellerId.
    const bySeller = new Map<string, typeof cart.items>();
    for (const item of cart.items) {
      const arr = bySeller.get(item.product.sellerId) ?? [];
      arr.push(item);
      bySeller.set(item.product.sellerId, arr);
    }

    const orderNumbers: string[] = [];
    const now = new Date();

    await ctx.prisma.$transaction(async (tx) => {
      for (const [sellerId, items] of bySeller) {
        const subtotal = items.reduce(
          (sum, it) => sum + it.priceSnapshotKurus * Number(it.quantity),
          0,
        );
        let shippingKurus = 0;
        let carrier: ShippingCarrier | null = null;

        if (input.fulfillmentMode === FulfillmentMode.SHIPPING) {
          if (!shippingAddress) throw new NotFoundError('Address', input.shippingAddressId);
          const serviceArea = await tx.serviceArea.findFirst({
            where: {
              sellerId,
              isActive: true,
              mode: FulfillmentMode.SHIPPING,
              OR: [
                { provinceCodes: { has: shippingAddress.provinceCode } },
                { districtIds: { has: shippingAddress.districtId } },
              ],
            },
            orderBy: [{ shippingFee: 'asc' }, { createdAt: 'asc' }],
          });
          if (!serviceArea) {
            throw new ConflictError('Seller does not ship to the selected address.', { sellerId });
          }
          if (subtotal < serviceArea.minOrderAmount) {
            throw new ConflictError('Seller minimum order amount is not met.', { sellerId });
          }
          shippingKurus =
            serviceArea.freeShippingOver != null && subtotal >= serviceArea.freeShippingOver
              ? 0
              : serviceArea.shippingFee;
          carrier = serviceArea.carrier;
        }

        if (input.fulfillmentMode === FulfillmentMode.PICKUP) {
          const pickupLocation = await tx.pickupLocation.findFirst({
            where: { id: input.pickupLocationId, sellerId, isActive: true },
            select: { id: true },
          });
          if (!pickupLocation) {
            throw new ConflictError('Pickup location is not available for this seller.', {
              sellerId,
            });
          }
        }

        const commission = computeCommission({
          subtotalKurus: kurus(Math.round(subtotal)),
          shippingKurus: kurus(shippingKurus),
          commissionBps: env.PLATFORM_COMMISSION_BPS,
        });

        const orderNumber = `SND-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
          now.getDate(),
        ).padStart(2, '0')}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

        const order = await tx.order.create({
          data: {
            orderNumber,
            buyerAccountId: ctx.principal.accountId,
            sellerId,
            status: OrderStatus.PENDING_PAYMENT,
            paymentStatus: PaymentStatus.PENDING,
            fulfillmentMode: input.fulfillmentMode,
            shippingAddressId: input.shippingAddressId,
            billingAddressId: input.billingAddressId ?? input.shippingAddressId,
            pickupLocationId: input.pickupLocationId,
            carrier,
            subtotalKurus: commission.subtotalKurus,
            shippingKurus: commission.shippingKurus,
            totalKurus: commission.buyerTotalKurus,
            platformFeeKurus: commission.platformFeeKurus,
            sellerNetKurus: commission.sellerNetKurus,
            buyerNotes: input.buyerNotes,
            items: {
              create: items.map((it) => ({
                productId: it.productId,
                variantId: it.variantId,
                productNameSnapshot: it.product.nameTr,
                variantNameSnapshot: it.variant.nameTr,
                unit: it.variant.unit,
                quantity: it.quantity,
                unitPriceKurus: it.priceSnapshotKurus,
                totalKurus: Math.round(it.priceSnapshotKurus * Number(it.quantity)),
              })),
            },
            events: {
              create: {
                type: OrderEventType.CREATED,
                toStatus: OrderStatus.PENDING_PAYMENT,
                actorId: ctx.principal.accountId,
              },
            },
          },
        });

        for (const item of items) {
          const updated = await tx.productVariant.updateMany({
            where: {
              id: item.variantId,
              isActive: true,
              stockQuantity: { gte: item.quantity },
            },
            data: { stockQuantity: { decrement: item.quantity } },
          });
          if (updated.count !== 1) {
            throw new ConflictError('Insufficient stock.', { variantId: item.variantId });
          }
        }

        orderNumbers.push(order.orderNumber);
      }

      // Clear the cart atomically with order creation.
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    });

    return { orderNumbers };
  }),

  cancel: protectedProcedure.input(cancelOrderInput).mutation(async ({ ctx, input }) => {
    const order = await ctx.prisma.order.findUnique({
      where: { id: input.orderId },
      include: { items: true },
    });
    if (!order) throw new NotFoundError('Order');
    if (order.buyerAccountId !== ctx.principal.accountId) throw new NotFoundError('Order');
    if (
      order.status !== OrderStatus.PENDING_PAYMENT &&
      order.status !== OrderStatus.PAID &&
      order.status !== OrderStatus.AWAITING_FULFILLMENT
    ) {
      throw new ConflictError('Order cannot be cancelled at this stage.');
    }
    return ctx.prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stockQuantity: { increment: item.quantity } },
        });
      }

      return tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.CANCELLED,
          cancelledAt: new Date(),
          cancellationReason: input.reason,
          events: {
            create: {
              type: OrderEventType.CANCELLED,
              fromStatus: order.status,
              toStatus: OrderStatus.CANCELLED,
              actorId: ctx.principal.accountId,
            },
          },
        },
      });
    });
  }),

  // --- Seller ----------------------------------------------------------------
  listForSeller: sellerProcedure
    .input(
      z.object({
        status: z.array(z.nativeEnum(OrderStatus)).optional(),
        cursor: z.string().optional(),
        limit: z.number().int().min(1).max(50).default(25),
      }),
    )
    .query(async ({ ctx, input }) => {
      const seller = await ctx.prisma.sellerProfile.findUnique({
        where: { accountId: ctx.principal.accountId },
      });
      if (!seller) throw new NotFoundError('SellerProfile');
      const rows = await ctx.prisma.order.findMany({
        where: { sellerId: seller.id, ...(input.status ? { status: { in: input.status } } : {}) },
        orderBy: { placedAt: 'desc' },
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
        include: {
          buyer: { select: { profile: true, phone: true } },
          items: true,
          shippingAddress: true,
        },
      });
      const hasMore = rows.length > input.limit;
      return {
        items: hasMore ? rows.slice(0, -1) : rows,
        nextCursor: hasMore ? rows[rows.length - 2]!.id : null,
      };
    }),

  markShipped: sellerProcedure.input(markOrderShippedInput).mutation(async ({ ctx, input }) => {
    const seller = await ctx.prisma.sellerProfile.findUnique({
      where: { accountId: ctx.principal.accountId },
      select: { id: true },
    });
    if (!seller) throw new NotFoundError('SellerProfile');

    return ctx.prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({ where: { id: input.orderId } });
      if (!existing || existing.sellerId !== seller.id) {
        throw new NotFoundError('Order');
      }
      if (existing.fulfillmentMode !== FulfillmentMode.SHIPPING) {
        throw new ConflictError('Only shipping orders can be marked as shipped.');
      }
      if (
        existing.status !== OrderStatus.PAID &&
        existing.status !== OrderStatus.AWAITING_FULFILLMENT &&
        existing.status !== OrderStatus.IN_PREPARATION
      ) {
        throw new ConflictError('Order cannot be marked as shipped at this stage.');
      }

      const order = await tx.order.update({
        where: { id: input.orderId },
        data: {
          status: OrderStatus.SHIPPED,
          shippedAt: new Date(),
          carrier: input.carrier,
          trackingNumber: input.trackingNumber,
          events: {
            create: {
              type: OrderEventType.SHIPPED,
              fromStatus: existing.status,
              toStatus: OrderStatus.SHIPPED,
              actorId: ctx.principal.accountId,
            },
          },
        },
      });
      await tx.shipment.create({
        data: {
          orderId: order.id,
          carrier: input.carrier,
          trackingNumber: input.trackingNumber,
          shippedAt: new Date(),
          status: ShipmentStatus.IN_TRANSIT,
        },
      });
      return order;
    });
  }),

  createReview: protectedProcedure.input(createReviewInput).mutation(async ({ ctx, input }) => {
    const order = await ctx.prisma.order.findUnique({
      where: { id: input.orderId },
      select: { buyerAccountId: true, status: true, items: { select: { productId: true } } },
    });
    if (!order || order.buyerAccountId !== ctx.principal.accountId) {
      throw new NotFoundError('Order');
    }
    if (order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.COMPLETED) {
      throw new ConflictError('You can only review delivered orders.');
    }
    if (input.productId && !order.items.some((item) => item.productId === input.productId)) {
      throw new NotFoundError('Product', input.productId);
    }
    return ctx.prisma.review.create({
      data: {
        orderId: input.orderId,
        productId: input.productId ?? null,
        authorId: ctx.principal.accountId,
        rating: input.rating,
        title: input.title,
        body: input.body,
      },
    });
  }),
});
