import { logger } from '@sanda/core';
import { Worker } from 'bullmq';

import { processCertVerification } from './processors/cert-verification';
import { processOtp } from './processors/otp';
import { processPayout } from './processors/payouts';
import { processShipmentPoll } from './processors/shipment-tracking';
import { connection } from './queues';

const log = logger.child({ service: 'worker' });

const workers = [
  new Worker('notifications', processOtp, { connection, concurrency: 10 }),
  new Worker('cert-verify', processCertVerification, { connection, concurrency: 2 }),
  new Worker('payouts', processPayout, { connection, concurrency: 2 }),
  new Worker('shipment-tracking', processShipmentPoll, { connection, concurrency: 5 }),
];

for (const worker of workers) {
  worker.on('completed', (job) =>
    log.info({ queue: worker.name, jobId: job.id }, 'Job completed'),
  );
  worker.on('failed', (job, err) =>
    log.error({ queue: worker.name, jobId: job?.id, err }, 'Job failed'),
  );
}

log.info('Workers started.');

async function shutdown(signal: string) {
  log.info({ signal }, 'Shutting down workers…');
  await Promise.allSettled(workers.map((w) => w.close()));
  await connection.quit();
  process.exit(0);
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
