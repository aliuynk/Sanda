import 'server-only';

import { appRouter, createContext } from '@sanda/api';
import { cookies, headers } from 'next/headers';

import { verifyAccessToken } from '@/server/auth';

/**
 * Server-side tRPC caller. Use in React Server Components to execute
 * procedures without an HTTP hop. The principal is resolved from cookies.
 */
export async function getServerTrpc() {
  const cookieStore = await cookies();
  const hdr = await headers();
  const token = cookieStore.get('sanda_session')?.value;
  const principal = token ? await verifyAccessToken(token) : null;
  const ctx = createContext({
    headers: hdr,
    principal,
    ip: hdr.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
    requestId: hdr.get('x-request-id') ?? crypto.randomUUID(),
  });
  return appRouter.createCaller(ctx);
}
