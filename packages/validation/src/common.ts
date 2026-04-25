import { z } from 'zod';

/**
 * Shared primitive validators used across every module.
 */

export const uuid = z.string().uuid({ message: 'errors.uuid' });

/**
 * Turkish mobile phone in E.164 format. The input is normalised upstream so
 * that we only accept `+90XXXXXXXXXX`. This deliberately forbids national
 * formats like `0555 111 22 33` — normalise before validating.
 */
export const turkishPhoneE164 = z
  .string()
  .regex(/^\+90(5\d{9})$/u, { message: 'errors.phone.turkish_e164' });

export const email = z.string().email({ message: 'errors.email' }).toLowerCase();

/** Integer representing minor currency unit (kuruş for TRY). Never negative. */
export const moneyKurus = z.number().int().nonnegative({ message: 'errors.money.nonnegative' });

export const nonEmptyTrimmed = (label: string, max = 255) =>
  z
    .string({ required_error: `errors.${label}.required` })
    .trim()
    .min(1, { message: `errors.${label}.required` })
    .max(max, { message: `errors.${label}.too_long` });

export const optionalText = (max = 2000) => z.string().trim().max(max).optional().nullable();

/** Slugs used in URLs: lowercase, dashes, no diacritics. */
export const slug = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u, { message: 'errors.slug' })
  .min(3)
  .max(80);

/** Turkish national ID (TC Kimlik) with the official checksum algorithm. */
export const tcKimlikNo = z
  .string()
  .regex(/^\d{11}$/u, { message: 'errors.tckn.format' })
  .refine(isValidTcKimlik, { message: 'errors.tckn.checksum' });

/** Turkish IBAN format (`TR` + 24 digits) plus mod-97 check. */
export const turkishIban = z
  .string()
  .transform((v) => v.replace(/\s+/g, '').toUpperCase())
  .pipe(
    z
      .string()
      .regex(/^TR\d{24}$/u, { message: 'errors.iban.format' })
      .refine(isValidIbanMod97, { message: 'errors.iban.checksum' }),
  );

/** Vergi Kimlik Numarası (corporate tax id) — 10 digits. */
export const vergiNo = z.string().regex(/^\d{10}$/u, { message: 'errors.vergino' });

export const paginationInput = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(24),
});

export type PaginationInput = z.infer<typeof paginationInput>;

// ---------------------------------------------------------------------------
// Algorithms
// ---------------------------------------------------------------------------

/** Official TC Kimlik No validation algorithm. */
export function isValidTcKimlik(value: string): boolean {
  if (!/^\d{11}$/.test(value)) return false;
  if (value.startsWith('0')) return false;
  const digits = value.split('').map(Number) as number[];
  const oddSum = digits[0]! + digits[2]! + digits[4]! + digits[6]! + digits[8]!;
  const evenSum = digits[1]! + digits[3]! + digits[5]! + digits[7]!;
  const tenth = (oddSum * 7 - evenSum) % 10;
  if (tenth !== digits[9]) return false;
  const first10Sum = digits.slice(0, 10).reduce((a, b) => a + b, 0);
  return first10Sum % 10 === digits[10];
}

/** ISO 13616 (IBAN mod-97) check. */
export function isValidIbanMod97(iban: string): boolean {
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const numeric = rearranged
    .split('')
    .map((ch) => {
      const code = ch.charCodeAt(0);
      if (code >= 48 && code <= 57) return ch;
      if (code >= 65 && code <= 90) return String(code - 55);
      return '';
    })
    .join('');
  // Compute mod 97 piecewise to avoid BigInt cost.
  let remainder = 0;
  for (let i = 0; i < numeric.length; i += 7) {
    const chunk = String(remainder) + numeric.slice(i, i + 7);
    remainder = Number(chunk) % 97;
  }
  return remainder === 1;
}
