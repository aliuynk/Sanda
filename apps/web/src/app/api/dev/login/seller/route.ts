import { prisma } from '@sanda/db';
import { NextResponse } from 'next/server';

import {
  ACCESS_TOKEN_TTL_SECONDS,
  cookieNames,
  issueSession,
} from '@/server/auth';

const DEMO_SELLER_PHONE = '+905551112233';
const REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;

export async function GET(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const url = new URL(req.url);
  const next = url.searchParams.get('next') || '/satici';

  const account = await prisma.account.findUnique({
    where: { phone: DEMO_SELLER_PHONE },
    select: { id: true },
  });

  if (!account) {
    return NextResponse.json(
      {
        error:
          'Demo seller account not found. Run `pnpm db:seed` first.',
      },
      { status: 404 },
    );
  }

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
