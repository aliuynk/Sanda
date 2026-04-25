import { describe, expect, it } from 'vitest';

import { addKurus, applyBps, kurus, liraToKurus, splitKurus } from '../money';

describe('money', () => {
  it('converts lira to kuruş with rounding', () => {
    expect(liraToKurus(10)).toBe(1000);
    expect(liraToKurus(10.005)).toBe(1001);
    expect(liraToKurus(10.994)).toBe(1099);
  });

  it('adds kuruş integers', () => {
    expect(addKurus(kurus(100), kurus(250), kurus(1))).toBe(351);
  });

  it('applies bps with banker rounding', () => {
    // 10 % of 1000 kurus = 100
    expect(applyBps(kurus(1000), 1000)).toBe(100);
    // 1000 bps of 1 kurus rounds to 0 (banker: remainder < half)
    expect(applyBps(kurus(1), 1000)).toBe(0);
    // 1 bp of 1_000_000 = 100
    expect(applyBps(kurus(1_000_000), 1)).toBe(100);
  });

  it('splits kurus preserving sum', () => {
    const parts = splitKurus(kurus(1000), [1, 1, 1]);
    expect(parts).toEqual([334, 333, 333]);
    expect(parts.reduce((a, b) => a + b, 0)).toBe(1000);

    const parts2 = splitKurus(kurus(1237), [5, 3, 2]);
    expect(parts2.reduce((a, b) => a + b, 0)).toBe(1237);
  });
});
