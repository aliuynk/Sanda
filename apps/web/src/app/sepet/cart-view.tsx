'use client';

import { formatTry, kurus } from '@sanda/core';
import { Button, Card, CardContent, EmptyState, Spinner } from '@sanda/ui-web';
import { ShoppingBasket } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';

import { trpc } from '@/trpc/shared';

export function CartView() {
  const { data, isLoading } = trpc.cart.get.useQuery();
  const utils = trpc.useUtils();
  const remove = trpc.cart.removeItem.useMutation({
    onSuccess: () => utils.cart.get.invalidate(),
  });

  if (isLoading)
    return (
      <div className="flex min-h-[20vh] items-center justify-center">
        <Spinner />
      </div>
    );

  if (!data || data.items.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBasket className="h-10 w-10" />}
        title="Sepetin boş"
        description="Keşfet sayfasından sevdiğin üreticinin ürünlerini eklemeye başlayabilirsin."
        action={
          <Link href={'/kesfet' as Route} className="underline">
            Ürünleri keşfet
          </Link>
        }
      />
    );
  }

  const bySeller = groupBy(data.items, (i) => i.product.sellerId);
  const subtotal = data.items.reduce(
    (s, i) => s + i.priceSnapshotKurus * Number(i.quantity),
    0,
  );

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        {Object.entries(bySeller).map(([sellerId, items]) => (
          <Card key={sellerId}>
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <Link
                  href={`/uretici/${items[0]!.product.seller.slug}` as Route}
                  className="font-display text-lg hover:underline"
                >
                  {items[0]!.product.seller.displayName}
                </Link>
                <span className="text-xs text-muted-foreground">
                  Bu üretici için ayrı sipariş oluşturulur
                </span>
              </div>
              <ul className="divide-y">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center gap-4 py-4">
                    {item.product.media[0] ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.product.media[0].url}
                        alt=""
                        className="h-16 w-16 rounded-md object-cover"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-md bg-muted" />
                    )}
                    <div className="flex-1">
                      <Link
                        href={`/urun/${item.product.slug}` as Route}
                        className="font-medium hover:underline"
                      >
                        {item.product.nameTr}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {item.variant.nameTr} × {Number(item.quantity)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatTry(
                          kurus(Math.round(item.priceSnapshotKurus * Number(item.quantity))),
                        )}
                      </div>
                      <button
                        onClick={() => remove.mutate({ cartItemId: item.id })}
                        className="mt-1 text-xs text-muted-foreground hover:text-destructive"
                      >
                        Çıkar
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
      <aside className="md:sticky md:top-20 md:self-start">
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="font-display text-lg">Sipariş özeti</h2>
            <div className="flex justify-between text-sm">
              <span>Ara toplam</span>
              <span>{formatTry(kurus(subtotal))}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Kargo</span>
              <span>Ödemede hesaplanır</span>
            </div>
            <Link href={'/odeme' as Route} className="block">
              <Button className="w-full">Ödemeye geç</Button>
            </Link>
            <p className="text-xs text-muted-foreground">
              Sepetin farklı üreticiler arasında bölünür. Her üretici için ayrı sipariş ve ayrı
              kargo oluşur.
            </p>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item);
    acc[k] = acc[k] ? [...acc[k]!, item] : [item];
    return acc;
  }, {});
}
