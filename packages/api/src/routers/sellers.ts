import { ConflictError, ForbiddenError, NotFoundError } from '@sanda/core';
import { SellerKind, SellerStatus, UserRole } from '@sanda/db/types';
import {
  sellerFarmProfileInput,
  sellerLegalInfoInput,
  startSellerOnboardingInput,
  submitSellerForReviewInput,
  upsertServiceAreaInput,
} from '@sanda/validation';
import { z } from 'zod';

import { guardedProcedure, protectedProcedure, router, sellerProcedure } from '../trpc';

export const sellerRouter = router({
  bySlug: guardedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const seller = await ctx.prisma.sellerProfile.findUnique({
        where: { slug: input.slug },
        include: {
          media: true,
          certifications: { where: { status: 'VERIFIED' } },
          serviceAreas: { where: { isActive: true } },
          products: {
            where: { status: 'ACTIVE' },
            take: 12,
            include: {
              media: { take: 1, orderBy: { sortOrder: 'asc' } },
              variants: { where: { isActive: true }, orderBy: { priceKurus: 'asc' }, take: 1 },
            },
          },
        },
      });
      if (!seller || seller.status !== SellerStatus.APPROVED) {
        throw new NotFoundError('Seller', input.slug);
      }
      return seller;
    }),

  list: guardedProcedure
    .input(
      z.object({
        cursor: z.string().optional(),
        limit: z.number().int().min(1).max(48).default(24),
        region: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const rows = await ctx.prisma.sellerProfile.findMany({
        where: { status: SellerStatus.APPROVED },
        orderBy: [{ ratingAverage: 'desc' }, { createdAt: 'desc' }],
        take: input.limit + 1,
        ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
        include: {
          media: { take: 1 },
        },
      });
      const hasMore = rows.length > input.limit;
      const items = hasMore ? rows.slice(0, -1) : rows;
      return { items, nextCursor: hasMore ? items[items.length - 1]!.id : null };
    }),

  // --- Onboarding flow -------------------------------------------------------
  startOnboarding: protectedProcedure
    .input(startSellerOnboardingInput)
    .mutation(async ({ ctx, input }) => {
      const existingSlug = await ctx.prisma.sellerProfile.findUnique({
        where: { slug: input.slug },
      });
      if (existingSlug) throw new ConflictError('seller.slug.taken');

      return ctx.prisma.$transaction(async (tx) => {
        const seller = await tx.sellerProfile.upsert({
          where: { accountId: ctx.principal.accountId },
          update: { displayName: input.displayName, slug: input.slug, kind: input.kind },
          create: {
            accountId: ctx.principal.accountId,
            slug: input.slug,
            displayName: input.displayName,
            kind: input.kind,
            contactPhone: input.contactPhone,
            contactEmail: input.contactEmail,
            status: SellerStatus.DRAFT,
          },
        });
        // Ensure account has SELLER role.
        await tx.account.update({
          where: { id: ctx.principal.accountId },
          data: {
            roles: { set: [...new Set([...ctx.principal.roles, UserRole.SELLER])] },
          },
        });
        return seller;
      });
    }),

  saveLegalInfo: sellerProcedure
    .input(sellerLegalInfoInput)
    .mutation(async ({ ctx, input }) => {
      const { kind, ...rest } = input;
      // Real code encrypts nationalId/iban at rest via a KMS-wrapped DEK.
      return ctx.prisma.sellerProfile.update({
        where: { accountId: ctx.principal.accountId },
        data: { kind: kind as SellerKind, ...rest },
      });
    }),

  saveFarmProfile: sellerProcedure
    .input(sellerFarmProfileInput)
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.sellerProfile.update({
        where: { accountId: ctx.principal.accountId },
        data: input,
      });
    }),

  upsertServiceArea: sellerProcedure
    .input(upsertServiceAreaInput)
    .mutation(async ({ ctx, input }) => {
      const seller = await ctx.prisma.sellerProfile.findUnique({
        where: { accountId: ctx.principal.accountId },
      });
      if (!seller) throw new NotFoundError('SellerProfile');
      if (seller.id !== input.sellerId)
        throw new ForbiddenError('upsertServiceArea', { sellerId: input.sellerId });

      const { id, polygon: _polygon, ...rest } = input;
      if (id) {
        return ctx.prisma.serviceArea.update({
          where: { id },
          data: rest,
        });
      }
      return ctx.prisma.serviceArea.create({ data: rest });
    }),

  listMyServiceAreas: sellerProcedure.query(async ({ ctx }) => {
    const seller = await ctx.prisma.sellerProfile.findUnique({
      where: { accountId: ctx.principal.accountId },
    });
    if (!seller) throw new NotFoundError('SellerProfile');
    return ctx.prisma.serviceArea.findMany({
      where: { sellerId: seller.id },
      orderBy: { createdAt: 'asc' },
    });
  }),

  submitForReview: sellerProcedure
    .input(submitSellerForReviewInput)
    .mutation(async ({ ctx, input }) => {
      const seller = await ctx.prisma.sellerProfile.update({
        where: { id: input.sellerId, accountId: ctx.principal.accountId },
        data: { status: SellerStatus.PENDING_REVIEW },
      });
      // Admin notification would be fanned out here via the outbox.
      return seller;
    }),
});
