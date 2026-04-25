import { getServerEnv } from '@sanda/core';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

/**
 * Centralised queue wiring. Any module that needs to enqueue a job imports
 * a queue from here — never instantiate a new Queue elsewhere.
 */
const env = getServerEnv();

export const connection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

export const queues = {
  /** Send SMS/email OTPs and other one-shot messages. */
  notifications: new Queue('notifications', { connection }),
  /** Verify uploaded certifications against external registries. */
  certificationVerification: new Queue('cert-verify', { connection }),
  /** Schedule seller payouts via iyzico submerchant API. */
  payouts: new Queue('payouts', { connection }),
  /** Poll kargo carriers for shipment updates. */
  shipmentTracking: new Queue('shipment-tracking', { connection }),
  /** Push-notification fan-out. */
  push: new Queue('push', { connection }),
  /** Reindex search indices (Meilisearch). */
  searchIndex: new Queue('search-index', { connection }),
} as const;

export type QueueName = keyof typeof queues;
