import type { SessionPrincipal } from '@sanda/api';
import { getServerEnv } from '@sanda/core';
import { prisma } from '@sanda/db';
import { jwtVerify, SignJWT } from 'jose';

/**
 * Admin app auth — same JWT secret as the web app, separate cookie + audience
 * so a leaked admin cookie doesn't grant buyer access (and vice-versa).
 */

const SESSION_COOKIE = 'sanda_admin_session';
const REFRESH_COOKIE = 'sanda_admin_refresh';
const ACCESS_TTL_SEC = 15 * 60;

let signingKey: Uint8Array | null = null;
function getSigningKey(): Uint8Array {
  if (signingKey) return signingKey;
  const env = getServerEnv();
  signingKey = new TextEncoder().encode(env.NEXTAUTH_SECRET);
  return signingKey;
}

export async function signAccessToken(principal: SessionPrincipal): Promise<string> {
  const key = getSigningKey();
  return new SignJWT({ roles: principal.roles, sid: principal.sessionId })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(principal.accountId)
    .setIssuer('sanda')
    .setAudience('sanda-admin')
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TTL_SEC}s`)
    .sign(key);
}

export async function verifyAccessToken(token: string): Promise<SessionPrincipal | null> {
  try {
    const { payload } = await jwtVerify(token, getSigningKey(), {
      issuer: 'sanda',
      audience: 'sanda-admin',
    });
    if (!payload.sub || !Array.isArray(payload.roles) || typeof payload.sid !== 'string') {
      return null;
    }
    return {
      accountId: payload.sub,
      roles: payload.roles as SessionPrincipal['roles'],
      sessionId: payload.sid,
    };
  } catch {
    return null;
  }
}

export async function issueSession(accountId: string): Promise<{
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}> {
  const account = await prisma.account.findUniqueOrThrow({
    where: { id: accountId },
    select: { roles: true },
  });
  const refreshTokenId = crypto.randomUUID();
  const session = await prisma.session.create({
    data: {
      accountId,
      refreshTokenId,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  const principal: SessionPrincipal = {
    accountId,
    roles: account.roles,
    sessionId: session.id,
  };
  const accessToken = await signAccessToken(principal);
  return { accessToken, refreshToken: refreshTokenId, sessionId: session.id };
}

export const cookieNames = {
  session: SESSION_COOKIE,
  refresh: REFRESH_COOKIE,
} as const;

export const ACCESS_TOKEN_TTL_SECONDS = ACCESS_TTL_SEC;
