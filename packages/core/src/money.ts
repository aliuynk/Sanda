/**
 * Money helpers. Internally every value is an integer number of kuruş
 * (1 TRY = 100 kuruş). Arithmetic on doubles is forbidden across the app
 * because float rounding at scale has cost real marketplaces real money.
 */

export type Kurus = number & { readonly __brand: 'kurus' };

const LIRA_TO_KURUS = 100;

export function kurus(value: number): Kurus {
  if (!Number.isInteger(value)) {
    throw new Error(`kurus() requires an integer, got ${value}`);
  }
  return value as Kurus;
}

export function liraToKurus(lira: number): Kurus {
  return kurus(Math.round(lira * LIRA_TO_KURUS));
}

export function kurusToLira(value: Kurus): number {
  return value / LIRA_TO_KURUS;
}

export function addKurus(...values: Kurus[]): Kurus {
  return kurus(values.reduce((a, b) => a + b, 0));
}

export function subtractKurus(a: Kurus, b: Kurus): Kurus {
  return kurus(a - b);
}

/**
 * Multiply a kuruş value by basis points (1 bp = 0.01 %) with banker's rounding.
 * Used for commission and tax calculations where we need precision guarantees.
 */
export function applyBps(value: Kurus, bps: number): Kurus {
  const bigValue = BigInt(value) * BigInt(bps);
  const divisor = 10_000n;
  const quotient = bigValue / divisor;
  const remainder = bigValue - quotient * divisor;
  // Banker's rounding: on an exact .5 (remainder == divisor/2), round to even.
  const half = divisor / 2n;
  let rounded = quotient;
  if (remainder > half) rounded += 1n;
  else if (remainder === half) rounded += quotient % 2n === 0n ? 0n : 1n;
  return kurus(Number(rounded));
}

/** Distribute `total` across `weights` preserving the sum exactly (no kuruş lost). */
export function splitKurus(total: Kurus, weights: number[]): Kurus[] {
  if (weights.length === 0) return [];
  const weightSum = weights.reduce((a, b) => a + b, 0);
  if (weightSum === 0) return weights.map(() => kurus(0));
  const raw = weights.map((w) => (total * w) / weightSum);
  const floored = raw.map((v) => Math.floor(v));
  let leftover = total - floored.reduce((a, b) => a + b, 0);
  // Assign leftover kuruş to the items with the largest fractional part first.
  const order = raw
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);
  for (let k = 0; leftover > 0 && k < order.length; k += 1) {
    const o = order[k];
    if (!o) break;
    const idx = o.i;
    const cur = floored[idx];
    if (cur === undefined) break;
    floored[idx] = cur + 1;
    leftover -= 1;
  }
  return floored.map((v) => kurus(v));
}
