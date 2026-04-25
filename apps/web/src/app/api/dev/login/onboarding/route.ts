import { prisma } from '@sanda/db';
import { UserRole, UserStatus } from '@sanda/db/types';
import { NextResponse } from 'next/server';

import { ACCESS_TOKEN_TTL_SECONDS, cookieNames, issueSession } from '@/server/auth';

const DEMO_ONBOARDING_PHONE = '+905559990011';
const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;

export async function GET(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const url = new URL(req.url);
  const next = url.searchParams.get('next') || '/sat/basla';

  const account = await prisma.account.upsert({
    where: { phone: DEMO_ONBOARDING_PHONE },
    update: {
      status: UserStatus.ACTIVE,
      roles: [UserRole.BUYER],
      phoneVerifiedAt: new Date(),
      termsAcceptedAt: new Date(),
      termsVersion: '1.0',
    },
    create: {
      phone: DEMO_ONBOARDING_PHONE,
      phoneVerifiedAt: new Date(),
      status: UserStatus.ACTIVE,
      roles: [UserRole.BUYER],
      termsAcceptedAt: new Date(),
      termsVersion: '1.0',
      profile: {
        create: {
          firstName: 'Onboarding',
          lastName: 'Test',
          displayName: 'Onboarding Test',
        },
      },
    },
    select: { id: true },
  });

  const existingSeller = await prisma.sellerProfile.findUnique({
    where: { accountId: account.id },
    select: { id: true },
  });

  if (existingSeller) {
    await prisma.sellerProfile.delete({
      where: { accountId: account.id },
    });
  }

  await prisma.account.update({
    where: { id: account.id },
    data: {
      roles: [UserRole.BUYER],
    },
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
