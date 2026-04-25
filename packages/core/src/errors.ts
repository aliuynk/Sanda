/**
 * Domain errors. These map cleanly onto HTTP/tRPC error codes at the edge,
 * but inside the domain we keep them as typed subclasses so that business
 * logic never leaks a stack trace with a vague `Error` wrapper.
 */

export type ErrorCode =
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION'
  | 'RATE_LIMITED'
  | 'PAYMENT_FAILED'
  | 'INTEGRATION'
  | 'INTERNAL';

export class DomainError extends Error {
  readonly code: ErrorCode;
  override readonly cause?: unknown;
  readonly context?: Record<string, unknown>;

  constructor(
    code: ErrorCode,
    message: string,
    options: { cause?: unknown; context?: Record<string, unknown> } = {},
  ) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.cause = options.cause;
    this.context = options.context;
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, id?: string) {
    super('NOT_FOUND', id ? `${entity} not found: ${id}` : `${entity} not found`, {
      context: { entity, id },
    });
    this.name = 'NotFoundError';
  }
}

export class ForbiddenError extends DomainError {
  constructor(action: string, context?: Record<string, unknown>) {
    super('FORBIDDEN', `Not allowed: ${action}`, { context });
    this.name = 'ForbiddenError';
  }
}

export class UnauthenticatedError extends DomainError {
  constructor(message = 'Authentication required') {
    super('UNAUTHENTICATED', message);
    this.name = 'UnauthenticatedError';
  }
}

export class ConflictError extends DomainError {
  constructor(message: string, context?: Record<string, unknown>) {
    super('CONFLICT', message, { context });
    this.name = 'ConflictError';
  }
}

export class ValidationError extends DomainError {
  constructor(
    message: string,
    public readonly issues: Array<{ path: (string | number)[]; message: string }>,
  ) {
    super('VALIDATION', message, { context: { issues } });
    this.name = 'ValidationError';
  }
}

export class RateLimitedError extends DomainError {
  constructor(public readonly retryAfterSec: number, reason: string) {
    super('RATE_LIMITED', reason, { context: { retryAfterSec } });
    this.name = 'RateLimitedError';
  }
}

export class PaymentError extends DomainError {
  constructor(message: string, context?: Record<string, unknown>) {
    super('PAYMENT_FAILED', message, { context });
    this.name = 'PaymentError';
  }
}
