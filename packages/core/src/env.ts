import { z } from 'zod';

/**
 * Runtime environment parsing. Fail fast at boot if anything is missing.
 * Apps should import {@link getServerEnv} from this module, not read
 * `process.env` directly.
 */
const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),
  REDIS_URL: z.string().url(),

  NEXTAUTH_SECRET: z.string().min(16),
  NEXTAUTH_URL: z.string().url(),

  SMS_OTP_TTL_SECONDS: z.coerce.number().int().positive().default(300),
  SMS_OTP_LENGTH: z.coerce.number().int().min(4).max(8).default(6),
  SMS_PROVIDER: z.enum(['netgsm', 'iletimerkezi', 'mock']).default('mock'),
  SMS_PROVIDER_API_KEY: z.string().optional(),
  SMS_PROVIDER_API_SECRET: z.string().optional(),
  SMS_PROVIDER_SENDER_ID: z.string().default('SANDA'),

  S3_ENDPOINT: z.string().url(),
  S3_REGION: z.string().default('auto'),
  S3_BUCKET: z.string(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_PUBLIC_BASE_URL: z.string().url(),

  MEILI_HOST: z.string().url(),
  MEILI_MASTER_KEY: z.string().optional(),

  IYZICO_API_KEY: z.string().optional(),
  IYZICO_SECRET_KEY: z.string().optional(),
  IYZICO_BASE_URL: z.string().url().default('https://sandbox-api.iyzipay.com'),
  PLATFORM_COMMISSION_BPS: z.coerce.number().int().min(0).max(10_000).default(1_000),

  SENTRY_DSN: z.string().optional(),
  POSTHOG_KEY: z.string().optional(),
  POSTHOG_HOST: z.string().url().default('https://eu.posthog.com'),

  EMAIL_FROM: z.string().default('Sanda <no-reply@sanda.tr>'),
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().int().default(1025),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  FEATURE_FARM_VISITS: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  FEATURE_SUBSCRIPTION_BOXES: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  FEATURE_B2B: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
});

export type ServerEnv = z.infer<typeof serverSchema>;

let cached: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cached) return cached;
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.') || '<root>'}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid server environment:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}

/** Client-side env is validated separately (only NEXT_PUBLIC_* is safe). */
const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
});

export type ClientEnv = z.infer<typeof clientSchema>;

export function getClientEnv(): ClientEnv {
  const parsed = clientSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  });
  if (!parsed.success) throw new Error('Invalid public environment.');
  return parsed.data;
}
