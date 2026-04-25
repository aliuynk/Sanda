import { formatTry, kurus } from '@sanda/core';
import { Badge, buttonVariants, Card, CardContent, cn, EmptyState } from '@sanda/ui-web';
import { MapPinned, Plus, Truck } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';

import { fulfillmentModeTr } from '@/lib/fulfillment-mode';
import { getServerTrpc } from '@/trpc/server';

export default async function SellerServiceAreasPage() {
  const trpc = await getServerTrpc();
  const areas = await trpc.sellers.listMyServiceAreas();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Hizmet alanları
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Kargo, elden teslim ve bahçe ziyareti kurallarını istediğin granülerlikte tanımla.
            Checkout akışı sepetteki ürünlere göre uygun alanı otomatik seçer.
          </p>
        </div>
        <Link
          href={'/satici/hizmet-alanlari/yeni' as Route}
          className={cn(buttonVariants({ size: 'lg' }), 'w-fit gap-2 rounded-xl')}
        >
          <Plus className="h-4 w-4" />
          Yeni bölge
        </Link>
      </div>

      {areas.length === 0 ? (
        <EmptyState
          className="rounded-2xl border-primary/20 bg-primary/[0.03]"
          icon={<MapPinned className="h-10 w-10 text-primary" />}
          title="Henüz bölge yok"
          description="En az bir hizmet alanı tanımladığında mağazan checkout’a çıkabilir."
          action={
            <Link
              href={'/satici/hizmet-alanlari/yeni' as Route}
              className={cn(buttonVariants(), 'rounded-xl')}
            >
              İlk bölgeyi ekle
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {areas.map((sa) => (
            <Link
              key={sa.id}
              href={`/satici/hizmet-alanlari/${sa.id}` as Route}
              className="group block"
            >
              <Card
                className={cn(
                  'border-border/70 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-primary/30 group-hover:shadow-lg',
                  !sa.isActive && 'opacity-70',
                )}
              >
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 font-display text-lg font-semibold">
                      <Truck className="h-5 w-5 shrink-0 text-primary" aria-hidden />
                      {sa.name}
                    </div>
                    <Badge tone="outline" className="shrink-0 rounded-md">
                      {fulfillmentModeTr[sa.mode]}
                    </Badge>
                  </div>
                  {sa.provinceCodes.length > 0 ? (
                    <p className="text-xs text-muted-foreground">
                      İl kodları:{' '}
                      <span className="font-medium text-foreground">
                        {sa.provinceCodes.join(', ')}
                      </span>
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    {sa.etaMinDays != null && sa.etaMaxDays != null ? (
                      <span>
                        {sa.etaMinDays}–{sa.etaMaxDays} gün
                      </span>
                    ) : null}
                    <span>
                      Kargo: {sa.shippingFee > 0 ? formatTry(kurus(sa.shippingFee)) : 'ücretsiz'}
                    </span>
                    {!sa.isActive ? (
                      <Badge tone="neutral" className="rounded-md">
                        Pasif
                      </Badge>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
