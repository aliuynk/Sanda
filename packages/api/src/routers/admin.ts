/**
 * Admin / operations router.
 *
 * This router is the backbone of the internal operations panel. Every endpoint
 * is gated behind `adminProcedure` (ADMIN | MODERATOR | SUPPORT).
 *
 * Design notes:
 *  - Read endpoints are deliberately broad (no per-tenant restriction) but
 *    paginated; write endpoints emit AuditEvent rows so ops actions are
 *    forensically traceable.
 *  - Status transitions on SellerProfile use explicit reason fields. We never
 *    hard-delete — soft state (suspended, rejected) preserves history.
 */
import { ConflictError, NotFoundError } from '@sanda/core';
import {
  CertificationStatus,
  OrderStatus,
  SellerStatus,
  UserStatus,
} from '@sanda/db/types';
import { z } from 'zod';

import { adminProcedure, router } from '../trpc';

const optionalCursor = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(25),
});

export const adminRouter = router({
  // ---------------------------------------------------------------------------
  // Dashboard — counts and very recent activity for the landing page.
  // ---------------------------------------------------------------------------
  stats: adminProcedure.query(async ({ ctx }) => {
    const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      sellersTotal,
      sellersPending,
      sellersApproved,
      sellersSuspended,
      certPending,
      certVerified,
      certExpiringIn30,
      ordersTotal,
      ordersOpen,
      ordersDisputed,
      orders7d,
      gmv30dAgg,
      buyers,
      productsActive,
      productsDraft,
    ] = await Promise.all([
      ctx.prisma.sellerProfile.count(),
      ctx.prisma.sellerProfile.count({ where: { status: SellerStatus.PENDING_REVIEW } }),
      ctx.prisma.sellerProfile.count({ where: { status: SellerStatus.APPROVED } }),
      ctx.prisma.sellerProfile.count({ where: { status: SellerStatus.SUSPENDED } }),
      ctx.prisma.certification.count({ where: { status: CertificationStatus.PENDING_REVIEW } }),
      ctx.prisma.certification.count({ where: { status: CertificationStatus.VERIFIED } }),
      ctx.prisma.certification.count({
        where: {
          status: CertificationStatus.VERIFIED,
          expiresAt: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
        },
      }),
      ctx.prisma.order.count(),
      ctx.prisma.order.count({
        where: {
          status: {
            in: [
              OrderStatus.PENDING_PAYMENT,
              OrderStatus.PAID,
              OrderStatus.AWAITING_FULFILLMENT,
              OrderStatus.IN_PREPARATION,
              OrderStatus.SHIPPED,
              OrderStatus.OUT_FOR_DELIVERY,
            ],
          },
        },
      }),
      ctx.prisma.order.count({ where: { status: OrderStatus.DISPUTED } }),
      ctx.prisma.order.count({ where: { placedAt: { gte: since7 } } }),
      ctx.prisma.order.aggregate({
        where: {
          placedAt: { gte: since30 },
          status: { in: [OrderStatus.DELIVERED, OrderStatus.COMPLETED, OrderStatus.SHIPPED] },
        },
        _sum: { totalKurus: true, platformFeeKurus: true },
      }),
      ctx.prisma.account.count({ where: { status: UserStatus.ACTIVE } }),
      ctx.prisma.product.count({ where: { status: 'ACTIVE' } }),
      ctx.prisma.product.count({ where: { status: 'DRAFT' } }),
    ]);

    return {
      sellers: {
        total: sellersTotal,
        pending: sellersPending,
        approved: sellersApproved,
        suspended: sellersSuspended,
      },
      certifications: {
        pending: certPending,
        verified: certVerified,
        expiringIn30: certExpiringIn30,
      },
      orders: {
        total: ordersTotal,
        open: ordersOpen,
        disputed: ordersDisputed,
        last7d: orders7d,
        gmv30dKurus: gmv30dAgg._sum.totalKurus ?? 0,
        commission30dKurus: gmv30dAgg._sum.platformFeeKurus ?? 0,
      },
      products: {
        active: productsActive,
        draft: productsDraft,
      },
      users: {
        active: buyers,
      },
    };
  }),

  recentActivity: adminProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(15) }))
    .query(async ({ ctx, input }) => {
      const [orders, sellers, certifications] = await Promise.all([
        ctx.prisma.order.findMany({
          orderBy: { createdAt: 'desc' },
          take: input.limit,
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalKurus: true,
            createdAt: true,
            placedAt: true,
            seller: { select: { displayName: true, slug: true } },
          },
        }),
        ctx.prisma.sellerProfile.findMany({
          orderBy: { createdAt: 'desc' },
          take: input.limit,
          select: {
            id: true,
            displayName: true,
            slug: true,
            status: true,
            kind: true,
            createdAt: true,
          },
        }),
        ctx.prisma.certification.findMany({
          orderBy: { createdAt: 'desc' },
          take: input.limit,
          select: {
            id: true,
            type: true,
            issuer: true,
            status: true,
            createdAt: true,
            seller: { select: { displayName: true, slug: true } },
          },
        }),
      ]);

      return { orders, sellers, certifications };
    }),

  // ---------------------------------------------------------------------------
  // Producer (seller) management.
  // ---------------------------------------------------------------------------
  sellers: router({
    list: adminProcedure
      .input(
        optionalCursor.extend({
          status: z.array(z.nativeEnum(SellerStatus)).optional(),
          search: z.string().optional(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const where = {
          ...(input.status && input.status.length > 0 ? { status: { in: input.status } } : {}),
          ...(input.search
            ? {
                OR: [
                  { displayName: { contains: input.search, mode: 'insensitive' as const } },
                  { slug: { contains: input.search, mode: 'insensitive' as const } },
                  { contactEmail: { contains: input.search, mode: 'insensitive' as const } },
                ],
              }
            : {}),
        };
        const rows = await ctx.prisma.sellerProfile.findMany({
          where,
          orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
          take: input.limit + 1,
          ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
          select: {
            id: true,
            slug: true,
            displayName: true,
            kind: true,
            status: true,
            createdAt: true,
            approvedAt: true,
            farmName: true,
            contactEmail: true,
            contactPhone: true,
            ratingAverage: true,
            productCount: true,
            orderCount: true,
            account: {
              select: {
                id: true,
                phone: true,
                email: true,
                profile: { select: { firstName: true, lastName: true } },
              },
            },
          },
        });
        const hasMore = rows.length > input.limit;
        return {
          items: hasMore ? rows.slice(0, -1) : rows,
          nextCursor: hasMore ? rows[rows.length - 2]!.id : null,
        };
      }),

    getById: adminProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const seller = await ctx.prisma.sellerProfile.findUnique({
          where: { id: input.id },
          include: {
            account: { include: { profile: true } },
            certifications: { orderBy: { createdAt: 'desc' } },
            serviceAreas: true,
            products: { take: 5, orderBy: { updatedAt: 'desc' } },
            payouts: { take: 5, orderBy: { createdAt: 'desc' } },
          },
        });
        if (!seller) throw new NotFoundError('SellerProfile', input.id);
        return seller;
      }),

    approve: adminProcedure
      .input(z.object({ id: z.string().uuid(), notes: z.string().max(500).optional() }))
      .mutation(async ({ ctx, input }) => {
        const seller = await ctx.prisma.sellerProfile.findUnique({ where: { id: input.id } });
        if (!seller) throw new NotFoundError('SellerProfile', input.id);
        if (seller.status === SellerStatus.APPROVED) {
          throw new ConflictError('Seller is already approved.');
        }
        return ctx.prisma.$transaction(async (tx) => {
          const updated = await tx.sellerProfile.update({
            where: { id: input.id },
            data: {
              status: SellerStatus.APPROVED,
              approvedAt: new Date(),
              suspendedAt: null,
              suspendedReason: null,
            },
          });
          await tx.auditEvent.create({
            data: {
              accountId: ctx.principal.accountId,
              actorRole: 'ADMIN',
              action: 'SELLER_APPROVED',
              entityType: 'SellerProfile',
              entityId: seller.id,
              before: { status: seller.status },
              after: { status: SellerStatus.APPROVED, notes: input.notes ?? null },
            },
          });
          return updated;
        });
      }),

    reject: adminProcedure
      .input(z.object({ id: z.string().uuid(), reason: z.string().min(3).max(500) }))
      .mutation(async ({ ctx, input }) => {
        const seller = await ctx.prisma.sellerProfile.findUnique({ where: { id: input.id } });
        if (!seller) throw new NotFoundError('SellerProfile', input.id);
        return ctx.prisma.$transaction(async (tx) => {
          const updated = await tx.sellerProfile.update({
            where: { id: input.id },
            data: {
              status: SellerStatus.REJECTED,
              suspendedAt: new Date(),
              suspendedReason: input.reason,
            },
          });
          await tx.auditEvent.create({
            data: {
              accountId: ctx.principal.accountId,
              actorRole: 'ADMIN',
              action: 'SELLER_REJECTED',
              entityType: 'SellerProfile',
              entityId: seller.id,
              before: { status: seller.status },
              after: { status: SellerStatus.REJECTED, reason: input.reason },
            },
          });
          return updated;
        });
      }),

    suspend: adminProcedure
      .input(z.object({ id: z.string().uuid(), reason: z.string().min(3).max(500) }))
      .mutation(async ({ ctx, input }) => {
        const seller = await ctx.prisma.sellerProfile.findUnique({ where: { id: input.id } });
        if (!seller) throw new NotFoundError('SellerProfile', input.id);
        return ctx.prisma.$transaction(async (tx) => {
          const updated = await tx.sellerProfile.update({
            where: { id: input.id },
            data: {
              status: SellerStatus.SUSPENDED,
              suspendedAt: new Date(),
              suspendedReason: input.reason,
            },
          });
          await tx.auditEvent.create({
            data: {
              accountId: ctx.principal.accountId,
              actorRole: 'ADMIN',
              action: 'SELLER_SUSPENDED',
              entityType: 'SellerProfile',
              entityId: seller.id,
              before: { status: seller.status },
              after: { status: SellerStatus.SUSPENDED, reason: input.reason },
            },
          });
          return updated;
        });
      }),

    reinstate: adminProcedure
      .input(z.object({ id: z.string().uuid() }))
      .mutation(async ({ ctx, input }) => {
        const seller = await ctx.prisma.sellerProfile.findUnique({ where: { id: input.id } });
        if (!seller) throw new NotFoundError('SellerProfile', input.id);
        return ctx.prisma.$transaction(async (tx) => {
          const updated = await tx.sellerProfile.update({
            where: { id: input.id },
            data: {
              status: SellerStatus.APPROVED,
              suspendedAt: null,
              suspendedReason: null,
              approvedAt: seller.approvedAt ?? new Date(),
            },
          });
          await tx.auditEvent.create({
            data: {
              accountId: ctx.principal.accountId,
              actorRole: 'ADMIN',
              action: 'SELLER_REINSTATED',
              entityType: 'SellerProfile',
              entityId: seller.id,
              before: { status: seller.status },
              after: { status: SellerStatus.APPROVED },
            },
          });
          return updated;
        });
      }),
  }),

  // ---------------------------------------------------------------------------
  // Certifications — review queue.
  // ---------------------------------------------------------------------------
  certifications: router({
    list: adminProcedure
      .input(
        optionalCursor.extend({
          status: z.array(z.nativeEnum(CertificationStatus)).optional(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const where = {
          ...(input.status && input.status.length > 0
            ? { status: { in: input.status } }
            : { status: { in: [CertificationStatus.PENDING_REVIEW] } }),
        };
        const rows = await ctx.prisma.certification.findMany({
          where,
          orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
          take: input.limit + 1,
          ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
          include: {
            seller: { select: { id: true, slug: true, displayName: true, kind: true } },
            products: {
              include: { product: { select: { id: true, slug: true, nameTr: true } } },
            },
          },
        });
        const hasMore = rows.length > input.limit;
        return {
          items: hasMore ? rows.slice(0, -1) : rows,
          nextCursor: hasMore ? rows[rows.length - 2]!.id : null,
        };
      }),

    getById: adminProcedure
      .input(z.object({ id: z.string().uuid() }))
      .query(async ({ ctx, input }) => {
        const cert = await ctx.prisma.certification.findUnique({
          where: { id: input.id },
          include: {
            seller: { include: { account: { include: { profile: true } } } },
            products: {
              include: {
                product: {
                  select: {
                    id: true,
                    slug: true,
                    nameTr: true,
                    media: { take: 1, orderBy: { sortOrder: 'asc' } },
                  },
                },
              },
            },
          },
        });
        if (!cert) throw new NotFoundError('Certification', input.id);
        return cert;
      }),
  }),

  // ---------------------------------------------------------------------------
  // Orders — read-only oversight.
  // ---------------------------------------------------------------------------
  orders: router({
    list: adminProcedure
      .input(
        optionalCursor.extend({
          status: z.array(z.nativeEnum(OrderStatus)).optional(),
          sellerId: z.string().uuid().optional(),
          search: z.string().optional(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const where = {
          ...(input.status && input.status.length > 0 ? { status: { in: input.status } } : {}),
          ...(input.sellerId ? { sellerId: input.sellerId } : {}),
          ...(input.search
            ? {
                OR: [
                  { orderNumber: { contains: input.search, mode: 'insensitive' as const } },
                  {
                    seller: {
                      displayName: { contains: input.search, mode: 'insensitive' as const },
                    },
                  },
                ],
              }
            : {}),
        };
        const rows = await ctx.prisma.order.findMany({
          where,
          orderBy: { placedAt: 'desc' },
          take: input.limit + 1,
          ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
          include: {
            seller: { select: { displayName: true, slug: true } },
            buyer: {
              select: {
                phone: true,
                email: true,
                profile: { select: { firstName: true, lastName: true } },
              },
            },
            items: { take: 1 },
          },
        });
        const hasMore = rows.length > input.limit;
        return {
          items: hasMore ? rows.slice(0, -1) : rows,
          nextCursor: hasMore ? rows[rows.length - 2]!.id : null,
        };
      }),
  }),

  // ---------------------------------------------------------------------------
  // Users.
  // ---------------------------------------------------------------------------
  users: router({
    list: adminProcedure
      .input(
        optionalCursor.extend({
          status: z.array(z.nativeEnum(UserStatus)).optional(),
          search: z.string().optional(),
        }),
      )
      .query(async ({ ctx, input }) => {
        const where = {
          ...(input.status && input.status.length > 0 ? { status: { in: input.status } } : {}),
          ...(input.search
            ? {
                OR: [
                  { phone: { contains: input.search } },
                  { email: { contains: input.search, mode: 'insensitive' as const } },
                  {
                    profile: {
                      OR: [
                        { firstName: { contains: input.search, mode: 'insensitive' as const } },
                        { lastName: { contains: input.search, mode: 'insensitive' as const } },
                      ],
                    },
                  },
                ],
              }
            : {}),
        };
        const rows = await ctx.prisma.account.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: input.limit + 1,
          ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
          include: {
            profile: true,
            sellerProfile: { select: { id: true, slug: true, displayName: true, status: true } },
          },
        });
        const hasMore = rows.length > input.limit;
        return {
          items: hasMore ? rows.slice(0, -1) : rows,
          nextCursor: hasMore ? rows[rows.length - 2]!.id : null,
        };
      }),
  }),

  // ---------------------------------------------------------------------------
  // Categories — read + simple sort/visibility toggle.
  // ---------------------------------------------------------------------------
  categories: router({
    listTree: adminProcedure.query(async ({ ctx }) => {
      return ctx.prisma.category.findMany({
        orderBy: [{ sortOrder: 'asc' }, { nameTr: 'asc' }],
        include: {
          children: { orderBy: { sortOrder: 'asc' } },
          _count: { select: { products: true } },
        },
        where: { parentId: null },
      });
    }),
  }),
});
