import { formatDate, formatTry, kurus } from '@sanda/core';
import {
  Badge,
  Card,
  CardContent,
  StatusPill,
} from '@sanda/ui-web';
import {
  ArrowLeft,
  Box,
  CalendarDays,
  MapPin,
  Package,
  Phone,
  Truck,
  User,
} from 'lucide-react';
import type { Metadata } from 'next';
import type { Route } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { orderStatusTr } from '@/lib/order-status';
import { getServerTrpc } from '@/trpc/server';

import { OrderActions } from './order-actions';

export const metadata: Metadata = { title: 'Sipariş detayı' };

type StatusTone = 'success' | 'warning' | 'destructive' | 'info' | 'neutral' | 'primary';

const statusTone: Record<string, StatusTone> = {
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

export default async function SellerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trpc = await getServerTrpc();

  // We use listForSeller to get order with buyer info — find by matching
  const { items } = await trpc.orders.listForSeller({ limit: 50 });
  const order = items.find((o) => o.id === id);
  if (!order) notFound();

  const buyerName = order.buyer.profile
    ? `${order.buyer.profile.firstName} ${order.buyer.profile.lastName}`.trim()
    : 'İsimsiz';
  const buyerPhone = order.buyer.phone ?? '—';

  const tone = statusTone[order.status] ?? 'neutral';

  const canShip = ['PAID', 'AWAITING_FULFILLMENT', 'IN_PREPARATION'].includes(order.status);
  const canPrepare = ['PAID', 'AWAITING_FULFILLMENT'].includes(order.status);

  return (
    <div className="space-y-8">
      {/* Back + header */}
      <div className="flex items-center gap-3">
        <Link
          href={'/satici/siparisler' as Route}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-card text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
              #{order.orderNumber}
            </h1>
            <StatusPill tone={tone}>
              {orderStatusTr[order.status] ?? order.status}
            </StatusPill>
          </div>
          <p className="mt-1 text-xs text-muted-foreground tabular-nums">
            <CalendarDays className="mr-1 inline-block h-3 w-3" />
            {new Date(order.placedAt).toLocaleString('tr-TR', {
              dateStyle: 'long',
              timeStyle: 'short',
            })}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Order items */}
          <Card className="border-border/70 shadow-sm">
            <CardContent className="p-0">
              <div className="border-b border-border/60 px-5 py-3.5">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  <Package className="h-4 w-4 text-primary" />
                  Ürünler
                </h2>
              </div>
              <div className="divide-y divide-border/50">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted">
                      <Box className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{item.productNameSnapshot}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.variantNameSnapshot} · {String(item.quantity)} {item.unit.toLowerCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums">
                        {formatTry(kurus(item.totalKurus))}
                      </p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        @ {formatTry(kurus(item.unitPriceKurus))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Totals */}
              <div className="space-y-2 border-t border-border/60 px-5 py-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ara toplam</span>
                  <span className="tabular-nums">{formatTry(kurus(order.subtotalKurus))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Kargo</span>
                  <span className="tabular-nums">{formatTry(kurus(order.shippingKurus))}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span>Toplam</span>
                  <span className="tabular-nums">{formatTry(kurus(order.totalKurus))}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial breakdown */}
          <Card className="border-border/70 shadow-sm">
            <CardContent className="p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Mali özet
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sipariş toplamı</span>
                  <span className="tabular-nums">{formatTry(kurus(order.totalKurus))}</span>
                </div>
                <div className="flex justify-between text-destructive">
                  <span>Platform komisyonu</span>
                  <span className="tabular-nums">−{formatTry(kurus(order.platformFeeKurus))}</span>
                </div>
                <div className="flex justify-between border-t border-border/60 pt-3 font-semibold">
                  <span>Net tahsilatınız</span>
                  <span className="tabular-nums text-primary">
                    {formatTry(kurus(order.sellerNetKurus))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card className="border-border/70 shadow-sm">
            <CardContent className="p-5">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Zaman çizelgesi
              </h2>
              <div className="relative space-y-4 pl-6">
                <div className="absolute bottom-0 left-[9px] top-0 w-px bg-border/60" />
                <TimelineItem
                  label="Sipariş oluşturuldu"
                  date={order.placedAt}
                  active
                />
                {order.paidAt && (
                  <TimelineItem label="Ödeme alındı" date={order.paidAt} active />
                )}
                {order.shippedAt && (
                  <TimelineItem label="Kargoya verildi" date={order.shippedAt} active />
                )}
                {order.deliveredAt && (
                  <TimelineItem label="Teslim edildi" date={order.deliveredAt} active />
                )}
                {order.completedAt && (
                  <TimelineItem label="Tamamlandı" date={order.completedAt} active />
                )}
                {order.cancelledAt && (
                  <TimelineItem label="İptal edildi" date={order.cancelledAt} destructive />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {/* Actions */}
          <OrderActions
            orderId={order.id}
            status={order.status}
            canShip={canShip}
            canPrepare={canPrepare}
            trackingNumber={order.trackingNumber}
            carrier={order.carrier}
          />

          {/* Buyer info */}
          <Card className="border-border/70 shadow-sm">
            <CardContent className="p-5">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <User className="h-4 w-4 text-primary" />
                Alıcı bilgisi
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium">{buyerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="tabular-nums text-muted-foreground">{buyerPhone}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping address */}
          {order.shippingAddress && (
            <Card className="border-border/70 shadow-sm">
              <CardContent className="p-5">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  Teslimat adresi
                </h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{order.shippingAddress.recipient}</p>
                  <p>{order.shippingAddress.line1}</p>
                  {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                  <p>
                    İlçe {order.shippingAddress.districtId} / İl {order.shippingAddress.provinceCode}
                  </p>
                  {order.shippingAddress.postalCode && (
                    <p className="tabular-nums">{order.shippingAddress.postalCode}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tracking info */}
          {order.trackingNumber && (
            <Card className="border-primary/20 bg-primary/[0.03] shadow-sm">
              <CardContent className="p-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  <Truck className="h-4 w-4 text-primary" />
                  Kargo takip
                </h3>
                <div className="space-y-2 text-sm">
                  {order.carrier && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taşıyıcı</span>
                      <Badge tone="outline" className="rounded-md">{order.carrier}</Badge>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Takip no</span>
                    <span className="font-mono text-xs font-semibold">{order.trackingNumber}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seller notes */}
          {order.buyerNotes && (
            <Card className="border-border/70 shadow-sm">
              <CardContent className="p-5">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Alıcı notu
                </h3>
                <p className="text-sm italic text-muted-foreground">&ldquo;{order.buyerNotes}&rdquo;</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function TimelineItem({
  label,
  date,
  active,
  destructive,
}: {
  label: string;
  date: Date | string;
  active?: boolean;
  destructive?: boolean;
}) {
  return (
    <div className="relative flex items-start gap-3">
      <span
        className={`absolute -left-[15px] top-1 h-3 w-3 rounded-full ring-2 ring-card ${
          destructive
            ? 'bg-destructive'
            : active
              ? 'bg-primary'
              : 'bg-muted-foreground/30'
        }`}
      />
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs tabular-nums text-muted-foreground">
          {new Date(date).toLocaleString('tr-TR', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </p>
      </div>
    </div>
  );
}
