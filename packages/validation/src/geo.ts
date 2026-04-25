import { FulfillmentMode, ShippingCarrier } from '@sanda/db/types';
import { z } from 'zod';

import { moneyKurus, nonEmptyTrimmed, turkishPhoneE164, uuid } from './common';

export const fulfillmentModeSchema = z.nativeEnum(FulfillmentMode);
export const shippingCarrierSchema = z.nativeEnum(ShippingCarrier);

const provinceCode = z.string().regex(/^\d{2}$/u, { message: 'errors.province_code' });
const districtId = z.number().int().positive();

/** A 2-D WGS-84 point, [lon, lat]. */
export const lonLat = z.tuple([
  z.number().min(-180).max(180),
  z.number().min(-90).max(90),
]);

const polygonRing = z.array(lonLat).min(4);
export const geoJsonPolygon = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(polygonRing).min(1),
});
export const geoJsonMultiPolygon = z.object({
  type: z.literal('MultiPolygon'),
  coordinates: z.array(z.array(polygonRing).min(1)).min(1),
});

export const upsertServiceAreaInput = z
  .object({
    id: uuid.optional(),
    sellerId: uuid,
    name: nonEmptyTrimmed('service_area_name', 80),
    mode: fulfillmentModeSchema,
    provinceCodes: z.array(provinceCode).default([]),
    districtIds: z.array(districtId).default([]),
    polygon: geoJsonMultiPolygon.optional(),
    radiusMeters: z.number().int().positive().max(500_000).optional(),
    carrier: shippingCarrierSchema.optional(),
    shippingFee: moneyKurus.default(0),
    freeShippingOver: moneyKurus.optional(),
    etaMinDays: z.number().int().min(0).max(30).optional(),
    etaMaxDays: z.number().int().min(0).max(60).optional(),
    minOrderAmount: moneyKurus.default(0),
    notes: z.string().trim().max(500).optional(),
    isActive: z.boolean().default(true),
  })
  .superRefine((v, ctx) => {
    if (v.mode === FulfillmentMode.SHIPPING && !v.carrier) {
      ctx.addIssue({ code: 'custom', path: ['carrier'], message: 'errors.carrier.required' });
    }
    if (
      v.provinceCodes.length === 0 &&
      v.districtIds.length === 0 &&
      !v.polygon &&
      !v.radiusMeters
    ) {
      ctx.addIssue({ code: 'custom', path: ['provinceCodes'], message: 'errors.coverage.required' });
    }
    if (v.etaMinDays != null && v.etaMaxDays != null && v.etaMinDays > v.etaMaxDays) {
      ctx.addIssue({
        code: 'custom',
        path: ['etaMaxDays'],
        message: 'errors.eta.min_gt_max',
      });
    }
  });
export type UpsertServiceAreaInput = z.infer<typeof upsertServiceAreaInput>;

export const createAddressInput = z.object({
  label: z.string().trim().max(40).optional(),
  recipient: nonEmptyTrimmed('recipient', 120),
  phone: turkishPhoneE164,
  line1: nonEmptyTrimmed('address_line1', 240),
  line2: z.string().trim().max(240).optional(),
  districtId,
  provinceCode,
  postalCode: z.string().regex(/^\d{5}$/u, { message: 'errors.postal_code' }).optional(),
  notes: z.string().trim().max(240).optional(),
  isDefault: z.boolean().default(false),
});
export type CreateAddressInput = z.infer<typeof createAddressInput>;
