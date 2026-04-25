import { ForbiddenError, NotFoundError } from '@sanda/core';
import { CertificationStatus } from '@sanda/db/types';
import { reviewCertificationInput, uploadCertificationInput } from '@sanda/validation';

import { adminProcedure, router, sellerProcedure } from '../trpc';

export const certificationRouter = router({
  list: sellerProcedure.query(async ({ ctx }) => {
    const seller = await ctx.prisma.sellerProfile.findUnique({
      where: { accountId: ctx.principal.accountId },
    });
    if (!seller) throw new NotFoundError('SellerProfile');
    return ctx.prisma.certification.findMany({
      where: { sellerId: seller.id },
      orderBy: { createdAt: 'desc' },
    });
  }),

  upload: sellerProcedure.input(uploadCertificationInput).mutation(async ({ ctx, input }) => {
    const seller = await ctx.prisma.sellerProfile.findUnique({
      where: { accountId: ctx.principal.accountId },
    });
    if (!seller) throw new NotFoundError('SellerProfile');
    if (seller.id !== input.sellerId) throw new ForbiddenError('cert.upload');

    const { appliesToProductIds, ...rest } = input;

    return ctx.prisma.$transaction(async (tx) => {
      const cert = await tx.certification.create({
        data: {
          ...rest,
          status: CertificationStatus.PENDING_REVIEW,
        },
      });
      if (appliesToProductIds.length > 0) {
        await tx.productCertification.createMany({
          data: appliesToProductIds.map((productId) => ({
            productId,
            certificationId: cert.id,
          })),
          skipDuplicates: true,
        });
      }
      return cert;
    });
  }),

  // --- Admin/moderator review ------------------------------------------------
  review: adminProcedure.input(reviewCertificationInput).mutation(async ({ ctx, input }) => {
    const cert = await ctx.prisma.certification.findUnique({
      where: { id: input.certificationId },
    });
    if (!cert) throw new NotFoundError('Certification');

    const newStatus =
      input.decision === 'verify'
        ? CertificationStatus.VERIFIED
        : CertificationStatus.REJECTED;

    return ctx.prisma.certification.update({
      where: { id: cert.id },
      data: {
        status: newStatus,
        verifiedAt: input.decision === 'verify' ? new Date() : null,
        verifiedBy: input.decision === 'verify' ? ctx.principal.accountId : null,
        verificationMethod: input.verificationMethod ?? 'MANUAL_ADMIN',
        rejectionReason: input.decision === 'reject' ? input.rejectionReason : null,
      },
    });
  }),
});
