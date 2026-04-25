import pino from 'pino';

const isProd = process.env.NODE_ENV === 'production';

/**
 * Shared structured logger. In development we pretty-print so that local
 * tailing is pleasant; in production we emit JSON for log aggregation.
 *
 * Child loggers should be created per-module with `logger.child({module:'x'})`
 * so that every log line carries a discriminator.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isProd ? 'info' : 'debug'),
  base: { service: 'sanda' },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      '*.password',
      '*.passwordHash',
      '*.cardNumber',
      '*.cvv',
      '*.iban',
      '*.nationalId',
      '*.tcKimlikNo',
    ],
    censor: '[REDACTED]',
  },
  ...(isProd
    ? {}
    : {
        transport: {
          target: 'pino/file',
          options: { destination: 1 },
        },
      }),
});

export type Logger = typeof logger;
