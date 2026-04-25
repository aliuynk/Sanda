import type { Kurus } from './money';
import { addKurus, kurus } from './money';

export interface CartLine {
  productId: string;
  variantId: string;
  sellerId: string;
  quantity: number;
  unitPriceKurus: Kurus;
  stockQuantity: number;
  minOrderQty: number;
  maxOrderQty: number | null;
  stepQty: number;
}

export interface CartTotals {
  subtotalKurus: Kurus;
  itemCount: number;
  linesBySeller: Map<string, CartLine[]>;
}

/** Single pass over the cart to compute what the UI needs. */
export function summariseCart(lines: CartLine[]): CartTotals {
  const linesBySeller = new Map<string, CartLine[]>();
  let itemCount = 0;
  let subtotal = kurus(0);

  for (const line of lines) {
    itemCount += 1;
    subtotal = addKurus(
      subtotal,
      kurus(Math.round(line.unitPriceKurus * line.quantity)),
    );
    const arr = linesBySeller.get(line.sellerId) ?? [];
    arr.push(line);
    linesBySeller.set(line.sellerId, arr);
  }

  return { subtotalKurus: subtotal, itemCount, linesBySeller };
}

export class CartValidationError extends Error {
  constructor(
    public readonly kind:
      | 'below_minimum'
      | 'above_maximum'
      | 'step_mismatch'
      | 'insufficient_stock',
    public readonly variantId: string,
    message: string,
  ) {
    super(message);
  }
}

export function assertValidLineQuantity(line: CartLine): void {
  if (line.quantity < line.minOrderQty) {
    throw new CartValidationError(
      'below_minimum',
      line.variantId,
      `Minimum ${line.minOrderQty} required`,
    );
  }
  if (line.maxOrderQty != null && line.quantity > line.maxOrderQty) {
    throw new CartValidationError(
      'above_maximum',
      line.variantId,
      `Maximum ${line.maxOrderQty} allowed`,
    );
  }
  if (line.quantity > line.stockQuantity) {
    throw new CartValidationError(
      'insufficient_stock',
      line.variantId,
      `Only ${line.stockQuantity} available`,
    );
  }
  const step = line.stepQty;
  const ratio = (line.quantity - line.minOrderQty) / step;
  if (Math.abs(ratio - Math.round(ratio)) > 1e-6) {
    throw new CartValidationError(
      'step_mismatch',
      line.variantId,
      `Quantity must increment by ${step}`,
    );
  }
}
