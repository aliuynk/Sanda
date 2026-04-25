import { SellerKind } from '@sanda/db/types';
import { z } from 'zod';

import {
  email,
  nonEmptyTrimmed,
  optionalText,
  slug,
  tcKimlikNo,
  turkishIban,
  turkishPhoneE164,
  uuid,
  vergiNo,
} from './common';

export const sellerKindSchema = z.nativeEnum(SellerKind);

/**
 * Step 1 of seller onboarding: public identity.
 * Kept deliberately small so that we can create the row and let the user
 * fill other steps asynchronously.
 */
export const startSellerOnboardingInput = z.object({
  displayName: nonEmptyTrimmed('display_name', 120),
  slug,
  kind: sellerKindSchema,
  contactPhone: turkishPhoneE164,
  contactEmail: email.optional(),
});
export type StartSellerOnboardingInput = z.infer<typeof startSellerOnboardingInput>;

/** Step 2: legal & tax details. Branches by seller kind. */
export const sellerLegalInfoInput = z
  .discriminatedUnion('kind', [
    z.object({
      kind: z.literal(SellerKind.INDIVIDUAL_FARMER),
      nationalId: tcKimlikNo,
      ciftciKayitNumber: z
        .string()
        .regex(/^\d{5,20}$/u, { message: 'errors.cks.format' })
        .optional(),
      iban: turkishIban,
      ibanHolder: nonEmptyTrimmed('iban_holder', 120),
    }),
    z.object({
      kind: z.literal(SellerKind.REGISTERED_FARMER),
      nationalId: tcKimlikNo,
      ciftciKayitNumber: z.string().regex(/^\d{5,20}$/u, { message: 'errors.cks.format' }),
      taxNumber: vergiNo,
      taxOffice: nonEmptyTrimmed('tax_office', 120),
      iban: turkishIban,
      ibanHolder: nonEmptyTrimmed('iban_holder', 120),
    }),
    z.object({
      kind: z.literal(SellerKind.SMALL_BUSINESS),
      taxNumber: vergiNo,
      taxOffice: nonEmptyTrimmed('tax_office', 120),
      iban: turkishIban,
      ibanHolder: nonEmptyTrimmed('iban_holder', 120),
    }),
    z.object({
      kind: z.literal(SellerKind.COOPERATIVE),
      taxNumber: vergiNo,
      taxOffice: nonEmptyTrimmed('tax_office', 120),
      tradeRegistryNumber: nonEmptyTrimmed('trade_registry', 40).optional(),
      iban: turkishIban,
      ibanHolder: nonEmptyTrimmed('iban_holder', 120),
    }),
    z.object({
      kind: z.literal(SellerKind.COMPANY),
      taxNumber: vergiNo,
      taxOffice: nonEmptyTrimmed('tax_office', 120),
      tradeRegistryNumber: nonEmptyTrimmed('trade_registry', 40),
      mersisNumber: z.string().regex(/^\d{16}$/u, { message: 'errors.mersis' }).optional(),
      iban: turkishIban,
      ibanHolder: nonEmptyTrimmed('iban_holder', 120),
    }),
  ])
  .describe('sellerLegalInfoInput');
export type SellerLegalInfoInput = z.infer<typeof sellerLegalInfoInput>;

/** Step 3: farm story & visitation rules. */
export const sellerFarmProfileInput = z.object({
  farmName: nonEmptyTrimmed('farm_name', 120),
  tagline: optionalText(160),
  story: optionalText(4000),
  farmSize: z.number().nonnegative().optional(),
  foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  allowsFarmVisits: z.boolean().default(false),
  farmVisitNotes: optionalText(500),
  farmAddressLine: nonEmptyTrimmed('address', 240),
  farmDistrictId: z.number().int().positive(),
  websiteUrl: z.string().url().max(240).optional(),
  instagramHandle: z
    .string()
    .regex(/^[A-Za-z0-9._]{1,30}$/u, { message: 'errors.instagram' })
    .optional(),
});
export type SellerFarmProfileInput = z.infer<typeof sellerFarmProfileInput>;

export const updateSellerInput = z.object({
  sellerId: uuid,
  patch: sellerFarmProfileInput.partial(),
});

export const submitSellerForReviewInput = z.object({ sellerId: uuid });
