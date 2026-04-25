/**
 * Turkey-specific helpers. Intentionally minimal and static; full province +
 * district data lives in the database. We keep only constants here that
 * application code needs at compile time.
 */

export const TURKEY_ISO = 'TR';
export const TURKEY_PHONE_COUNTRY_CODE = '+90';

/**
 * Normalise a user-entered phone string into E.164. Accepts:
 *   - "0555 111 22 33"
 *   - "555 111 22 33"
 *   - "+90 555 111 22 33"
 *   - "905551112233"
 *   - "5551112233"
 */
export function normaliseTurkishPhone(raw: string): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[^\d+]/g, '');
  let rest: string;
  if (digits.startsWith('+90')) rest = digits.slice(3);
  else if (digits.startsWith('90') && digits.length === 12) rest = digits.slice(2);
  else if (digits.startsWith('0') && digits.length === 11) rest = digits.slice(1);
  else if (digits.length === 10 && digits.startsWith('5')) rest = digits;
  else return null;

  if (!/^5\d{9}$/.test(rest)) return null;
  return `+90${rest}`;
}

/**
 * Compute Turkish KDV (VAT) on a tax-exclusive amount. The rates below are
 * the current 2024 values; consult your accountant before changing anything.
 *
 * Note: KDV on most fresh agricultural products is 1 % while packaged/
 * processed goods vary (10 % or 20 %). Rate assignment is a product-level
 * catalog decision, not a global setting.
 */
export const KDV_RATES = {
  fresh_produce: 1,
  staples: 10,
  standard: 20,
} as const;

export type KdvRateKey = keyof typeof KDV_RATES;

/** Mask a TC Kimlik No for safe display: 12345678901 -> 123****8901. */
export function maskTcKimlik(tckn: string): string {
  if (tckn.length !== 11) return '***';
  return `${tckn.slice(0, 3)}****${tckn.slice(7)}`;
}

/** Mask an IBAN for safe display: TR330006100519786457841326 -> TR33**********841326. */
export function maskIban(iban: string): string {
  if (iban.length < 10) return '***';
  return `${iban.slice(0, 4)}${'*'.repeat(iban.length - 10)}${iban.slice(-6)}`;
}
