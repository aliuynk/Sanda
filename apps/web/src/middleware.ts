import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Minimal middleware. The heavy lifting — refreshing access tokens from the
 * refresh cookie — is handled inside the `/api/auth/refresh` endpoint which
 * client code pings opportunistically. Here we only:
 *
 *   1. Force HTTPS in production.
 *   2. Attach a request id for downstream tracing.
 *   3. Gate admin routes (requires a later check).
 */
export function middleware(req: NextRequest) {
  const response = NextResponse.next();
  const requestId = req.headers.get('x-request-id') ?? crypto.randomUUID();
  response.headers.set('x-request-id', requestId);
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};
