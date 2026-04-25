import { formatTry, kurus } from '@sanda/core';
import { Card, CardContent, CardHeader, CardTitle } from '@sanda/ui-web';
import { TrendingUp, Wallet } from 'lucide-react';

import { getServerTrpc } from '@/trpc/server';

export default async function SellerEarningsPage() {
  const trpc = await getServerTrpc();
  const { items } = await trpc.orders.listForSeller({ limit: 100 });

  const completed = items.filter((o) => o.status === 'COMPLETED' || o.status === 'DELIVERED');
  const gross = completed.reduce((s, o) => s + o.sellerNetKurus, 0);
  const pending = items.filter((o) =>
    ['PAID', 'AWAITING_FULFILLMENT', 'IN_PREPARATION', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(o.status),
  );
  const pendingAmount = pending.reduce((s, o) => s + o.sellerNetKurus, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Kazanç</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Net satıcı payı (komisyon sonrası) özetidir. Gerçek ödeme takvimi ve mutabakat raporları
          payout worker ile üretilecek.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border/70 bg-gradient-to-br from-primary/[0.08] to-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tamamlanan siparişler</CardTitle>
            <Wallet className="h-4 w-4 text-primary" aria-hidden />
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-semibold tabular-nums">{formatTry(kurus(gross))}</p>
            <p className="mt-1 text-xs text-muted-foreground">{completed.length} sipariş</p>
          </CardContent>
        </Card>
        <Card className="border-border/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bekleyen tahsilat</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden />
          </CardHeader>
          <CardContent>
            <p className="font-display text-3xl font-semibold tabular-nums">{formatTry(kurus(pendingAmount))}</p>
            <p className="mt-1 text-xs text-muted-foreground">{pending.length} açık sipariş</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-dashed border-primary/20 bg-primary/[0.02]">
        <CardContent className="p-6 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Yol haritası</p>
          <ul className="mt-3 list-inside list-disc space-y-2">
            <li>Günlük / haftalık mutabakat PDF ve iyzico payout eşlemesi.</li>
            <li>KDV ve müstahsil makbuzu hatırlatmaları (üretici tipine göre).</li>
            <li>İade ve ihtilaf kesintilerinin otomatik düşümü.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
