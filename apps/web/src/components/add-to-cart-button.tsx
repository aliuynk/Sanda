'use client';

import { Button, useToast } from '@sanda/ui-web';
import { ShoppingBasket } from 'lucide-react';
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
  const toast = useToast();
  const utils = trpc.useUtils();
  const addItem = trpc.cart.addItem.useMutation({
    onSuccess: () => {
      toast.success('Sepete eklendi');
      void utils.cart.get.invalidate();
    },
    onError: (err) => toast.error('Sepete eklenemedi', err.message),
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
        className="gap-2"
      >
        <ShoppingBasket className="h-4 w-4" />
        Sepete ekle
      </Button>
    </div>
  );
}
