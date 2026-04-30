import { z } from 'zod';

import { email, nonEmptyTrimmed, turkishPhoneE164, uuid } from './common';

export const requestOtpInput = z.object({
  phone: turkishPhoneE164,
  purpose: z.enum(['login', 'register', 'verify_phone']).default('login'),
});
export type RequestOtpInput = z.infer<typeof requestOtpInput>;

export const verifyOtpInput = z.object({
  phone: turkishPhoneE164,
  code: z.string().regex(/^\d{4,8}$/u, { message: 'errors.otp.format' }),
});
export type VerifyOtpInput = z.infer<typeof verifyOtpInput>;

export const emailLoginInput = z.object({
  email,
  password: z.string().min(8, { message: 'errors.password.too_short' }).max(128),
});
export type EmailLoginInput = z.infer<typeof emailLoginInput>;

export const registerBuyerInput = z.object({
  phone: turkishPhoneE164,
  firstName: nonEmptyTrimmed('first_name', 80),
  lastName: nonEmptyTrimmed('last_name', 80),
  email: email.optional(),
  acceptsTerms: z.literal(true, {
    errorMap: () => ({ message: 'errors.terms.required' }),
  }),
  acceptsMarketing: z.boolean().default(false),
});
export type RegisterBuyerInput = z.infer<typeof registerBuyerInput>;

export const sessionIdInput = z.object({ sessionId: z.string().uuid() });

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export const updateProfileInput = z.object({
  firstName: z.string().trim().min(1).max(80).optional(),
  lastName: z.string().trim().min(1).max(80).optional(),
  displayName: z.string().trim().min(1).max(120).optional().nullable(),
  email: email.optional(),
  marketingOptIn: z.boolean().optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileInput>;

// ---------------------------------------------------------------------------
// Addresses
// ---------------------------------------------------------------------------

const addressShape = {
  label: z.string().trim().max(40).optional().nullable(),
  recipient: nonEmptyTrimmed('recipient', 120),
  phone: turkishPhoneE164,
  line1: nonEmptyTrimmed('address_line', 240),
  line2: z.string().trim().max(240).optional().nullable(),
  districtId: z.number().int().positive(),
  provinceCode: z
    .string()
    .regex(/^\d{2}$/u, { message: 'errors.province.code' }),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/u, { message: 'errors.postal_code' })
    .optional()
    .nullable(),
  notes: z.string().trim().max(400).optional().nullable(),
  isDefault: z.boolean().default(false),
};

export const addressInput = z.object(addressShape);
export type AddressInput = z.infer<typeof addressInput>;

const addressPatchShape = {
  ...addressShape,
  isDefault: z.boolean().optional(),
};
export const updateAddressInput = z.object({
  id: uuid,
  patch: z.object(addressPatchShape).partial(),
});
export type UpdateAddressInput = z.infer<typeof updateAddressInput>;
