import { CertificationStatus, CertificationType } from '@sanda/db/types';
import { z } from 'zod';

import { nonEmptyTrimmed, uuid } from './common';

export const certificationTypeSchema = z.nativeEnum(CertificationType);
export const certificationStatusSchema = z.nativeEnum(CertificationStatus);

export const uploadCertificationInput = z
  .object({
    sellerId: uuid,
    type: certificationTypeSchema,
    issuer: nonEmptyTrimmed('issuer', 160),
    certificateNumber: nonEmptyTrimmed('certificate_number', 80),
    scopeDescription: z.string().trim().max(400).optional(),
    issuedAt: z.coerce.date(),
    expiresAt: z.coerce.date(),
    documentUrl: z.string().url(),
    documentChecksum: z.string().regex(/^[a-f0-9]{64}$/u).optional(),
    appliesToProductIds: z.array(uuid).max(200).default([]),
  })
  .refine((v) => v.expiresAt > v.issuedAt, {
    path: ['expiresAt'],
    message: 'errors.cert.expires_after_issued',
  });
export type UploadCertificationInput = z.infer<typeof uploadCertificationInput>;

export const reviewCertificationInput = z.object({
  certificationId: uuid,
  decision: z.enum(['verify', 'reject']),
  verificationMethod: z.enum(['MANUAL_ADMIN', 'REGISTRY_LOOKUP', 'QR_CODE', 'API_CHECK']).optional(),
  rejectionReason: z.string().trim().max(500).optional(),
});
export type ReviewCertificationInput = z.infer<typeof reviewCertificationInput>;
