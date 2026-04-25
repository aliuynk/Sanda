import {
  computeCommission,
  ConflictError,
  getServerEnv,
  kurus,
  NotFoundError,
  PaymentError,
} from '@sanda/core';
import {
  FulfillmentMode,
  OrderEventType,
  OrderStatus,
  PaymentStatus,
} from '@sanda/db/types';
import { cancelOrderInput, checkoutInput, createReviewInput, markOrderShippedInput } from '@sanda/validation';
import { z } from 'zod';

import { protectedProcedure, router, sellerProcedure } from '../trpc';

/**
 * Multi-seller cart checkout.
 *
 * We split the cart into N Orders by sellerId, each with its own payment
 * intent. This keeps escrow, shipping, and disputes clean. The payment
 * provider (iyzico submerchant) returns a top-level charge which we link to
 * the N payments via a shared `providerRef`.
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
    const env = getServerEnv();
    const cart = await ctx.prisma.cart.findUnique({
      where: { accountId: ctx.principal.accountId },
      include: { items: { include: { variant: true, product: true } } },
    });
    if (!cart || cart.items.length === 0) {
      throw new ConflictError('Cart is empty.');
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
        // Shipping quote: the real service-area resolver is called in the
        // web/api layer before checkout; here we read the selected option.
        // For this MVP we charge zero when pickup, else a flat rate.
        const shippingKurus =
          input.fulfillmentMode === FulfillmentMode.SHIPPING ? 4900 : 0;

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
              create: { type: OrderEventType.CREATED, toStatus: OrderStatus.PENDING_PAYMENT },
            },
          },
        });

        orderNumbers.push(order.orderNumber);
      }

      // Clear the cart atomically with order creation.
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    });

    // Payment intent creation happens in the payments router (webhook-driven).
    // This endpoint returns the order numbers so the client can redirect.
    if (input.paymentMethod === 'CREDIT_CARD' && !input.cardToken) {
      throw new PaymentError('Missing card token.');
    }

    return { orderNumbers };
  }),

  cancel: protectedProcedure.input(cancelOrderInput).mutation(async ({ ctx, input }) => {
    const order = await ctx.prisma.order.findUnique({ where: { id: input.orderId } });
    if (!order) throw new NotFoundError('Order');
    if (order.buyerAccountId !== ctx.principal.accountId) throw new NotFoundError('Order');
    if (
      order.status !== OrderStatus.PENDING_PAYMENT &&
      order.status !== OrderStatus.PAID &&
      order.status !== OrderStatus.AWAITING_FULFILLMENT
    ) {
      throw new ConflictError('Order cannot be cancelled at this stage.');
    }
    return ctx.prisma.order.update({
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
    return ctx.prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id: input.orderId },
        data: {
          status: OrderStatus.SHIPPED,
          shippedAt: new Date(),
          trackingNumber: input.trackingNumber,
          events: {
            create: {
              type: OrderEventType.SHIPPED,
              toStatus: OrderStatus.SHIPPED,
              actorId: ctx.principal.accountId,
            },
          },
        },
      });
      await tx.shipment.create({
        data: {
          orderId: order.id,
          carrier: order.carrier ?? 'CUSTOM',
          trackingNumber: input.trackingNumber,
          shippedAt: new Date(),
          status: 'IN_TRANSIT',
        },
      });
      return order;
    });
  }),

  createReview: protectedProcedure.input(createReviewInput).mutation(async ({ ctx, input }) => {
    const order = await ctx.prisma.order.findUnique({
      where: { id: input.orderId },
      select: { buyerAccountId: true, status: true },
    });
    if (!order || order.buyerAccountId !== ctx.principal.accountId) {
      throw new NotFoundError('Order');
    }
    if (order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.COMPLETED) {
      throw new ConflictError('You can only review delivered orders.');
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
