'use client';

import { SellerStatus } from '@sanda/db/types';
import { Badge, cn, Input, Spinner, StatusPill } from '@sanda/ui-web';
import { ChevronRight, Filter, Search, Store } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { trpc } from '@/trpc/shared';

const STATUS_FILTERS: { value: SellerStatus | 'ALL'; label: string }[] = [
  { value: SellerStatus.APPROVED, label: 'Onaylı' },
  { value: SellerStatus.PENDING_REVIEW, label: 'İncelemede' },
  { value: SellerStatus.SUSPENDED, label: 'Askıda' },
  { value: SellerStatus.REJECTED, label: 'Reddedildi' },
  { value: 'ALL', label: 'Tümü' },
];

const sellerStatusTone: Record<string, 'success' | 'warning' | 'destructive' | 'info' | 'neutral'> = {
  DRAFT: 'neutral',
  PENDING_REVIEW: 'warning',
  APPROVED: 'success',
  SUSPENDED: 'destructive',
  REJECTED: 'destructive',
};

const sellerStatusTr: Record<string, string> = {
  DRAFT: 'Taslak',
  PENDING_REVIEW: 'İncelemede',
  APPROVED: 'Onaylı',
  SUSPENDED: 'Askıda',
  REJECTED: 'Reddedildi',
};

const sellerKindTr: Record<string, string> = {
  INDIVIDUAL_FARMER: 'Bireysel çiftçi',
  REGISTERED_FARMER: 'Kayıtlı çiftçi',
  COOPERATIVE: 'Kooperatif',
  SMALL_BUSINESS: 'Esnaf',
  COMPANY: 'Şirket',
};

export function SellerDirectoryClient() {
  const [statusFilter, setStatusFilter] = useState<SellerStatus | 'ALL'>(SellerStatus.APPROVED);
  const [search, setSearch] = useState('');

  const query = trpc.admin.sellers.list.useQuery({
    status: statusFilter === 'ALL' ? undefined : [statusFilter],
    search: search || undefined,
    limit: 100,
  });

  return (
    <div>
      <div className="flex flex-col gap-3 border-b border-border/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Üretici, slug, e-posta…"
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
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-border/60 bg-muted/30 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Üretici</th>
                <th className="px-4 py-3">Tür</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">Performans</th>
                <th className="px-4 py-3">Onay tarihi</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {query.data.items.map((s) => (
                <tr
                  key={s.id}
                  className="group border-b border-border/40 last:border-0 hover:bg-muted/20"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-semibold text-primary ring-1 ring-primary/15">
                        {s.displayName.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <Link
                          href={`/uretici-basvurulari/${s.id}`}
                          className="block font-medium hover:text-primary"
                        >
                          {s.displayName}
                        </Link>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          /uretici/{s.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <Badge tone="outline" className="rounded-md">
                      {sellerKindTr[s.kind] ?? s.kind}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill tone={sellerStatusTone[s.status] ?? 'neutral'}>
                      {sellerStatusTr[s.status] ?? s.status}
                    </StatusPill>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                    <p>
                      {s.productCount} ürün · {s.orderCount} sipariş
                    </p>
                    <p>★ {Number(s.ratingAverage).toFixed(2)}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                    {s.approvedAt
                      ? new Date(s.approvedAt).toLocaleDateString('tr-TR')
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/uretici-basvurulari/${s.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      Aç <ChevronRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <Store className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-sm font-medium">Bu filtreye uyan üretici yok.</p>
        </div>
      )}
    </div>
  );
}
