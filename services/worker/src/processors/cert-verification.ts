import { logger } from '@sanda/core';
import { prisma } from '@sanda/db';
import type { Job } from 'bullmq';

interface CertJob {
  certificationId: string;
}

/**
 * Certification verification pipeline.
 *
 * Today the verification is a human-in-the-loop review. The job exists so
 * that as soon as we wire the Tarım Bakanlığı / ETKO / ECOCERT APIs we can
 * auto-verify a subset without changing the upstream contract.
 */
export async function processCertVerification(job: Job<CertJob>) {
  const log = logger.child({ module: 'cert-verify', id: job.data.certificationId });
  const cert = await prisma.certification.findUnique({
    where: { id: job.data.certificationId },
  });
  if (!cert) {
    log.warn('Certification disappeared before verification.');
    return;
  }
  // TODO: plug registry lookup here. For now we enqueue an admin-review task.
  log.info('Certification queued for admin review.');
}
