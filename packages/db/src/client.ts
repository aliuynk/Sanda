import { PrismaClient } from '@prisma/client';

/**
 * The Prisma client is a heavyweight singleton. In development we cache it on
 * globalThis so that hot reload does not open a new pool on every edit.
 */
declare global {
  // eslint-disable-next-line no-var
  var __sandaPrisma: PrismaClient | undefined;
}

const logLevels =
  process.env.NODE_ENV === 'production'
    ? (['error', 'warn'] as const)
    : (['query', 'error', 'warn'] as const);

export const prisma: PrismaClient =
  globalThis.__sandaPrisma ??
  new PrismaClient({
    log: [...logLevels],
    errorFormat: 'pretty',
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__sandaPrisma = prisma;
}

export type Prisma = typeof prisma;
