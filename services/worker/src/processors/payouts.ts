import { logger } from '@sanda/core';
import { prisma } from '@sanda/db';
import type { Job } from 'bullmq';

interface PayoutJob {
  payoutId: string;
}

/**
 * Schedule → process → pay a seller payout. The real money movement uses
 * iyzico submerchant API: iyzico holds balances from buyer payments and we
 * instruct them to settle to the submerchant.
 */
export async function processPayout(job: Job<PayoutJob>) {
  const log = logger.child({ module: 'payouts', id: job.data.payoutId });
  const payout = await prisma.payout.findUnique({ where: { id: job.data.payoutId } });
  if (!payout) return;
  if (payout.status !== 'SCHEDULED') {
    log.warn({ status: payout.status }, 'Payout already processed.');
    return;
  }
  // TODO: call iyzico submerchant settlement.
  await prisma.payout.update({
    where: { id: payout.id },
    data: { status: 'PROCESSING' },
  });
  log.info('Payout moved to PROCESSING.');
}
