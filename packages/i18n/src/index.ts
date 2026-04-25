import { en } from './locales/en';
import { tr } from './locales/tr';

export const DEFAULT_LOCALE = 'tr' as const;
export const SUPPORTED_LOCALES = ['tr', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const dictionaries = { tr, en } as const;

export type Dictionary = typeof tr;

/** Resolve a translation by dotted key, with optional interpolation. */
export function translate(
  locale: Locale,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const dict = dictionaries[locale] as unknown as Record<string, unknown>;
  const parts = key.split('.');
  let node: unknown = dict;
  for (const part of parts) {
    if (node && typeof node === 'object' && part in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }
  if (typeof node !== 'string') return key;
  if (!vars) return node;
  return node.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? `{${k}}`));
}

export { en, tr };
