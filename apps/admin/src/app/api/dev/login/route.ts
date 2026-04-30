import { prisma } from '@sanda/db';
import { UserRole, UserStatus } from '@sanda/db/types';
import { NextResponse } from 'next/server';

import {
  ACCESS_TOKEN_TTL_SECONDS,
  cookieNames,
  issueSession,
} from '@/server/auth';

const DEMO_ADMIN_PHONE = '+905550000001';
const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;

/**
 * Development-only login route that bootstraps an admin account if missing
 * and issues a session cookie. Intentionally rejected in production.
 */
export async function GET(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const url = new URL(req.url);
  const next = url.searchParams.get('next') || '/';

  const account = await prisma.account.upsert({
    where: { phone: DEMO_ADMIN_PHONE },
    update: { status: UserStatus.ACTIVE, roles: { set: [UserRole.ADMIN, UserRole.BUYER] } },
    create: {
      phone: DEMO_ADMIN_PHONE,
      phoneVerifiedAt: new Date(),
      status: UserStatus.ACTIVE,
      roles: [UserRole.ADMIN, UserRole.BUYER],
      termsAcceptedAt: new Date(),
      termsVersion: '1.0',
      profile: {
        create: {
          firstName: 'Sanda',
          lastName: 'Operatör',
          displayName: 'Sanda Ops',
        },
      },
    },
    select: { id: true },
  });

  const { accessToken, refreshToken } = await issueSession(account.id);
  const response = NextResponse.redirect(new URL(next, url));

  response.cookies.set(cookieNames.session, accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: ACCESS_TOKEN_TTL_SECONDS,
  });

  response.cookies.set(cookieNames.refresh, refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: REFRESH_TOKEN_TTL_SECONDS,
  });

  return response;
}
