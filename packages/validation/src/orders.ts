import { FulfillmentMode } from '@sanda/db/types';
import { z } from 'zod';

import { uuid } from './common';

const quantity = z
  .union([z.number(), z.string()])
  .transform((v) => (typeof v === 'number' ? v : Number(v)))
  .refine((v) => Number.isFinite(v) && v > 0, { message: 'errors.quantity.positive' });

export const addToCartInput = z.object({
  productId: uuid,
  variantId: uuid,
  quantity,
});
export type AddToCartInput = z.infer<typeof addToCartInput>;

export const updateCartItemInput = z.object({
  cartItemId: uuid,
  quantity,
});

export const removeCartItemInput = z.object({ cartItemId: uuid });

export const checkoutInput = z
  .object({
    shippingAddressId: uuid.optional(),
    billingAddressId: uuid.optional(),
    pickupLocationId: uuid.optional(),
    fulfillmentMode: z.nativeEnum(FulfillmentMode),
    paymentMethod: z.enum(['CREDIT_CARD', 'BANK_TRANSFER']),
    buyerNotes: z.string().trim().max(500).optional(),
    acceptsTerms: z.literal(true),
    cardToken: z.string().optional(),
    installmentCount: z.number().int().min(1).max(12).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.fulfillmentMode === FulfillmentMode.SHIPPING && !v.shippingAddressId) {
      ctx.addIssue({
        code: 'custom',
        path: ['shippingAddressId'],
        message: 'errors.shipping_address.required',
      });
    }
    if (v.fulfillmentMode === FulfillmentMode.PICKUP && !v.pickupLocationId) {
      ctx.addIssue({
        code: 'custom',
        path: ['pickupLocationId'],
        message: 'errors.pickup_location.required',
      });
    }
    if (v.paymentMethod === 'CREDIT_CARD' && !v.cardToken) {
      ctx.addIssue({
        code: 'custom',
        path: ['cardToken'],
        message: 'errors.card_token.required',
      });
    }
  });
export type CheckoutInput = z.infer<typeof checkoutInput>;

export const markOrderShippedInput = z.object({
  orderId: uuid,
  carrier: z.string(),
  trackingNumber: z.string().trim().min(3).max(60),
});

export const cancelOrderInput = z.object({
  orderId: uuid,
  reason: z.string().trim().min(3).max(400),
});

export const createReviewInput = z.object({
  orderId: uuid,
  productId: uuid.optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().max(2000).optional(),
});
export type CreateReviewInput = z.infer<typeof createReviewInput>;
