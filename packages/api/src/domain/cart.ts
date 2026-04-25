import {
  assertValidLineQuantity,
  CartValidationError,
  ConflictError,
  kurus,
  ValidationError,
} from '@sanda/core';
import { ProductStatus } from '@sanda/db/types';

export function assertPurchasableCatalogItem(input: {
  productStatus: ProductStatus;
  variantIsActive: boolean;
}) {
  if (!input.variantIsActive || input.productStatus !== ProductStatus.ACTIVE) {
    throw new ConflictError('Variant is not available.');
  }
}

export function assertPurchasableCartQuantity(input: {
  productId: string;
  variantId: string;
  sellerId: string;
  quantity: number;
  unitPriceKurus: number;
  stockQuantity: unknown;
  minOrderQty: unknown;
  maxOrderQty: unknown;
  stepQty: unknown;
}) {
  try {
    assertValidLineQuantity({
      productId: input.productId,
      variantId: input.variantId,
      sellerId: input.sellerId,
      quantity: input.quantity,
      unitPriceKurus: kurus(input.unitPriceKurus),
      stockQuantity: Number(input.stockQuantity),
      minOrderQty: Number(input.minOrderQty),
      maxOrderQty: input.maxOrderQty == null ? null : Number(input.maxOrderQty),
      stepQty: Number(input.stepQty),
    });
  } catch (error) {
    if (error instanceof CartValidationError) {
      throw new ValidationError('Invalid cart quantity', [
        { path: ['quantity'], message: `errors.cart.${error.kind}` },
      ]);
    }
    throw error;
  }
}
