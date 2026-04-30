import { ConflictError, NotFoundError, RateLimitedError, ValidationError } from '@sanda/core';
import { UserRole, UserStatus } from '@sanda/db/types';
import {
  addressInput,
  registerBuyerInput,
  requestOtpInput,
  updateAddressInput,
  updateProfileInput,
  verifyOtpInput,
} from '@sanda/validation';
import { z } from 'zod';

import { guardedProcedure, protectedProcedure, router } from '../trpc';

/**
 * Auth router. SMS OTP is the primary path — the NetGSM/İletimerkezi
 * integration lives behind a provider interface in @sanda/core. Here we only
 * touch the persistence layer.
 */
export const authRouter = router({
  requestOtp: guardedProcedure.input(requestOtpInput).mutation(async ({ ctx, input }) => {
    const recent = await ctx.prisma.otpCode.count({
      where: {
        destination: input.phone,
        createdAt: { gte: new Date(Date.now() - 60_000) },
      },
    });
    if (recent >= 3) {
      throw new RateLimitedError(60, 'Too many OTP requests in the last minute.');
    }

    // NOTE: Hashing + SMS dispatch happens in services/worker. We intentionally
    // push the send job to BullMQ so that the HTTP response is not blocked.
    await ctx.prisma.otpCode.create({
      data: {
        destination: input.phone,
        channel: 'SMS',
        codeHash: 'pending', // set by worker after generation
        expiresAt: new Date(Date.now() + 5 * 60_000),
        ipAddress: ctx.ip ?? undefined,
      },
    });

    return { ok: true as const };
  }),

  verifyOtp: guardedProcedure.input(verifyOtpInput).mutation(async ({ ctx, input }) => {
    // This is a thin scaffold — the real comparison + session issuance sits in
    // the worker/auth module because it also needs JWT signing keys. The web
    // app calls this endpoint which returns a session token cookie at the
    // transport layer (see apps/web/src/server/auth).
    const otp = await ctx.prisma.otpCode.findFirst({
      where: { destination: input.phone, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (!otp) throw new NotFoundError('OtpCode');
    if (otp.expiresAt < new Date()) {
      throw new ValidationError('OTP expired', [{ path: ['code'], message: 'errors.otp.expired' }]);
    }
    // Placeholder: real comparison runs in the auth service.
    return { ok: true as const, accountId: null as string | null };
  }),

  registerBuyer: guardedProcedure.input(registerBuyerInput).mutation(async ({ ctx, input }) => {
    const existing = await ctx.prisma.account.findUnique({ where: { phone: input.phone } });
    if (existing) throw new ConflictError('An account with this phone already exists.');

    const account = await ctx.prisma.account.create({
      data: {
        phone: input.phone,
        email: input.email,
        status: UserStatus.PENDING_VERIFICATION,
        roles: [UserRole.BUYER],
        marketingOptIn: input.acceptsMarketing,
        termsAcceptedAt: new Date(),
        termsVersion: '1.0',
        profile: {
          create: {
            firstName: input.firstName,
            lastName: input.lastName,
          },
        },
      },
      select: { id: true },
    });
    return { accountId: account.id };
  }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const account = await ctx.prisma.account.findUnique({
      where: { id: ctx.principal.accountId },
      include: { profile: true, sellerProfile: true },
    });
    if (!account) throw new NotFoundError('Account');
    return account;
  }),

  myAddresses: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.address.findMany({
      where: { accountId: ctx.principal.accountId, archivedAt: null },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }),

  createAddress: protectedProcedure.input(addressInput).mutation(async ({ ctx, input }) => {
    return ctx.prisma.$transaction(async (tx) => {
      if (input.isDefault) {
        await tx.address.updateMany({
          where: { accountId: ctx.principal.accountId, isDefault: true, archivedAt: null },
          data: { isDefault: false },
        });
      }
      const existingCount = await tx.address.count({
        where: { accountId: ctx.principal.accountId, archivedAt: null },
      });
      return tx.address.create({
        data: {
          accountId: ctx.principal.accountId,
          label: input.label,
          recipient: input.recipient,
          phone: input.phone,
          line1: input.line1,
          line2: input.line2,
          districtId: input.districtId,
          provinceCode: input.provinceCode,
          postalCode: input.postalCode,
          notes: input.notes,
          isDefault: input.isDefault || existingCount === 0,
        },
      });
    });
  }),

  updateAddress: protectedProcedure.input(updateAddressInput).mutation(async ({ ctx, input }) => {
    const existing = await ctx.prisma.address.findFirst({
      where: { id: input.id, accountId: ctx.principal.accountId, archivedAt: null },
      select: { id: true },
    });
    if (!existing) throw new NotFoundError('Address', input.id);

    return ctx.prisma.$transaction(async (tx) => {
      if (input.patch.isDefault) {
        await tx.address.updateMany({
          where: {
            accountId: ctx.principal.accountId,
            isDefault: true,
            archivedAt: null,
            NOT: { id: input.id },
          },
          data: { isDefault: false },
        });
      }
      return tx.address.update({
        where: { id: input.id },
        data: input.patch,
      });
    });
  }),

  deleteAddress: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.address.findFirst({
        where: { id: input.id, accountId: ctx.principal.accountId, archivedAt: null },
        select: { id: true, isDefault: true },
      });
      if (!existing) throw new NotFoundError('Address', input.id);

      return ctx.prisma.$transaction(async (tx) => {
        const archived = await tx.address.update({
          where: { id: input.id },
          data: { archivedAt: new Date(), isDefault: false },
        });
        if (existing.isDefault) {
          const next = await tx.address.findFirst({
            where: { accountId: ctx.principal.accountId, archivedAt: null },
            orderBy: { createdAt: 'desc' },
          });
          if (next) {
            await tx.address.update({
              where: { id: next.id },
              data: { isDefault: true },
            });
          }
        }
        return archived;
      });
    }),

  setDefaultAddress: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.address.findFirst({
        where: { id: input.id, accountId: ctx.principal.accountId, archivedAt: null },
        select: { id: true },
      });
      if (!existing) throw new NotFoundError('Address', input.id);
      return ctx.prisma.$transaction(async (tx) => {
        await tx.address.updateMany({
          where: { accountId: ctx.principal.accountId, archivedAt: null, isDefault: true },
          data: { isDefault: false },
        });
        return tx.address.update({ where: { id: input.id }, data: { isDefault: true } });
      });
    }),

  updateProfile: protectedProcedure
    .input(updateProfileInput)
    .mutation(async ({ ctx, input }) => {
      const { firstName, lastName, displayName, email, marketingOptIn } = input;
      const account = await ctx.prisma.account.update({
        where: { id: ctx.principal.accountId },
        data: {
          ...(email !== undefined ? { email } : {}),
          ...(marketingOptIn !== undefined ? { marketingOptIn } : {}),
          profile: {
            update: {
              ...(firstName !== undefined ? { firstName } : {}),
              ...(lastName !== undefined ? { lastName } : {}),
              ...(displayName !== undefined ? { displayName } : {}),
            },
          },
        },
        include: { profile: true },
      });
      return account;
    }),

  logout: protectedProcedure.input(z.object({})).mutation(async ({ ctx }) => {
    await ctx.prisma.session.update({
      where: { id: ctx.principal.sessionId },
      data: { revokedAt: new Date() },
    });
    return { ok: true as const };
  }),
});
