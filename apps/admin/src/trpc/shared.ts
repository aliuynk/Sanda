import type { AppRouter } from '@sanda/api/client';
import { createTRPCReact } from '@trpc/react-query';
import superjson from 'superjson';

export const trpc = createTRPCReact<AppRouter>();

export const transformer = superjson;

export function getBaseUrl(): string {
  if (typeof window !== 'undefined') return '';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  const port = process.env.ADMIN_PORT ?? '3001';
  return process.env.NEXT_PUBLIC_ADMIN_URL ?? `http://localhost:${port}`;
}
