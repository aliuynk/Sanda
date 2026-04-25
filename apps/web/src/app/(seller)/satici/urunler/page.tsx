import { formatTry, kurus } from '@sanda/core';
import { Badge, buttonVariants, Card, CardContent, cn, EmptyState } from '@sanda/ui-web';
import { Package, Plus } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';

import { productStatusTr } from '@/lib/product-status';
import { getServerTrpc } from '@/trpc/server';

export default async function SellerProductsPage() {
  const trpc = await getServerTrpc();
  const { items } = await trpc.catalog.listMine({ limit: 48 });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Ürünler</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Taslak ve yayında tüm SKU’ların özeti. Düzenleme, varyantlar ve yayına alma detay
            sayfasından yönetilir.
          </p>
        </div>
        <Link
          href={'/satici/urunler/yeni' as Route}
          className={cn(buttonVariants({ size: 'lg' }), 'w-fit gap-2 rounded-xl')}
        >
          <Plus className="h-4 w-4" />
          Yeni ürün
        </Link>
      </div>

      {items.length === 0 ? (
        <EmptyState
          className="rounded-2xl border-primary/20 bg-primary/[0.03]"
          icon={<Package className="h-10 w-10 text-primary" />}
          title="Henüz ürün yok"
          description="İlk ürününü oluşturup taslak olarak kaydet. Varyant eklediğinde vitrine alabilirsin."
          action={
            <Link
              href={'/satici/urunler/yeni' as Route}
              className={cn(buttonVariants(), 'rounded-xl')}
            >
              Yeni ürün oluştur
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((p) => {
            const v = p.variants[0];
            const price = v ? formatTry(kurus(v.priceKurus)) : '—';
            const img = p.media[0];
            return (
              <Link
                key={p.id}
                href={`/satici/urunler/${p.id}` as Route}
                className="group block"
              >
                <Card className="overflow-hidden border-border/70 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:shadow-lg">
                  <CardContent className="flex gap-4 p-4">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">
                      {img?.url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={img.url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <Package className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h2 className="font-display text-lg font-semibold leading-tight">
                          {p.nameTr}
                        </h2>
                        <Badge tone="outline" className="shrink-0 rounded-md">
                          {productStatusTr[p.status]}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{p.category.nameTr}</p>
                      <p className="mt-3 text-sm font-semibold tabular-nums">{price}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
