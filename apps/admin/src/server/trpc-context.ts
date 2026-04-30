import { type Context, createContext as createBaseContext } from '@sanda/api';
import type { NextRequest } from 'next/server';

import { cookieNames, verifyAccessToken } from './auth';

export async function createTrpcContext(req: NextRequest): Promise<Context> {
  const token = req.cookies.get(cookieNames.session)?.value;
  const principal = token ? await verifyAccessToken(token) : null;
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    null;
  return createBaseContext({
    headers: req.headers,
    principal,
    ip,
    requestId: req.headers.get('x-request-id') ?? crypto.randomUUID(),
  });
}
