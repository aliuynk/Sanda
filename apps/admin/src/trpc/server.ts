import 'server-only';

import { appRouter, createContext } from '@sanda/api';
import { cookies, headers } from 'next/headers';

import { cookieNames, verifyAccessToken } from '@/server/auth';

export async function getServerTrpc() {
  const cookieStore = await cookies();
  const hdr = await headers();
  const token = cookieStore.get(cookieNames.session)?.value;
  const principal = token ? await verifyAccessToken(token) : null;
  const ctx = createContext({
    headers: hdr,
    principal,
    ip: hdr.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
    requestId: hdr.get('x-request-id') ?? crypto.randomUUID(),
  });
  return appRouter.createCaller(ctx);
}

export async function getCurrentPrincipal() {
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieNames.session)?.value;
  return token ? await verifyAccessToken(token) : null;
}
