'use client';

import { formatTry, kurus } from '@sanda/core';
import { OrderStatus } from '@sanda/db/types';
import { cn, Input, Spinner, StatusPill } from '@sanda/ui-web';
import { Filter, Search, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

import { trpc } from '@/trpc/shared';

const STATUS_FILTERS: { value: OrderStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Tümü' },
  { value: OrderStatus.PENDING_PAYMENT, label: 'Ödeme bekliyor' },
  { value: OrderStatus.PAID, label: 'Ödendi' },
  { value: OrderStatus.IN_PREPARATION, label: 'Hazırlanıyor' },
  { value: OrderStatus.SHIPPED, label: 'Kargoda' },
  { value: OrderStatus.DELIVERED, label: 'Teslim edildi' },
  { value: OrderStatus.DISPUTED, label: 'Uyuşmazlık' },
  { value: OrderStatus.CANCELLED, label: 'İptal' },
];

const orderStatusTr: Record<string, string> = {
  PENDING_PAYMENT: 'Ödeme bekliyor',
  PAID: 'Ödendi',
  AWAITING_FULFILLMENT: 'Hazırlık bekliyor',
  IN_PREPARATION: 'Hazırlanıyor',
  SHIPPED: 'Kargoda',
  OUT_FOR_DELIVERY: 'Dağıtımda',
  DELIVERED: 'Teslim edildi',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal',
  REFUND_REQUESTED: 'İade talebi',
  REFUNDED: 'İade edildi',
  DISPUTED: 'Uyuşmazlık',
};

function tone(s: string): 'success' | 'warning' | 'destructive' | 'info' | 'neutral' | 'primary' {
  if (['DELIVERED', 'COMPLETED'].includes(s)) return 'success';
  if (['CANCELLED', 'DISPUTED', 'REFUNDED'].includes(s)) return 'destructive';
  if (['PENDING_PAYMENT', 'REFUND_REQUESTED'].includes(s)) return 'warning';
  if (['PAID', 'AWAITING_FULFILLMENT', 'IN_PREPARATION'].includes(s)) return 'primary';
  return 'info';
}

export function OrdersClient() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  const query = trpc.admin.orders.list.useQuery({
    status: statusFilter === 'ALL' ? undefined : [statusFilter],
    search: search || undefined,
    limit: 50,
  });

  return (
    <div>
      <div className="flex flex-col gap-3 border-b border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Sipariş no, üretici…"
            className="max-w-sm"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                'shrink-0 rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                statusFilter === f.value
                  ? 'border-primary/40 bg-primary/12 text-primary'
                  : 'border-border/80 bg-card text-muted-foreground hover:border-primary/25 hover:text-foreground',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {query.isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner />
        </div>
      ) : query.data && query.data.items.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b border-border/60 bg-muted/30 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Sipariş no</th>
                <th className="px-4 py-3">Üretici</th>
                <th className="px-4 py-3">Alıcı</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">Tutar</th>
                <th className="px-4 py-3">Komisyon</th>
                <th className="px-4 py-3">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {query.data.items.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-border/40 last:border-0 hover:bg-muted/20"
                >
                  <td className="px-4 py-3 font-mono text-xs font-semibold">{o.orderNumber}</td>
                  <td className="px-4 py-3 text-sm">{o.seller.displayName}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {o.buyer.profile?.firstName} {o.buyer.profile?.lastName}
                    <p className="font-mono text-[11px]">{o.buyer.phone ?? o.buyer.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill tone={tone(o.status)}>
                      {orderStatusTr[o.status] ?? o.status}
                    </StatusPill>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">
                    {formatTry(kurus(o.totalKurus))}
                  </td>
                  <td className="px-4 py-3 text-right text-xs tabular-nums text-muted-foreground">
                    {formatTry(kurus(o.platformFeeKurus))}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground tabular-nums">
                    {new Date(o.placedAt).toLocaleString('tr-TR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-sm font-medium">Bu filtre için sipariş yok.</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            Filtre ayarlarını gevşeterek diğer durumları gör.
          </p>
        </div>
      )}
    </div>
  );
}
