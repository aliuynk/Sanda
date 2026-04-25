import type { AppRouter } from '@sanda/api/client';
import { createTRPCReact } from '@trpc/react-query';
import superjson from 'superjson';

export const trpc = createTRPCReact<AppRouter>();

export const transformer = superjson;

export function getBaseUrl(): string {
  if (typeof window !== 'undefined') return '';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}
