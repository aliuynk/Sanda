import { formatTry, kurus } from '@sanda/core';
import {
  Badge,
  Card,
  CardContent,
  cn,
  StatusDot,
  StatusPill,
} from '@sanda/ui-web';
import {
  Activity,
  AlertTriangle,
  Box,
  ClipboardList,
  Coins,
  ExternalLink,
  FileSearch,
  MessageSquareWarning,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import { getServerTrpc } from '@/trpc/server';

const sellerStatusTr: Record<string, string> = {
  DRAFT: 'Taslak',
  PENDING_REVIEW: 'İncelemede',
  APPROVED: 'Onaylı',
  SUSPENDED: 'Askıda',
  REJECTED: 'Reddedildi',
};

const sellerStatusTone: Record<string, 'success' | 'warning' | 'destructive' | 'info' | 'neutral'> = {
  DRAFT: 'neutral',
  PENDING_REVIEW: 'warning',
  APPROVED: 'success',
  SUSPENDED: 'destructive',
  REJECTED: 'destructive',
};

const certStatusTr: Record<string, string> = {
  PENDING_REVIEW: 'İncelemede',
  VERIFIED: 'Doğrulandı',
  REJECTED: 'Reddedildi',
  EXPIRED: 'Süresi doldu',
  REVOKED: 'İptal edildi',
};

export default async function AdminDashboard() {
  const trpc = await getServerTrpc();
  const [stats, activity] = await Promise.all([
    trpc.admin.stats(),
    trpc.admin.recentActivity({ limit: 8 }),
  ]);

  const queues = [
    {
      label: 'Üretici başvuruları',
      icon: ClipboardList,
      value: stats.sellers.pending,
      href: '/uretici-basvurulari',
      tone: stats.sellers.pending > 0 ? 'warning' : 'success',
      hint: 'Onay bekleyen profiller',
    },
    {
      label: 'Sertifika doğrulama',
      icon: ShieldCheck,
      value: stats.certifications.pending,
      href: '/sertifikalar',
      tone: stats.certifications.pending > 0 ? 'warning' : 'success',
      hint: 'Belge inceleme kuyruğu',
    },
    {
      label: 'Süresi yaklaşan sertifika',
      icon: AlertTriangle,
      value: stats.certifications.expiringIn30,
      href: '/sertifikalar?status=VERIFIED',
      tone: stats.certifications.expiringIn30 > 0 ? 'warning' : 'success',
      hint: '30 gün içinde dolacak',
    },
    {
      label: 'Açık uyuşmazlık',
      icon: MessageSquareWarning,
      value: stats.orders.disputed,
      href: '/uyusmazliklar',
      tone: stats.orders.disputed > 0 ? 'destructive' : 'success',
      hint: 'Müdahale gereken siparişler',
    },
  ] as const;

  const kpis = [
    {
      label: 'GMV (30 gün)',
      icon: Coins,
      value: formatTry(kurus(stats.orders.gmv30dKurus)),
      sub: `${formatTry(kurus(stats.orders.commission30dKurus))} platform komisyonu`,
      tone: 'primary',
    },
    {
      label: 'Açık siparişler',
      icon: ShoppingBag,
      value: stats.orders.open.toString(),
      sub: `${stats.orders.last7d} son 7 gün`,
      tone: 'info',
    },
    {
      label: 'Onaylı üreticiler',
      icon: Store,
      value: stats.sellers.approved.toString(),
      sub: `${stats.sellers.total} toplam profil`,
      tone: 'success',
    },
    {
      label: 'Aktif kullanıcı',
      icon: Users,
      value: stats.users.active.toString(),
      sub: `${stats.products.active} yayında ürün`,
      tone: 'neutral',
    },
  ] as const;

  return (
    <div className="space-y-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Operasyon paneli
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Bugün ne yapılması gerekiyor?
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Sıraları öncelik düzeyine göre çalış. Onay/red ve sertifika doğrulama eylemleri{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]">AuditEvent</code>{' '}
            olarak iz bırakır; her aksiyon geri alınabilir.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/uretici-basvurulari"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition-colors hover:bg-primary/90"
          >
            Sıraları aç
            <ExternalLink className="h-4 w-4" />
          </Link>
          <Link
            href="/sistem/audit"
            className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-card px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
          >
            <FileSearch className="h-4 w-4" />
            Audit log
          </Link>
        </div>
      </header>

      {/* Queue bar */}
      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          İnceleme kuyrukları
        </p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {queues.map((q) => {
            const Icon = q.icon;
            return (
              <Link
                key={q.label}
                href={q.href}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm ring-1 ring-black/[0.03] backdrop-blur-md transition-all hover:-translate-y-0.5 hover:shadow-md',
                  q.value > 0 && q.tone === 'warning' && 'border-amber-200/50 bg-amber-50/30',
                  q.value > 0 && q.tone === 'destructive' && 'border-red-200/50 bg-red-50/30',
                )}
              >
                <div className="flex items-start justify-between">
                  <span
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-xl ring-1',
                      q.tone === 'warning'
                        ? 'bg-amber-100 text-amber-700 ring-amber-200/60 dark:bg-amber-950 dark:text-amber-300'
                        : q.tone === 'destructive'
                          ? 'bg-red-100 text-red-700 ring-red-200/60 dark:bg-red-950 dark:text-red-300'
                          : 'bg-emerald-100 text-emerald-700 ring-emerald-200/60 dark:bg-emerald-950 dark:text-emerald-300',
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <StatusDot tone={q.tone} pulse={q.value > 0} />
                </div>
                <p className="mt-4 font-display text-3xl font-semibold tabular-nums">
                  {q.value}
                </p>
                <p className="mt-1 text-sm font-medium">{q.label}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{q.hint}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* KPI band */}
      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Performans göstergeleri
        </p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card
                key={kpi.label}
                className="border-border/70 bg-card/70 shadow-sm backdrop-blur-md"
              >
                <CardContent className="flex flex-col gap-3 p-5">
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
                      <Icon className="h-4 w-4 text-primary" />
                    </span>
                    <Badge tone="outline" className="text-[10px] uppercase">
                      {kpi.label}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-display text-2xl font-semibold tabular-nums">{kpi.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{kpi.sub}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Activity */}
      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/70 shadow-sm lg:col-span-2">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Son siparişler
                </h2>
              </div>
              <Link href="/siparisler" className="text-xs font-semibold text-primary hover:underline">
                Tümü →
              </Link>
            </div>
            {activity.orders.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6 py-14 text-center text-muted-foreground">
                <ShoppingBag className="h-10 w-10 opacity-30" />
                <p className="text-sm">Henüz hiç sipariş yok.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border/50">
                {activity.orders.map((o) => (
                  <li key={o.id} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/siparisler?q=${encodeURIComponent(o.orderNumber)}`}
                        className="block truncate font-mono text-sm font-semibold hover:text-primary"
                      >
                        #{o.orderNumber}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        {o.seller.displayName}
                      </p>
                    </div>
                    <StatusPill tone={mapOrderStatusTone(o.status)} className="shrink-0">
                      {o.status.replaceAll('_', ' ').toLowerCase()}
                    </StatusPill>
                    <div className="hidden text-right sm:block">
                      <p className="font-semibold tabular-nums">
                        {formatTry(kurus(o.totalKurus))}
                      </p>
                      <p className="text-[11px] text-muted-foreground tabular-nums">
                        {new Date(o.placedAt).toLocaleString('tr-TR', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Yeni başvurular
                </h2>
              </div>
              <Link
                href="/uretici-basvurulari"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Sıra →
              </Link>
            </div>
            {activity.sellers.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6 py-14 text-center text-muted-foreground">
                <Store className="h-10 w-10 opacity-30" />
                <p className="text-sm">Henüz başvuru yok.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border/50">
                {activity.sellers.slice(0, 6).map((s) => (
                  <li key={s.id} className="flex items-center gap-3 px-5 py-3.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">
                      {s.displayName.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/uretici-basvurulari/${s.id}`}
                        className="block truncate text-sm font-medium hover:text-primary"
                      >
                        {s.displayName}
                      </Link>
                      <p className="text-[11px] text-muted-foreground">
                        {s.kind.replaceAll('_', ' ')} · {new Date(s.createdAt).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <StatusPill tone={sellerStatusTone[s.status] ?? 'neutral'}>
                      {sellerStatusTr[s.status] ?? s.status}
                    </StatusPill>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Son sertifikalar
                </h2>
              </div>
              <Link href="/sertifikalar" className="text-xs font-semibold text-primary hover:underline">
                Tümü →
              </Link>
            </div>
            {activity.certifications.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6 py-14 text-center text-muted-foreground">
                <ShieldCheck className="h-10 w-10 opacity-30" />
                <p className="text-sm">Henüz yüklenmiş sertifika yok.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border/50">
                {activity.certifications.map((c) => (
                  <li key={c.id} className="flex items-center gap-4 px-5 py-3.5">
                    <Box className="h-5 w-5 shrink-0 text-muted-foreground/60" />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/sertifikalar/${c.id}`}
                        className="block truncate text-sm font-medium hover:text-primary"
                      >
                        {c.type.replaceAll('_', ' ')} · {c.issuer}
                      </Link>
                      <p className="text-[11px] text-muted-foreground">{c.seller.displayName}</p>
                    </div>
                    <StatusPill tone={mapCertTone(c.status)} className="shrink-0">
                      {certStatusTr[c.status] ?? c.status}
                    </StatusPill>
                    <div className="hidden text-[11px] text-muted-foreground tabular-nums sm:block">
                      {new Date(c.createdAt).toLocaleDateString('tr-TR')}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function mapOrderStatusTone(s: string): 'success' | 'warning' | 'destructive' | 'info' | 'neutral' | 'primary' {
  if (['DELIVERED', 'COMPLETED'].includes(s)) return 'success';
  if (['CANCELLED', 'DISPUTED', 'REFUNDED'].includes(s)) return 'destructive';
  if (['PENDING_PAYMENT', 'REFUND_REQUESTED'].includes(s)) return 'warning';
  return 'info';
}

function mapCertTone(s: string): 'success' | 'warning' | 'destructive' | 'info' | 'neutral' | 'primary' {
  if (s === 'VERIFIED') return 'success';
  if (s === 'PENDING_REVIEW') return 'warning';
  if (s === 'REJECTED' || s === 'REVOKED') return 'destructive';
  if (s === 'EXPIRED') return 'neutral';
  return 'neutral';
}
