'use client';

import { formatTry, kurus } from '@sanda/core';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@sanda/ui-web';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  DollarSign,
  Package,
  TrendingUp,
  Wallet,
} from 'lucide-react';

/* ---------------------------------------------------------------------------
 * Enhanced Earnings Dashboard — Client Component
 *
 * Displays revenue KPIs, a CSS-based bar chart (no chart library dep),
 * recent payouts, and commission breakdown.
 * -------------------------------------------------------------------------- */

interface EarningsData {
  totalNet: number;
  totalGross: number;
  totalCommission: number;
  pendingAmount: number;
  completedCount: number;
  pendingCount: number;
  monthlyData: Array<{ month: string; net: number; gross: number }>;
  recentPayouts: Array<{
    id: string;
    date: string;
    amount: number;
    status: 'completed' | 'pending' | 'processing';
  }>;
}

export function EarningsView({ data }: { data: EarningsData }) {
  const maxMonthly = Math.max(...data.monthlyData.map((m) => m.gross), 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Kazanç</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Komisyon sonrası net gelir, ödeme geçmişi ve aylık performans.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Net kazanç"
          value={formatTry(kurus(data.totalNet))}
          subtitle={`${data.completedCount} tamamlanan sipariş`}
          icon={<Wallet className="h-4 w-4 text-primary" />}
          trend={12.5}
          variant="primary"
        />
        <KpiCard
          title="Bekleyen tahsilat"
          value={formatTry(kurus(data.pendingAmount))}
          subtitle={`${data.pendingCount} açık sipariş`}
          icon={<TrendingUp className="h-4 w-4 text-amber-500" />}
        />
        <KpiCard
          title="Brüt satış"
          value={formatTry(kurus(data.totalGross))}
          subtitle="Komisyon öncesi"
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <KpiCard
          title="Platform komisyonu"
          value={formatTry(kurus(data.totalCommission))}
          subtitle={`${data.totalGross > 0 ? Math.round((data.totalCommission / data.totalGross) * 100) : 0}% oran`}
          icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <Tabs defaultValue="chart">
        <TabsList>
          <TabsTrigger value="chart">
            <BarChart3 className="h-4 w-4" /> Aylık grafik
          </TabsTrigger>
          <TabsTrigger value="payouts">
            <CalendarDays className="h-4 w-4" /> Ödemeler
          </TabsTrigger>
        </TabsList>

        {/* Chart tab */}
        <TabsContent value="chart">
          <Card className="border-border/70 shadow-sm">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">Aylık gelir</h3>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                    Net
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary/25" />
                    Brüt
                  </span>
                </div>
              </div>

              {/* CSS Bar Chart */}
              <div className="flex items-end gap-2" style={{ height: 200 }}>
                {data.monthlyData.map((m) => (
                  <div key={m.month} className="group flex flex-1 flex-col items-center gap-1">
                    <div className="relative flex w-full flex-col items-center" style={{ height: 180 }}>
                      {/* Gross bar (background) */}
                      <div
                        className="absolute bottom-0 w-full rounded-t-lg bg-primary/15 transition-all duration-500"
                        style={{ height: `${(m.gross / maxMonthly) * 100}%` }}
                      />
                      {/* Net bar (foreground) */}
                      <div
                        className="absolute bottom-0 w-3/4 rounded-t-lg bg-gradient-to-t from-primary to-primary/70 shadow-sm shadow-primary/20 transition-all duration-500"
                        style={{ height: `${(m.net / maxMonthly) * 100}%` }}
                      />
                      {/* Tooltip on hover */}
                      <div className="pointer-events-none absolute -top-12 z-10 hidden rounded-lg border border-border/60 bg-card px-3 py-1.5 text-xs shadow-lg group-hover:block">
                        <p className="font-semibold">{formatTry(kurus(m.net))}</p>
                        <p className="text-muted-foreground">Brüt: {formatTry(kurus(m.gross))}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground">{m.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payouts tab */}
        <TabsContent value="payouts">
          <Card className="border-border/70 shadow-sm">
            <CardContent className="p-0">
              <div className="border-b border-border/60 px-5 py-3.5">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Hakediş geçmişi
                </h3>
              </div>
              {data.recentPayouts.length === 0 ? (
                <div className="flex flex-col items-center gap-3 p-12 text-center">
                  <Wallet className="h-10 w-10 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    Henüz hakediş ödemesi yok. İlk tamamlanan siparişten sonra burada görünecek.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {data.recentPayouts.map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                          <Wallet className="h-5 w-5 text-primary" />
                        </span>
                        <div>
                          <p className="text-sm font-medium">Hakediş ödemesi</p>
                          <p className="text-xs text-muted-foreground tabular-nums">{payout.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          tone={payout.status === 'completed' ? 'success' : payout.status === 'processing' ? 'info' : 'warning'}
                          className="rounded-md text-[10px]"
                        >
                          {payout.status === 'completed' ? 'Tamamlandı' : payout.status === 'processing' ? 'İşleniyor' : 'Beklemede'}
                        </Badge>
                        <span className="font-display text-sm font-semibold tabular-nums">
                          {formatTry(kurus(payout.amount))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Commission info */}
      <Card className="border-dashed border-primary/20 bg-primary/[0.03]">
        <CardContent className="p-6">
          <h3 className="font-display text-lg font-semibold">Komisyon ve ödeme bilgisi</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-card p-4 shadow-sm ring-1 ring-border/60">
              <p className="text-xs text-muted-foreground">Platform komisyonu</p>
              <p className="mt-1 font-display text-2xl font-semibold text-primary">%10</p>
            </div>
            <div className="rounded-xl bg-card p-4 shadow-sm ring-1 ring-border/60">
              <p className="text-xs text-muted-foreground">Hakediş döngüsü</p>
              <p className="mt-1 font-display text-2xl font-semibold">Haftalık</p>
              <p className="text-xs text-muted-foreground">Her Çarşamba</p>
            </div>
            <div className="rounded-xl bg-card p-4 shadow-sm ring-1 ring-border/60">
              <p className="text-xs text-muted-foreground">Ödeme sağlayıcı</p>
              <p className="mt-1 font-display text-2xl font-semibold">iyzico</p>
              <p className="text-xs text-muted-foreground">Alt üye işyeri</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  trend?: number;
  variant?: 'primary';
}) {
  return (
    <Card className={`border-border/70 ${variant === 'primary' ? 'bg-gradient-to-br from-primary/[0.08] to-card' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <p className="font-display text-3xl font-semibold tabular-nums">{value}</p>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-xs text-muted-foreground">{subtitle}</p>
          {trend != null && (
            <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
