import { formatTry, kurus } from '@sanda/core';
import {
  Badge,
  Card,
  CardContent,
  EmptyState,
  StatusPill,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@sanda/ui-web';
import {
  Box,
  CalendarDays,
  CheckCircle2,
  Clock,
  Package,
  RotateCcw,
  Truck,
  XCircle,
} from 'lucide-react';
import type { Metadata } from 'next';
import type { Route } from 'next';
import Link from 'next/link';

import type { OrderStatus } from '@sanda/db/types';

import { orderStatusTr } from '@/lib/order-status';
import { getServerTrpc } from '@/trpc/server';

export const metadata: Metadata = {
  title: 'Siparişlerim',
  description: 'Sipariş geçmişin ve aktif siparişlerin.',
};

const statusTone: Record<string, 'success' | 'warning' | 'destructive' | 'info' | 'neutral' | 'primary'> = {
  PENDING_PAYMENT: 'warning',
  PAID: 'info',
  AWAITING_FULFILLMENT: 'info',
  IN_PREPARATION: 'primary',
  SHIPPED: 'info',
  OUT_FOR_DELIVERY: 'info',
  DELIVERED: 'success',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
  REFUND_REQUESTED: 'warning',
  REFUNDED: 'neutral',
  DISPUTED: 'destructive',
};

const statusIcon: Record<string, React.ReactNode> = {
  PENDING_PAYMENT: <Clock className="h-4 w-4" />,
  PAID: <CheckCircle2 className="h-4 w-4" />,
  AWAITING_FULFILLMENT: <Package className="h-4 w-4" />,
  IN_PREPARATION: <Box className="h-4 w-4" />,
  SHIPPED: <Truck className="h-4 w-4" />,
  OUT_FOR_DELIVERY: <Truck className="h-4 w-4" />,
  DELIVERED: <CheckCircle2 className="h-4 w-4" />,
  COMPLETED: <CheckCircle2 className="h-4 w-4" />,
  CANCELLED: <XCircle className="h-4 w-4" />,
  REFUND_REQUESTED: <RotateCcw className="h-4 w-4" />,
  REFUNDED: <RotateCcw className="h-4 w-4" />,
};

export default async function MyOrdersPage() {
  const trpc = await getServerTrpc();

  let orders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    totalKurus: number;
    placedAt: Date;
    seller: { displayName: string; slug: string };
    items: Array<{
      productNameSnapshot: string;
      variantNameSnapshot: string;
      quantity: unknown;
      unitPriceKurus: number;
      totalKurus: number;
    }>;
  }>;

  try {
    const result = await trpc.orders.myOrders({ limit: 50 });
    orders = result.items;
  } catch {
    orders = [];
  }

  const active = orders.filter((o) =>
    !['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(o.status),
  );
  const completed = orders.filter((o) =>
    ['COMPLETED', 'CANCELLED', 'REFUNDED'].includes(o.status),
  );

  return (
    <div className="container max-w-4xl py-10 md:py-14">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Siparişlerim
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Aktif ve geçmiş siparişlerini takip et, durum güncellemelerini gör.
        </p>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            <Package className="h-4 w-4" />
            Aktif ({active.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            <CalendarDays className="h-4 w-4" />
            Geçmiş ({completed.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {active.length === 0 ? (
            <EmptyState
              className="rounded-2xl border-primary/15 bg-primary/[0.02]"
              icon={<Package className="h-10 w-10 text-primary" />}
              title="Aktif sipariş yok"
              description="Keşfet sayfasından beğendiğin ürünleri sipariş edebilirsin."
              action={
                <Link href={'/kesfet' as Route} className="font-semibold text-primary underline">
                  Ürünleri keşfet →
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {active.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history">
          {completed.length === 0 ? (
            <EmptyState
              className="rounded-2xl"
              icon={<CalendarDays className="h-10 w-10 text-muted-foreground" />}
              title="Henüz tamamlanmış sipariş yok"
              description="Aktif siparişlerin tamamlandığında burada görünecek."
            />
          ) : (
            <div className="space-y-4">
              {completed.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OrderCard({
  order,
}: {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    totalKurus: number;
    placedAt: Date;
    seller: { displayName: string; slug: string };
    items: Array<{
      productNameSnapshot: string;
      variantNameSnapshot: string;
      quantity: unknown;
      unitPriceKurus: number;
      totalKurus: number;
    }>;
  };
}) {
  const tone = statusTone[order.status] ?? 'neutral';

  return (
    <Card className="group border-border/70 shadow-sm transition-all duration-200 hover:shadow-md">
      <CardContent className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold text-muted-foreground">
                #{order.orderNumber}
              </span>
              <StatusPill tone={tone}>
                {orderStatusTr[order.status as OrderStatus] ?? order.status}
              </StatusPill>
            </div>
            <Link
              href={`/uretici/${order.seller.slug}` as Route}
              className="text-sm font-medium text-foreground hover:text-primary hover:underline"
            >
              {order.seller.displayName}
            </Link>
          </div>
          <div className="text-right">
            <p className="font-display text-lg font-semibold tabular-nums">
              {formatTry(kurus(order.totalKurus))}
            </p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {new Date(order.placedAt).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="mt-4 space-y-2 border-t border-border/50 pt-4">
          {order.items.slice(0, 3).map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {item.productNameSnapshot}
                <span className="text-xs"> ({item.variantNameSnapshot} × {String(item.quantity)})</span>
              </span>
              <span className="font-medium tabular-nums">
                {formatTry(kurus(item.totalKurus))}
              </span>
            </div>
          ))}
          {order.items.length > 3 && (
            <p className="text-xs text-muted-foreground">
              +{order.items.length - 3} ürün daha
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border/50 pt-4">
          <Link
            href={`/siparis/${order.orderNumber}` as Route}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Detayları gör →
          </Link>
          {order.status === 'DELIVERED' && (
            <button type="button" className="text-xs font-semibold text-primary hover:underline">
              Değerlendir
            </button>
          )}
          {order.status === 'DELIVERED' && (
            <button type="button" className="text-xs font-semibold text-muted-foreground hover:underline">
              Tekrar sipariş ver
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
