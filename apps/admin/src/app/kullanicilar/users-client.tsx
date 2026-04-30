'use client';

import { UserStatus } from '@sanda/db/types';
import { Badge, cn, Input, Spinner, StatusPill } from '@sanda/ui-web';
import { Filter, Search, Users } from 'lucide-react';
import { useState } from 'react';

import { trpc } from '@/trpc/shared';

const STATUS_FILTERS: { value: UserStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Tümü' },
  { value: UserStatus.ACTIVE, label: 'Aktif' },
  { value: UserStatus.PENDING_VERIFICATION, label: 'Doğrulanmamış' },
  { value: UserStatus.SUSPENDED, label: 'Askıda' },
  { value: UserStatus.BANNED, label: 'Yasaklı' },
];

const userStatusTone: Record<string, 'success' | 'warning' | 'destructive' | 'info' | 'neutral'> = {
  ACTIVE: 'success',
  PENDING_VERIFICATION: 'warning',
  SUSPENDED: 'destructive',
  BANNED: 'destructive',
  DELETED: 'neutral',
};

const userStatusTr: Record<string, string> = {
  ACTIVE: 'Aktif',
  PENDING_VERIFICATION: 'Doğrulanmamış',
  SUSPENDED: 'Askıda',
  BANNED: 'Yasaklı',
  DELETED: 'Silindi',
};

function maskPhone(phone: string | null) {
  if (!phone) return '—';
  if (phone.length < 6) return phone;
  return `${phone.slice(0, 4)} ••• ${phone.slice(-2)}`;
}

function maskEmail(email: string | null) {
  if (!email) return '—';
  const [local, domain] = email.split('@');
  if (!domain) return email;
  return `${(local ?? '').slice(0, 2)}•••@${domain}`;
}

export function UsersClient() {
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');

  const query = trpc.admin.users.list.useQuery({
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
            placeholder="Ad, telefon, e-posta…"
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
                <th className="px-4 py-3">Kullanıcı</th>
                <th className="px-4 py-3">İletişim</th>
                <th className="px-4 py-3">Roller</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3">Üretici</th>
                <th className="px-4 py-3">Kayıt</th>
              </tr>
            </thead>
            <tbody>
              {query.data.items.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-border/40 last:border-0 hover:bg-muted/20"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">
                      {u.profile?.firstName} {u.profile?.lastName}
                    </p>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {u.id.slice(0, 8)}…
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <p className="font-mono">{maskPhone(u.phone)}</p>
                    <p className="text-muted-foreground">{maskEmail(u.email)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.map((role) => (
                        <Badge key={role} tone="outline" className="rounded-md text-[10px]">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill tone={userStatusTone[u.status] ?? 'neutral'}>
                      {userStatusTr[u.status] ?? u.status}
                    </StatusPill>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {u.sellerProfile ? (
                      <span className="font-medium">{u.sellerProfile.displayName}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums">
                    {new Date(u.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <Users className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-sm font-medium">Bu filtreye uyan kullanıcı yok.</p>
        </div>
      )}
    </div>
  );
}
