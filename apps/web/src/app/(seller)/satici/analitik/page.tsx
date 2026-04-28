import { formatTry, kurus } from '@sanda/core';
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@sanda/ui-web';
import {
  BarChart3,
  Eye,
  Package,
  Percent,
  ShoppingCart,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import type { Metadata } from 'next';

import { getServerTrpc } from '@/trpc/server';

export const metadata: Metadata = {
  title: 'Analitik',
  description: 'Satıcı performans metrikleri ve ziyaretçi istatistikleri.',
};

export default async function SellerAnalyticsPage() {
  const trpc = await getServerTrpc();
  const { items: orders } = await trpc.orders.listForSeller({ limit: 200 });
  const { items: products } = await trpc.catalog.listMine({ limit: 100 });

  // Compute KPIs from real data
  const totalOrders = orders.length;
  const completedOrders = orders.filter(
    (o) => o.status === 'COMPLETED' || o.status === 'DELIVERED',
  ).length;
  const cancelledOrders = orders.filter((o) => o.status === 'CANCELLED').length;
  const totalRevenue = orders
    .filter((o) => o.status === 'COMPLETED' || o.status === 'DELIVERED')
    .reduce((s, o) => s + o.sellerNetKurus, 0);
  const activeProducts = products.filter((p) => p.status === 'ACTIVE').length;
  const avgOrderValue = completedOrders > 0
    ? Math.round(totalRevenue / completedOrders)
    : 0;
  const conversionRate = totalOrders > 0
    ? Math.round((completedOrders / totalOrders) * 100)
    : 0;

  // Top products by appearance in orders
  const productOrderCount = new Map<string, { name: string; count: number; revenue: number }>();
  for (const order of orders) {
    for (const item of order.items) {
      const key = item.productNameSnapshot;
      const existing = productOrderCount.get(key) ?? { name: key, count: 0, revenue: 0 };
      existing.count += 1;
      existing.revenue += item.totalKurus;
      productOrderCount.set(key, existing);
    }
  }
  const topProducts = Array.from(productOrderCount.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Monthly order distribution
  const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const monthlyOrders = new Map<number, number>();
  for (const order of orders) {
    const month = new Date(order.placedAt).getMonth();
    monthlyOrders.set(month, (monthlyOrders.get(month) ?? 0) + 1);
  }
  const maxMonthly = Math.max(...Array.from(monthlyOrders.values()), 1);

  const kpis = [
    {
      title: 'Toplam sipariş',
      value: String(totalOrders),
      icon: <ShoppingCart className="h-4 w-4 text-primary" />,
      subtitle: `${completedOrders} tamamlandı`,
    },
    {
      title: 'Net gelir',
      value: formatTry(kurus(totalRevenue)),
      icon: <TrendingUp className="h-4 w-4 text-emerald-500" />,
      subtitle: 'Komisyon sonrası',
    },
    {
      title: 'Ort. sipariş değeri',
      value: formatTry(kurus(avgOrderValue)),
      icon: <BarChart3 className="h-4 w-4 text-amber-500" />,
      subtitle: 'Tamamlanan siparişler',
    },
    {
      title: 'Aktif ürün',
      value: String(activeProducts),
      icon: <Package className="h-4 w-4 text-blue-500" />,
      subtitle: `${products.length} toplam`,
    },
    {
      title: 'Tamamlanma oranı',
      value: `%${conversionRate}`,
      icon: <Percent className="h-4 w-4 text-violet-500" />,
      subtitle: `${cancelledOrders} iptal`,
    },
    {
      title: 'Ziyaretçi',
      value: '—',
      icon: <Eye className="h-4 w-4 text-muted-foreground" />,
      subtitle: 'Yakında aktif',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Analitik
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Mağaza performansı, satış metrikleri ve ürün istatistikleri.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="border-border/70 transition-shadow hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              {kpi.icon}
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl font-semibold tabular-nums">{kpi.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{kpi.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly orders chart */}
        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-6">
            <h3 className="mb-6 font-display text-lg font-semibold">Aylık sipariş dağılımı</h3>
            <div className="flex items-end gap-1.5" style={{ height: 160 }}>
              {monthNames.map((name, i) => {
                const count = monthlyOrders.get(i) ?? 0;
                const height = maxMonthly > 0 ? (count / maxMonthly) * 100 : 0;
                return (
                  <div key={i} className="group flex flex-1 flex-col items-center gap-1">
                    <div className="relative flex w-full justify-center" style={{ height: 130 }}>
                      <div
                        className="absolute bottom-0 w-full max-w-[28px] rounded-t-md bg-gradient-to-t from-primary to-primary/60 shadow-sm shadow-primary/15 transition-all duration-300"
                        style={{ height: `${Math.max(height, 2)}%` }}
                      />
                      {count > 0 && (
                        <span className="absolute -top-5 hidden text-[10px] font-semibold text-muted-foreground group-hover:block">
                          {count}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] font-medium text-muted-foreground">{name}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top products */}
        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-6">
            <h3 className="mb-4 font-display text-lg font-semibold">En çok satan ürünler</h3>
            {topProducts.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <Star className="h-8 w-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  Henüz satış verisi yok. İlk siparişten sonra burada görünecek.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {topProducts.map((product, i) => (
                  <div
                    key={product.name}
                    className="flex items-center justify-between rounded-xl bg-muted/20 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/12 text-xs font-semibold text-primary">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.count} sipariş
                        </p>
                      </div>
                    </div>
                    <span className="font-display text-sm font-semibold tabular-nums">
                      {formatTry(kurus(product.revenue))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming features */}
      <Card className="border-dashed border-primary/20 bg-primary/[0.03]">
        <CardContent className="p-6 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Gelecek özellikler</p>
          <ul className="mt-3 list-inside list-disc space-y-2">
            <li>Gerçek zamanlı ziyaretçi sayacı ve sayfa görüntüleme metrikleri</li>
            <li>Ürün bazında dönüşüm oranları (görüntülenme → sepet → sipariş)</li>
            <li>Coğrafi dağılım haritası (siparişlerin geldiği bölgeler)</li>
            <li>Haftalık ve aylık karşılaştırmalı raporlar</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
