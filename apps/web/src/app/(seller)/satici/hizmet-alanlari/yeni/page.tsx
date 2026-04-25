import { Card, CardContent } from '@sanda/ui-web';
import type { Route } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getServerTrpc } from '@/trpc/server';

import { ServiceAreaPageClient } from '../service-area-page-client';

export const metadata = { title: 'Yeni hizmet alanı' };

export default async function NewServiceAreaPage() {
  const trpc = await getServerTrpc();
  const [me, provinces] = await Promise.all([trpc.auth.me(), trpc.geo.provinces()]);
  const seller = me.sellerProfile;
  if (!seller) redirect('/sat');

  return (
    <div className="space-y-6">
      <nav className="text-xs text-muted-foreground">
        <Link href={'/satici/hizmet-alanlari' as Route} className="hover:text-foreground">
          Hizmet alanları
        </Link>{' '}
        / Yeni
      </nav>

      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Yeni hizmet alanı
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Kargo, elden teslim veya bahçe ziyareti için bir kural tanımla. Kapsadığın illeri ve
          ücretlendirmeyi buradan yönetirsin.
        </p>
      </div>

      <Card className="border-border/70 shadow-md">
        <CardContent className="p-6 md:p-8">
          <ServiceAreaPageClient
            sellerId={seller.id}
            provinces={provinces.map((p) => ({ code: p.code, nameTr: p.nameTr }))}
            submitLabel="Bölgeyi oluştur"
            redirectOnSave="/satici/hizmet-alanlari"
          />
        </CardContent>
      </Card>
    </div>
  );
}
