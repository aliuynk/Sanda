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
  ShieldCheck,
  Truck,
} from 'lucide-react';
import type { Metadata } from 'next';
import type { Route } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { orderStatusTr } from '@/lib/order-status';
import { getServerTrpc } from '@/trpc/server';

export const metadata: Metadata = {
  title: 'Sipariş detayı',
  description: 'Siparişinin detaylarını takip et.',
};

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

export default async function BuyerOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const trpc = await getServerTrpc();

  let order: Awaited<ReturnType<typeof trpc.orders.detail>>;
  try {
    order = await trpc.orders.detail({ orderNumber });
  } catch {
    notFound();
  }

  const tone = statusTone[order.status] ?? 'neutral';

  return (
    <div className="container max-w-4xl py-10 md:py-14">
      {/* Back + header */}
      <div className="mb-8 flex items-center gap-3">
        <Link
          href={'/siparislerim' as Route}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/70 bg-card text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
              Sipariş #{order.orderNumber}
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

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Seller info */}
          <Card className="border-border/70 shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/12 ring-1 ring-primary/20">
                <Package className="h-5 w-5 text-primary" />
              </span>
              <div className="flex-1">
                <Link
                  href={`/uretici/${order.seller.slug}` as Route}
                  className="font-display text-lg font-semibold hover:text-primary hover:underline"
                >
                  {order.seller.displayName}
                </Link>
                <p className="text-xs text-muted-foreground">Üretici</p>
              </div>
              <Link
                href={`/uretici/${order.seller.slug}` as Route}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Profili gör →
              </Link>
            </CardContent>
          </Card>

          {/* Order items */}
          <Card className="border-border/70 shadow-sm">
            <CardContent className="p-0">
              <div className="border-b border-border/60 px-5 py-3.5">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
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
                      <Link
                        href={`/urun/${item.product.slug}` as Route}
                        className="font-medium hover:text-primary hover:underline"
                      >
                        {item.productNameSnapshot}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {item.variantNameSnapshot} · {String(item.quantity)} {item.unit.toLowerCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums">
                        {formatTry(kurus(item.totalKurus))}
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
                {order.discountKurus > 0 && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>İndirim</span>
                    <span className="tabular-nums">−{formatTry(kurus(order.discountKurus))}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border/60 pt-3 text-base font-semibold">
                  <span>Toplam</span>
                  <span className="tabular-nums">{formatTry(kurus(order.totalKurus))}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card className="border-border/70 shadow-sm">
            <CardContent className="p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Sipariş süreci
              </h2>
              <div className="relative space-y-4 pl-6">
                <div className="absolute bottom-0 left-[9px] top-0 w-px bg-border/60" />
                {order.events.map((event, i) => (
                  <div key={event.id} className="relative flex items-start gap-3">
                    <span
                      className={`absolute -left-[15px] top-1 h-3 w-3 rounded-full ring-2 ring-card ${
                        i === order.events.length - 1
                          ? event.type === 'CANCELLED'
                            ? 'bg-destructive'
                            : 'bg-primary'
                          : 'bg-primary/50'
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium">
                        {eventTypeLabel(event.type)}
                        {event.toStatus && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            → {orderStatusTr[event.toStatus] ?? event.toStatus}
                          </span>
                        )}
                      </p>
                      <p className="text-xs tabular-nums text-muted-foreground">
                        {new Date(event.createdAt).toLocaleString('tr-TR', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {/* Shipping address */}
          {order.shippingAddress && (
            <Card className="border-border/70 shadow-sm">
              <CardContent className="p-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
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
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tracking */}
          {order.shipments.length > 0 && (
            <Card className="border-primary/20 bg-primary/[0.03] shadow-sm">
              <CardContent className="p-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  <Truck className="h-4 w-4 text-primary" />
                  Kargo takip
                </h3>
                {order.shipments.map((shipment) => (
                  <div key={shipment.id} className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taşıyıcı</span>
                      <Badge tone="outline" className="rounded-md">{shipment.carrier}</Badge>
                    </div>
                    {shipment.trackingNumber && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Takip no</span>
                        <span className="font-mono text-xs font-semibold">{shipment.trackingNumber}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Durum</span>
                      <Badge tone="info" className="rounded-md">{shipment.status}</Badge>
                    </div>
                    {shipment.events.length > 0 && (
                      <div className="mt-3 space-y-2 border-t border-border/50 pt-3">
                        {shipment.events.map((evt) => (
                          <div key={evt.id} className="text-xs text-muted-foreground">
                            <p className="font-medium text-foreground">{evt.description}</p>
                            <p className="tabular-nums">
                              {new Date(evt.occurredAt).toLocaleString('tr-TR', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })}
                              {evt.location && ` — ${evt.location}`}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Payment */}
          {order.payments.length > 0 && (
            <Card className="border-border/70 shadow-sm">
              <CardContent className="p-5">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Ödeme
                </h3>
                {order.payments.map((payment) => (
                  <div key={payment.id} className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Yöntem</span>
                      <span className="font-medium">{payment.method.replaceAll('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Durum</span>
                      <Badge
                        tone={payment.status === 'CAPTURED' || payment.status === 'RELEASED' ? 'success' : 'neutral'}
                        className="rounded-md"
                      >
                        {payment.status}
                      </Badge>
                    </div>
                    {payment.last4 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Kart</span>
                        <span className="font-mono text-xs">•••• {payment.last4}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tutar</span>
                      <span className="font-semibold tabular-nums">
                        {formatTry(kurus(payment.amountKurus))}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Help */}
          <Card className="border-dashed border-border/70">
            <CardContent className="p-5 text-center">
              <p className="text-sm text-muted-foreground">
                Siparişinle ilgili sorun mu var?
              </p>
              <Link
                href={'/yardim' as Route}
                className="mt-2 inline-block text-sm font-semibold text-primary hover:underline"
              >
                Yardım merkezi →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function eventTypeLabel(type: string): string {
  const map: Record<string, string> = {
    CREATED: 'Sipariş oluşturuldu',
    PAID: 'Ödeme alındı',
    STATUS_CHANGED: 'Durum değişti',
    SHIPPED: 'Kargoya verildi',
    DELIVERED: 'Teslim edildi',
    CANCELLED: 'İptal edildi',
    REFUND_REQUESTED: 'İade talep edildi',
    REFUND_ISSUED: 'İade yapıldı',
    NOTE_ADDED: 'Not eklendi',
    SYSTEM_ADJUSTMENT: 'Sistem düzeltmesi',
  };
  return map[type] ?? type;
}
