import { ProductionMethod, ProductStatus, TurkeyRegion, UnitOfMeasure } from '@sanda/db/types';
import { z } from 'zod';

import { moneyKurus, nonEmptyTrimmed, optionalText, paginationInput, slug, uuid } from './common';

export const unitOfMeasureSchema = z.nativeEnum(UnitOfMeasure);
export const productionMethodSchema = z.nativeEnum(ProductionMethod);
export const productStatusSchema = z.nativeEnum(ProductStatus);
export const turkeyRegionSchema = z.nativeEnum(TurkeyRegion);

const quantity = z
  .union([z.number(), z.string()])
  .transform((v) => (typeof v === 'number' ? v : Number(v)))
  .refine((v) => Number.isFinite(v) && v > 0, { message: 'errors.quantity.positive' });

const month = z.number().int().min(1).max(12);

export const createProductInput = z.object({
  sellerId: uuid,
  categoryId: uuid,
  slug,
  nameTr: nonEmptyTrimmed('product_name', 140),
  nameEn: z.string().trim().max(140).optional(),
  summary: optionalText(240),
  description: optionalText(6000),
  productionMethod: productionMethodSchema,
  isSeasonal: z.boolean().default(false),
  seasonStartMonth: month.optional(),
  seasonEndMonth: month.optional(),
  originRegion: turkeyRegionSchema.optional(),
  originProvinceCode: z.string().regex(/^\d{2}$/u).optional(),
  minOrderQty: quantity.default(1),
  maxOrderQty: quantity.optional(),
  stepQty: quantity.default(1),
  harvestNotes: optionalText(400),
  storageNotes: optionalText(400),
  allergens: z.array(nonEmptyTrimmed('allergen', 40)).max(20).default([]),
  tags: z.array(nonEmptyTrimmed('tag', 40)).max(20).default([]),
});
export type CreateProductInput = z.infer<typeof createProductInput>;

export const updateProductInput = z.object({
  productId: uuid,
  patch: createProductInput.partial().omit({ sellerId: true, slug: true }),
});

export const changeProductStatusInput = z.object({
  productId: uuid,
  status: productStatusSchema,
});

export const createVariantInput = z.object({
  productId: uuid,
  sku: z.string().trim().min(2).max(40),
  nameTr: nonEmptyTrimmed('variant_name', 80),
  unit: unitOfMeasureSchema,
  quantityPerUnit: quantity,
  priceKurus: moneyKurus,
  compareAtPriceKurus: moneyKurus.optional(),
  stockQuantity: quantity,
  lowStockThreshold: quantity.optional(),
  weightGrams: z.number().int().positive().optional(),
  isDefault: z.boolean().default(false),
});
export type CreateVariantInput = z.infer<typeof createVariantInput>;

export const listProductsInput = paginationInput.extend({
  sellerId: uuid.optional(),
  categorySlug: z.string().optional(),
  search: z.string().trim().max(80).optional(),
  productionMethod: productionMethodSchema.optional(),
  region: turkeyRegionSchema.optional(),
  inSeasonOnly: z.boolean().default(false),
  shipsToProvinceCode: z
    .string()
    .regex(/^\d{2}$/u)
    .optional(),
  priceMinKurus: moneyKurus.optional(),
  priceMaxKurus: moneyKurus.optional(),
  sort: z
    .enum(['newest', 'price_asc', 'price_desc', 'rating', 'popular'])
    .default('newest'),
});
export type ListProductsInput = z.infer<typeof listProductsInput>;

/** Seller dashboard: paginate own catalog rows (any status). */
export const listMyProductsInput = paginationInput.extend({
  status: productStatusSchema.optional(),
});
export type ListMyProductsInput = z.infer<typeof listMyProductsInput>;

export const productSlugInput = z.object({ slug });
