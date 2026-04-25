import type { FulfillmentMode, ShippingCarrier } from '@sanda/db/types';

import type { Kurus } from './money';
import { kurus } from './money';

/**
 * Service-area matching is one of the most important correctness surfaces in
 * Sanda. The rule: given a buyer's destination (provinceCode, districtId,
 * optional [lon,lat]) and a seller's configured ServiceArea rows, determine:
 *   1. whether the seller can fulfill at all;
 *   2. which fulfillment option(s) are available;
 *   3. the cheapest shipping quote for that destination.
 *
 * The matching order:
 *   - exact district match wins over province match
 *   - a polygon containment match wins over district/province
 *   - active rules only
 */

export interface ServiceAreaRule {
  id: string;
  name: string;
  mode: FulfillmentMode;
  provinceCodes: string[];
  districtIds: number[];
  hasPolygon: boolean;
  radiusMeters: number | null;
  carrier: ShippingCarrier | null;
  shippingFee: number; // kuruş
  freeShippingOver: number | null; // kuruş
  etaMinDays: number | null;
  etaMaxDays: number | null;
  minOrderAmount: number; // kuruş
  isActive: boolean;
  /** Pre-computed by the query layer via PostGIS ST_Contains. */
  polygonContainsDestination?: boolean;
  /** Pre-computed by the query layer via ST_DWithin on the farm location. */
  withinRadiusOfFarm?: boolean;
}

export interface Destination {
  provinceCode: string;
  districtId: number;
  lonLat?: [number, number];
}

export interface MatchContext {
  orderSubtotalKurus: Kurus;
}

export interface MatchedRule extends ServiceAreaRule {
  matchKind: 'district' | 'province' | 'polygon' | 'radius';
  effectiveShippingFee: Kurus;
  meetsMinimum: boolean;
}

export function matchServiceAreas(
  rules: ServiceAreaRule[],
  destination: Destination,
  ctx: MatchContext,
): MatchedRule[] {
  const results: MatchedRule[] = [];

  for (const rule of rules) {
    if (!rule.isActive) continue;

    let matchKind: MatchedRule['matchKind'] | null = null;

    if (rule.districtIds.includes(destination.districtId)) {
      matchKind = 'district';
    } else if (rule.provinceCodes.includes(destination.provinceCode)) {
      matchKind = 'province';
    } else if (rule.hasPolygon && rule.polygonContainsDestination) {
      matchKind = 'polygon';
    } else if (rule.radiusMeters != null && rule.withinRadiusOfFarm) {
      matchKind = 'radius';
    }

    if (!matchKind) continue;

    const effectiveShippingFee =
      rule.freeShippingOver != null && ctx.orderSubtotalKurus >= rule.freeShippingOver
        ? kurus(0)
        : kurus(rule.shippingFee);

    results.push({
      ...rule,
      matchKind,
      effectiveShippingFee,
      meetsMinimum: ctx.orderSubtotalKurus >= rule.minOrderAmount,
    });
  }

  // Sort so that the best candidate is first:
  //   eligible (meetsMinimum) > match specificity > cheapest fee
  const specificity: Record<MatchedRule['matchKind'], number> = {
    district: 0,
    polygon: 1,
    radius: 2,
    province: 3,
  };

  results.sort((a, b) => {
    if (a.meetsMinimum !== b.meetsMinimum) return a.meetsMinimum ? -1 : 1;
    if (specificity[a.matchKind] !== specificity[b.matchKind])
      return specificity[a.matchKind] - specificity[b.matchKind];
    return a.effectiveShippingFee - b.effectiveShippingFee;
  });

  return results;
}
