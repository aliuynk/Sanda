'use client';

import { formatTry, kurus } from '@sanda/core';
import { Badge, Button, Card, CardContent, cn } from '@sanda/ui-web';
import { MapPinned, Plus, Truck } from 'lucide-react';
import { useMemo, useState } from 'react';

import { ServiceAreaForm } from '@/components/forms/service-area-form';
import { fulfillmentModeTr } from '@/lib/fulfillment-mode';
import { trpc } from '@/trpc/shared';

export function ServiceAreasStep({
  sellerId,
  count,
  onDone,
}: {
  sellerId: string;
  count: number;
  onDone: () => void;
}) {
  const [showForm, setShowForm] = useState(count === 0);
  const { data: areas, isLoading } = trpc.sellers.listMyServiceAreas.useQuery();
  const { data: provinces } = trpc.geo.provinces.useQuery();

  const provinceMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of provinces ?? []) map[p.code] = p.nameTr;
    return map;
  }, [provinces]);

  const allCodes = useMemo(() => (provinces ?? []).map((p) => p.code).sort(), [provinces]);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 ring-1 ring-primary/20">
          <MapPinned className="h-5 w-5 text-primary" aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-2xl font-semibold">Hizmet alanları</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            En az bir teslimat kuralı tanımla. Kargo, elden teslim ve bahçe ziyareti ayrı ayrı
            eklenebilir.
          </p>
        </div>
      </div>

      {isLoading ? null : (areas ?? []).length > 0 ? (
        <div className="grid gap-3">
          {(areas ?? []).map((sa) => (
            <Card key={sa.id} className={cn('border-border/70', !sa.isActive && 'opacity-60')}>
              <CardContent className="flex flex-wrap items-start justify-between gap-3 p-4">
                <div className="flex items-start gap-3">
                  <Truck className="mt-0.5 h-4 w-4 text-primary" aria-hidden />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{sa.name}</span>
                      <Badge tone="outline" className="rounded-md">
                        {fulfillmentModeTr[sa.mode]}
                      </Badge>
                    </div>
                    {sa.provinceCodes.length > 0 ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        İller: {sa.provinceCodes.join(', ')}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Kargo:{' '}
                      {sa.shippingFee > 0 ? formatTry(kurus(sa.shippingFee)) : 'ücretsiz / —'}
                      {sa.etaMinDays != null && sa.etaMaxDays != null
                        ? ` · ${sa.etaMinDays}–${sa.etaMaxDays} gün`
                        : ''}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {showForm ? (
        <Card className="border-primary/25 bg-primary/[0.03]">
          <CardContent className="p-6 md:p-8">
            <ServiceAreaForm
              sellerId={sellerId}
              allProvinceCodes={allCodes}
              provinceNameByCode={provinceMap}
              submitLabel="Bölgeyi kaydet"
              onSaved={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-primary/25 bg-primary/[0.02] p-4">
          <div>
            <p className="font-medium">Daha fazla bölge ekle</p>
            <p className="text-xs text-muted-foreground">İhtiyaç oldukça yeni kural tanımlayabilirsin.</p>
          </div>
          <Button type="button" variant="outline" className="gap-2 rounded-xl" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            Yeni bölge
          </Button>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          type="button"
          size="lg"
          className="rounded-xl"
          disabled={(areas ?? []).length === 0}
          onClick={onDone}
        >
          Devam et
        </Button>
      </div>
    </div>
  );
}
