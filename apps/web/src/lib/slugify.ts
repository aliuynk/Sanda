const TURKISH_MAP: Record<string, string> = {
  ç: 'c',
  Ç: 'c',
  ğ: 'g',
  Ğ: 'g',
  ı: 'i',
  İ: 'i',
  ö: 'o',
  Ö: 'o',
  ş: 's',
  Ş: 's',
  ü: 'u',
  Ü: 'u',
};

/**
 * Turn a free-form label into a URL slug that passes the Zod `slug` schema:
 *   lowercase, latin, digits, hyphen-separated, 3–80 chars.
 */
export function slugifyTr(input: string): string {
  if (!input) return '';
  const mapped = Array.from(input)
    .map((ch) => TURKISH_MAP[ch] ?? ch)
    .join('')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  return mapped
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
