import { formatTry, kurus } from '@sanda/core';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  buttonVariants,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
} from '@sanda/ui-web';
import { ArrowUpRight, ClipboardCheck, Package, ShieldCheck } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';

import { orderStatusTr } from '@/lib/order-status';
import { getServerTrpc } from '@/trpc/server';

export default async function SellerDashboardPage() {
  const trpc = await getServerTrpc();
  const [me, orders, certs, areas, products] = await Promise.all([
    trpc.auth.me(),
    trpc.orders.listForSeller({ limit: 5 }),
    trpc.certifications.list(),
    trpc.sellers.listMyServiceAreas(),
    trpc.catalog.listMine({ limit: 1 }),
  ]);

  const seller = me.sellerProfile!;

  const pendingCount = orders.items.filter((o) =>
    ['PAID', 'AWAITING_FULFILLMENT', 'IN_PREPARATION'].includes(o.status),
  ).length;

  const revenue = orders.items
    .filter((o) => ['COMPLETED', 'DELIVERED'].includes(o.status))
    .reduce((sum, o) => sum + o.sellerNetKurus, 0);

  const verifiedCerts = certs.filter((c) => c.status === 'VERIFIED').length;

  const hasLegal = Boolean(seller.iban);
  const hasFarm = Boolean(seller.farmName && seller.farmDistrictId);
  const hasAreas = areas.length > 0;
  const hasProduct = products.items.length > 0;
  const draftStatus = seller.status === 'DRAFT';

  const stepsPending = [
    { done: hasLegal, label: 'Yasal bilgiler ve IBAN' },
    { done: hasFarm, label: 'Çiftlik profili' },
    { done: hasAreas, label: 'Hizmet alanı' },
    { done: !draftStatus, label: 'İncelemeye gönderim' },
    { done: hasProduct, label: 'İlk ürün' },
  ];
  const missingCount = stepsPending.filter((s) => !s.done).length;

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Panel</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Operasyon özeti: sipariş borçları, sertifika sağlığı ve hızlı kısayollar. Tüm veriler
            canlı API’den gelir.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={'/satici/urunler' as Route}
            className={cn(buttonVariants({ variant: 'outline' }), 'rounded-xl')}
          >
            Ürünler
          </Link>
          <Link
            href={'/satici/siparisler' as Route}
            className={cn(buttonVariants(), 'rounded-xl')}
          >
            Siparişler
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {missingCount > 0 ? (
        <Alert tone="warning">
          <ClipboardCheck className="h-4 w-4" />
          <AlertTitle>Onboarding’i tamamla — {missingCount} adım kaldı</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 space-y-1 text-xs">
              {stepsPending
                .filter((s) => !s.done)
                .map((s) => (
                  <li key={s.label}>• {s.label}</li>
                ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link
                href={'/satici/onboarding' as Route}
                className={cn(buttonVariants({ size: 'sm' }), 'rounded-lg')}
              >
                Onboarding’e devam et
              </Link>
              {!hasProduct ? (
                <Link
                  href={'/satici/urunler/yeni' as Route}
                  className={cn(
                    buttonVariants({ size: 'sm', variant: 'outline' }),
                    'rounded-lg',
                  )}
                >
                  İlk ürünü oluştur
                </Link>
              ) : null}
            </div>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/70 bg-gradient-to-br from-primary/[0.07] to-card shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Bekleyen siparişler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-4xl font-semibold tabular-nums">{pendingCount}</p>
            <p className="mt-1 text-xs text-muted-foreground">Ödeme alınmış, hazırlık aşamasında</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Son dönem net (örnek)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-4xl font-semibold tabular-nums">
              {formatTry(kurus(revenue))}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Tamamlanan / teslim edilen siparişler</p>
          </CardContent>
        </Card>
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
              Sertifikalar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-display text-4xl font-semibold tabular-nums">{verifiedCerts}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Doğrulanmış belge sayısı ·{' '}
              <Link
                href={'/satici/sertifikalar' as Route}
                className="text-primary hover:underline"
              >
                yönet
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-display text-xl font-semibold">Son siparişler</h2>
          <Link
            href={'/satici/siparisler' as Route}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Tümü →
          </Link>
        </div>
        <Card className="overflow-hidden border-border/70 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead className="border-b border-border/80 bg-muted/30 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="p-3">Sipariş no</th>
                    <th className="p-3">Durum</th>
                    <th className="p-3">Tutar</th>
                    <th className="p-3">Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-12 text-center text-muted-foreground">
                        <Package className="mx-auto mb-3 h-10 w-10 opacity-40" aria-hidden />
                        Henüz sipariş yok.
                      </td>
                    </tr>
                  ) : (
                    orders.items.map((o) => (
                      <tr
                        key={o.id}
                        className="border-b border-border/50 last:border-0 hover:bg-muted/15"
                      >
                        <td className="p-3 font-mono text-xs font-semibold">{o.orderNumber}</td>
                        <td className="p-3">
                          <Badge tone="info" className="rounded-md text-xs">
                            {orderStatusTr[o.status]}
                          </Badge>
                        </td>
                        <td className="p-3 font-medium tabular-nums">
                          {formatTry(kurus(o.totalKurus))}
                        </td>
                        <td className="p-3 text-muted-foreground tabular-nums">
                          {new Date(o.placedAt).toLocaleDateString('tr-TR')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
