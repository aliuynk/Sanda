import type { Kurus } from './money';
import { addKurus, applyBps, kurus, subtractKurus } from './money';

/**
 * Commission model.
 *
 * The platform retains a commission expressed in basis points on the
 * merchandise subtotal (not on shipping). Shipping is passed through to the
 * seller net-of-nothing because it is their cost.
 *
 * Why subtotal-only: if we take commission on shipping, we penalise sellers
 * for shipping to distant buyers, which encourages them to hide shipping cost
 * in product price — bad for transparency.
 */
export interface CommissionInput {
  subtotalKurus: Kurus;
  shippingKurus: Kurus;
  discountKurus?: Kurus;
  commissionBps: number;
  /** Optional cap in kuruş (e.g. never take more than 100 TRY per order). */
  commissionCapKurus?: Kurus;
  /** Optional floor (useful for very small orders). */
  commissionFloorKurus?: Kurus;
}

export interface CommissionBreakdown {
  subtotalKurus: Kurus;
  discountKurus: Kurus;
  commissionableKurus: Kurus;
  shippingKurus: Kurus;
  platformFeeKurus: Kurus;
  sellerNetKurus: Kurus;
  buyerTotalKurus: Kurus;
}

export function computeCommission(input: CommissionInput): CommissionBreakdown {
  const discountKurus = input.discountKurus ?? kurus(0);
  const commissionable = subtractKurus(input.subtotalKurus, discountKurus);
  let fee = applyBps(commissionable, input.commissionBps);

  if (input.commissionCapKurus != null && fee > input.commissionCapKurus) {
    fee = input.commissionCapKurus;
  }
  if (input.commissionFloorKurus != null && fee < input.commissionFloorKurus) {
    fee = input.commissionFloorKurus;
  }

  const sellerNet = addKurus(subtractKurus(commissionable, fee), input.shippingKurus);
  const buyerTotal = addKurus(commissionable, input.shippingKurus);

  return {
    subtotalKurus: input.subtotalKurus,
    discountKurus,
    commissionableKurus: commissionable,
    shippingKurus: input.shippingKurus,
    platformFeeKurus: fee,
    sellerNetKurus: sellerNet,
    buyerTotalKurus: buyerTotal,
  };
}
