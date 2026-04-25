import { logger } from '@sanda/core';
import type { Job } from 'bullmq';

interface ShipmentJob {
  shipmentId: string;
}

export async function processShipmentPoll(job: Job<ShipmentJob>) {
  const log = logger.child({ module: 'shipment-track', id: job.data.shipmentId });
  // TODO: poll carrier API (Yurtiçi / MNG / Aras / PTT), persist ShipmentEvent.
  log.debug('Shipment polling tick');
}
