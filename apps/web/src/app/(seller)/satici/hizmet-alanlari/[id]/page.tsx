import { Card, CardContent } from '@sanda/ui-web';
import type { Route } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { getServerTrpc } from '@/trpc/server';

import { ServiceAreaPageClient } from '../service-area-page-client';

export const metadata = { title: 'Hizmet alanı' };

export default async function EditServiceAreaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trpc = await getServerTrpc();
  const [me, areas, provinces] = await Promise.all([
    trpc.auth.me(),
    trpc.sellers.listMyServiceAreas(),
    trpc.geo.provinces(),
  ]);
  const seller = me.sellerProfile;
  if (!seller) redirect('/sat');
  const area = areas.find((a) => a.id === id);
  if (!area) notFound();

  return (
    <div className="space-y-6">
      <nav className="text-xs text-muted-foreground">
        <Link href={'/satici/hizmet-alanlari' as Route} className="hover:text-foreground">
          Hizmet alanları
        </Link>{' '}
        / {area.name}
      </nav>

      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          {area.name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Bu bölgeyi güncelle, kapsamayı genişlet ya da geçici olarak pasifleştir.
        </p>
      </div>

      <Card className="border-border/70 shadow-md">
        <CardContent className="p-6 md:p-8">
          <ServiceAreaPageClient
            sellerId={seller.id}
            provinces={provinces.map((p) => ({ code: p.code, nameTr: p.nameTr }))}
            submitLabel="Değişiklikleri kaydet"
            redirectOnSave="/satici/hizmet-alanlari"
            initial={{
              id: area.id,
              name: area.name,
              mode: area.mode,
              provinceCodes: area.provinceCodes,
              districtIds: area.districtIds,
              carrier: area.carrier ?? undefined,
              shippingFee: area.shippingFee,
              freeShippingOver: area.freeShippingOver ?? undefined,
              etaMinDays: area.etaMinDays ?? undefined,
              etaMaxDays: area.etaMaxDays ?? undefined,
              minOrderAmount: area.minOrderAmount,
              notes: area.notes ?? undefined,
              isActive: area.isActive,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
