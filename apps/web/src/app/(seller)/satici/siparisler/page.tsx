import { formatTry, kurus } from '@sanda/core';
import { Badge, Card, CardContent } from '@sanda/ui-web';

import { orderStatusTr } from '@/lib/order-status';
import { getServerTrpc } from '@/trpc/server';

export default async function SellerOrdersPage() {
  const trpc = await getServerTrpc();
  const { items } = await trpc.orders.listForSeller({ limit: 50 });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Siparişler</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Çoklu satıcı sepetlerinde bu mağazana düşen siparişler. Durum geçişleri ileride panelden
          yönetilecek.
        </p>
      </div>

      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-border/80 bg-muted/30 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-4">Sipariş</th>
                  <th className="p-4">Alıcı</th>
                  <th className="p-4">Durum</th>
                  <th className="p-4 text-right">Tutar</th>
                  <th className="p-4">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-muted-foreground">
                      Henüz sipariş yok. Ürünlerini yayına aldığında burada listelenecek.
                    </td>
                  </tr>
                ) : (
                  items.map((o) => {
                    const buyerName = o.buyer.profile
                      ? `${o.buyer.profile.firstName} ${o.buyer.profile.lastName}`.trim()
                      : o.buyer.phone ?? '—';
                    return (
                      <tr key={o.id} className="border-b border-border/50 transition-colors last:border-0 hover:bg-muted/20">
                        <td className="p-4 font-mono text-xs font-semibold">{o.orderNumber}</td>
                        <td className="p-4 text-muted-foreground">{buyerName}</td>
                        <td className="p-4">
                          <Badge tone="info" className="rounded-md">
                            {orderStatusTr[o.status]}
                          </Badge>
                        </td>
                        <td className="p-4 text-right font-medium tabular-nums">
                          {formatTry(kurus(o.totalKurus))}
                        </td>
                        <td className="p-4 text-muted-foreground tabular-nums">
                          {new Date(o.placedAt).toLocaleString('tr-TR', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
