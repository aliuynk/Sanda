import { DomainError } from '@sanda/core';
import { UserRole } from '@sanda/db/types';
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';

import type { Context } from './context';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    const cause = error.cause;
    if (cause instanceof ZodError) {
      return {
        ...shape,
        data: {
          ...shape.data,
          code: 'BAD_REQUEST',
          zodIssues: cause.flatten(),
        },
      };
    }
    if (cause instanceof DomainError) {
      return {
        ...shape,
        data: {
          ...shape.data,
          domainCode: cause.code,
          context: cause.context,
        },
      };
    }
    return shape;
  },
});

export const router = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;

const domainErrorMapper: Record<string, TRPCError['code']> = {
  UNAUTHENTICATED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  VALIDATION: 'BAD_REQUEST',
  RATE_LIMITED: 'TOO_MANY_REQUESTS',
  PAYMENT_FAILED: 'BAD_REQUEST',
  INTEGRATION: 'INTERNAL_SERVER_ERROR',
  INTERNAL: 'INTERNAL_SERVER_ERROR',
};

const rethrowDomainErrors = middleware(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error instanceof DomainError) {
      throw new TRPCError({
        code: domainErrorMapper[error.code] ?? 'INTERNAL_SERVER_ERROR',
        message: error.message,
        cause: error,
      });
    }
    throw error;
  }
});

const requireAuth = middleware(async ({ ctx, next }) => {
  if (!ctx.principal) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Authentication required.' });
  }
  return next({ ctx: { ...ctx, principal: ctx.principal } });
});

const requireRole = (...roles: UserRole[]) =>
  middleware(async ({ ctx, next }) => {
    if (!ctx.principal) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    const ok = ctx.principal.roles.some((r) => roles.includes(r));
    if (!ok) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Insufficient role.' });
    }
    return next({ ctx: { ...ctx, principal: ctx.principal } });
  });

export const protectedProcedure = t.procedure.use(rethrowDomainErrors).use(requireAuth);

export const sellerProcedure = t.procedure
  .use(rethrowDomainErrors)
  .use(requireRole(UserRole.SELLER, UserRole.ADMIN));

export const adminProcedure = t.procedure
  .use(rethrowDomainErrors)
  .use(requireRole(UserRole.ADMIN, UserRole.MODERATOR, UserRole.SUPPORT));

export const guardedProcedure = t.procedure.use(rethrowDomainErrors);
