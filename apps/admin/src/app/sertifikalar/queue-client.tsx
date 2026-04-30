'use client';

import { CertificationStatus } from '@sanda/db/types';
import { Badge, cn, Spinner, StatusPill } from '@sanda/ui-web';
import { ChevronRight, Filter, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { trpc } from '@/trpc/shared';

const STATUS_FILTERS: { value: CertificationStatus | 'ALL'; label: string }[] = [
  { value: CertificationStatus.PENDING_REVIEW, label: 'İncelemede' },
  { value: CertificationStatus.VERIFIED, label: 'Doğrulandı' },
  { value: CertificationStatus.REJECTED, label: 'Reddedildi' },
  { value: CertificationStatus.EXPIRED, label: 'Süresi doldu' },
  { value: 'ALL', label: 'Tümü' },
];

const certStatusTone: Record<string, 'success' | 'warning' | 'destructive' | 'info' | 'neutral'> = {
  PENDING_REVIEW: 'warning',
  VERIFIED: 'success',
  REJECTED: 'destructive',
  EXPIRED: 'neutral',
  REVOKED: 'destructive',
};

const certStatusTr: Record<string, string> = {
  PENDING_REVIEW: 'İncelemede',
  VERIFIED: 'Doğrulandı',
  REJECTED: 'Reddedildi',
  EXPIRED: 'Süresi doldu',
  REVOKED: 'İptal edildi',
};

export function CertQueueClient() {
  const [statusFilter, setStatusFilter] = useState<CertificationStatus | 'ALL'>(
    CertificationStatus.PENDING_REVIEW,
  );

  const query = trpc.admin.certifications.list.useQuery({
    status: statusFilter === 'ALL' ? undefined : [statusFilter],
    limit: 60,
  });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-border/60 px-4 py-3">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setStatusFilter(f.value)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
              statusFilter === f.value
                ? 'border-primary/40 bg-primary/12 text-primary'
                : 'border-border/80 bg-card text-muted-foreground hover:border-primary/25 hover:text-foreground',
            )}
          >
            {f.label}
          </button>
        ))}
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
                <th className="px-4 py-3">Tip</th>
                <th className="px-4 py-3">Üretici</th>
                <th className="px-4 py-3">Veren kurum / no</th>
                <th className="px-4 py-3">Geçerlilik</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {query.data.items.map((c) => (
                <tr
                  key={c.id}
                  className="group border-b border-border/40 last:border-0 hover:bg-muted/20"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      <span className="font-medium">{c.type.replaceAll('_', ' ')}</span>
                    </div>
                    {c.products.length > 0 ? (
                      <Badge tone="outline" className="mt-1 rounded-md text-[10px]">
                        {c.products.length} ürüne kapsam
                      </Badge>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/uretici-basvurulari/${c.seller.id}`}
                      className="font-medium hover:text-primary"
                    >
                      {c.seller.displayName}
                    </Link>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {c.seller.kind.replaceAll('_', ' ')}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm">{c.issuer}</p>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {c.certificateNumber}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                    {new Date(c.issuedAt).toLocaleDateString('tr-TR')} →{' '}
                    {new Date(c.expiresAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill tone={certStatusTone[c.status] ?? 'neutral'}>
                      {certStatusTr[c.status] ?? c.status}
                    </StatusPill>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/sertifikalar/${c.id}`}
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
          <ShieldCheck className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-sm font-medium">Bu filtre için sertifika yok.</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            Yeni sertifika yüklendiğinde burada görünür.
          </p>
        </div>
      )}
    </div>
  );
}
