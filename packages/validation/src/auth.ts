import { z } from 'zod';

import { email, nonEmptyTrimmed, turkishPhoneE164 } from './common';

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
