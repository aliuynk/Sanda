import type { Route } from 'next';

/** Build `/kesfet` query strings while omitting empty keys. */
export function kesfetUrl(entries: Record<string, string | undefined | null>): Route {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(entries)) {
    if (v != null && v !== '') u.set(k, v);
  }
  const q = u.toString();
  return (q ? `/kesfet?${q}` : '/kesfet') as Route;
}
