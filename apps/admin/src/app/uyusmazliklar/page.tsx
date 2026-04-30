import { formatTry, kurus } from '@sanda/core';
import { Card, CardContent, EmptyState, StatusPill } from '@sanda/ui-web';
import { MessageSquareWarning } from 'lucide-react';

import { getServerTrpc } from '@/trpc/server';

export const metadata = {
  title: 'Uyuşmazlıklar',
};

export default async function DisputesPage() {
  const trpc = await getServerTrpc();
  const result = await trpc.admin.orders.list({
    status: ['DISPUTED', 'REFUND_REQUESTED'],
    limit: 50,
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Müdahale gerektirenler
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Uyuşmazlıklar
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Buradaki siparişler iade talebi açılmış veya uyuşmazlık moduna geçmiş demektir.
          PSP iade penceresi ve hakediş aktarımı bekleyen sipariş kalmamalı.
        </p>
      </header>

      <Card className="border-border/70 bg-card/70 shadow-sm">
        <CardContent className="p-0">
          {result.items.length === 0 ? (
            <EmptyState
              className="rounded-2xl border-emerald-200/40 bg-emerald-50/20 dark:bg-emerald-950/10"
              icon={<MessageSquareWarning className="h-10 w-10 text-emerald-600" />}
              title="Hiç açık uyuşmazlık yok"
              description="Tüm iade talepleri kapatılmış ve uyuşmazlığa giden sipariş yok. Sıra temiz."
            />
          ) : (
            <ul className="divide-y divide-border/50">
              {result.items.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm font-semibold">#{o.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.seller.displayName} → {o.buyer.profile?.firstName}{' '}
                      {o.buyer.profile?.lastName}
                    </p>
                  </div>
                  <StatusPill tone="destructive">
                    {o.status === 'DISPUTED' ? 'Uyuşmazlık' : 'İade talebi'}
                  </StatusPill>
                  <p className="font-semibold tabular-nums">{formatTry(kurus(o.totalKurus))}</p>
                  <p className="text-[11px] text-muted-foreground tabular-nums">
                    {new Date(o.placedAt).toLocaleDateString('tr-TR')}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
