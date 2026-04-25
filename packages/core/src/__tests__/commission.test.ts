import { describe, expect, it } from 'vitest';

import { computeCommission } from '../commission';
import { kurus } from '../money';

describe('computeCommission', () => {
  it('retains 10% of subtotal and passes shipping through', () => {
    const r = computeCommission({
      subtotalKurus: kurus(10_000),
      shippingKurus: kurus(4_900),
      commissionBps: 1000,
    });
    expect(r.platformFeeKurus).toBe(1000);
    expect(r.sellerNetKurus).toBe(10_000 - 1000 + 4900);
    expect(r.buyerTotalKurus).toBe(10_000 + 4900);
  });

  it('honours cap and floor', () => {
    const r = computeCommission({
      subtotalKurus: kurus(1_000_000),
      shippingKurus: kurus(0),
      commissionBps: 1000,
      commissionCapKurus: kurus(50_000),
    });
    expect(r.platformFeeKurus).toBe(50_000);

    const r2 = computeCommission({
      subtotalKurus: kurus(500),
      shippingKurus: kurus(0),
      commissionBps: 1000,
      commissionFloorKurus: kurus(1000),
    });
    expect(r2.platformFeeKurus).toBe(1000);
  });

  it('deducts discounts before commission', () => {
    const r = computeCommission({
      subtotalKurus: kurus(10_000),
      discountKurus: kurus(2_000),
      shippingKurus: kurus(0),
      commissionBps: 1000,
    });
    expect(r.commissionableKurus).toBe(8_000);
    expect(r.platformFeeKurus).toBe(800);
  });
});
