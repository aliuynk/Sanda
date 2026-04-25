import { prisma } from '@sanda/db';
import type { UserRole } from '@sanda/db/types';

export interface SessionPrincipal {
  accountId: string;
  roles: UserRole[];
  sessionId: string;
}

export interface CreateContextOptions {
  headers: Headers;
  principal: SessionPrincipal | null;
  ip: string | null;
  requestId: string;
}

export interface Context {
  prisma: typeof prisma;
  principal: SessionPrincipal | null;
  ip: string | null;
  requestId: string;
  headers: Headers;
}

/**
 * Build a tRPC request context. Authentication resolution is the caller's
 * responsibility (Next.js route, Express adapter, etc.) — this module only
 * exposes the plumbing so that every transport builds the same object shape.
 */
export function createContext(opts: CreateContextOptions): Context {
  return {
    prisma,
    principal: opts.principal,
    ip: opts.ip,
    requestId: opts.requestId,
    headers: opts.headers,
  };
}
