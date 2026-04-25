'use client';

import { Button } from '@sanda/ui-web';
import { useState } from 'react';

import { trpc } from '@/trpc/shared';

export function AddToCartButton({
  productId,
  variantId,
  minOrderQty,
  stepQty,
}: {
  productId: string;
  variantId: string;
  minOrderQty: number;
  stepQty: number;
}) {
  const [qty, setQty] = useState(minOrderQty);
  const [message, setMessage] = useState<string | null>(null);
  const utils = trpc.useUtils();
  const addItem = trpc.cart.addItem.useMutation({
    onSuccess: () => {
      setMessage('Sepete eklendi.');
      void utils.cart.get.invalidate();
    },
    onError: (err) => setMessage(err.message),
  });

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          aria-label="Azalt"
          onClick={() => setQty((q) => Math.max(minOrderQty, q - stepQty))}
        >
          −
        </Button>
        <input
          value={qty}
          readOnly
          className="h-10 w-14 rounded-md border border-input bg-background text-center text-sm"
        />
        <Button
          variant="outline"
          size="icon"
          aria-label="Arttır"
          onClick={() => setQty((q) => q + stepQty)}
        >
          +
        </Button>
      </div>
      <Button
        loading={addItem.isPending}
        onClick={() => addItem.mutate({ productId, variantId, quantity: qty })}
      >
        Sepete ekle
      </Button>
      {message ? (
        <p className="text-xs text-muted-foreground" role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
