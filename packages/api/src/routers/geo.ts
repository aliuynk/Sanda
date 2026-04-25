import { createAddressInput } from '@sanda/validation';
import { z } from 'zod';

import { guardedProcedure, protectedProcedure, router } from '../trpc';

export const geoRouter = router({
  provinces: guardedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.province.findMany({
      orderBy: { nameTr: 'asc' },
      select: { id: true, code: true, nameTr: true, nameEn: true, region: true },
    });
  }),

  districts: guardedProcedure
    .input(z.object({ provinceId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.district.findMany({
        where: { provinceId: input.provinceId },
        orderBy: { nameTr: 'asc' },
        select: { id: true, nameTr: true, provinceId: true },
      });
    }),

  myAddresses: protectedProcedure.query(async ({ ctx }) => {
    return ctx.prisma.address.findMany({
      where: { accountId: ctx.principal.accountId, archivedAt: null },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      include: { district: { include: { province: true } } },
    });
  }),

  createAddress: protectedProcedure.input(createAddressInput).mutation(async ({ ctx, input }) => {
    if (input.isDefault) {
      await ctx.prisma.address.updateMany({
        where: { accountId: ctx.principal.accountId, isDefault: true },
        data: { isDefault: false },
      });
    }
    return ctx.prisma.address.create({
      data: { ...input, accountId: ctx.principal.accountId },
    });
  }),
});
