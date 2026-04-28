'use client';

import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  useToast,
} from '@sanda/ui-web';
import {
  CheckCircle2,
  Package,
  Truck,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { trpc } from '@/trpc/shared';

const carriers = [
  { value: 'YURTICI', label: 'Yurtiçi Kargo' },
  { value: 'ARAS', label: 'Aras Kargo' },
  { value: 'MNG', label: 'MNG Kargo' },
  { value: 'PTT', label: 'PTT Kargo' },
  { value: 'SURAT', label: 'Sürat Kargo' },
  { value: 'UPS', label: 'UPS' },
  { value: 'HEP_JET', label: 'HepsiJet' },
  { value: 'TRENDYOL_EXPRESS', label: 'Trendyol Express' },
  { value: 'SELLER_OWN', label: 'Kendi teslimatım' },
];

export function OrderActions({
  orderId,
  status,
  canShip,
  canPrepare,
  trackingNumber,
  carrier,
}: {
  orderId: string;
  status: string;
  canShip: boolean;
  canPrepare: boolean;
  trackingNumber: string | null;
  carrier: string | null;
}) {
  const router = useRouter();
  const toast = useToast();
  const [showShipDialog, setShowShipDialog] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState(carrier ?? '');
  const [trackingNo, setTrackingNo] = useState(trackingNumber ?? '');

  const markShipped = trpc.orders.markShipped.useMutation({
    onSuccess: () => {
      setShowShipDialog(false);
      toast.success('Sipariş kargoya verildi', 'Takip bilgisi alıcıya bildirilecek.');
      router.refresh();
    },
    onError: (err) => {
      toast.error('Kargoya verilemedi', err.message);
    },
  });

  const isDelivered = status === 'DELIVERED' || status === 'COMPLETED';
  const isCancelled = status === 'CANCELLED' || status === 'REFUNDED';
  const isShipped = status === 'SHIPPED' || status === 'OUT_FOR_DELIVERY';

  return (
    <>
      <Card className="border-border/70 shadow-sm">
        <CardContent className="space-y-3 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            İşlemler
          </h3>

          {canPrepare && (
            <Button
              className="w-full gap-2 rounded-xl"
              variant="outline"
            >
              <Package className="h-4 w-4" />
              Hazırlanıyor olarak işaretle
            </Button>
          )}

          {canShip && (
            <Button
              className="w-full gap-2 rounded-xl shadow-md shadow-primary/20"
              onClick={() => setShowShipDialog(true)}
            >
              <Truck className="h-4 w-4" />
              Kargoya ver
            </Button>
          )}

          {isShipped && (
            <div className="flex items-center gap-2 rounded-xl border border-info/20 bg-info/[0.05] p-3 text-xs text-muted-foreground">
              <Truck className="h-4 w-4 text-primary" />
              <span>Sipariş kargoda. Teslimat onayını bekliyorsun.</span>
            </div>
          )}

          {isDelivered && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              <span>Sipariş tamamlandı. Ödeme bir sonraki dönemde hesabına aktarılacak.</span>
            </div>
          )}

          {isCancelled && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
              <XCircle className="h-4 w-4" />
              <span>Bu sipariş iptal edildi.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ship dialog */}
      <Dialog open={showShipDialog} onOpenChange={setShowShipDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kargoya ver</DialogTitle>
            <DialogDescription>
              Kargo firmasını ve takip numarasını gir. Bu bilgiler alıcıya bildirim olarak gönderilir.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Kargo firması *</label>
              <Select
                value={selectedCarrier}
                onChange={(e) => setSelectedCarrier(e.target.value)}
              >
                <option value="">Firma seçin</option>
                {carriers.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Takip numarası *</label>
              <Input
                value={trackingNo}
                onChange={(e) => setTrackingNo(e.target.value)}
                placeholder="Kargo takip numarasını girin"
                className="font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShipDialog(false)}>
              İptal
            </Button>
            <Button
              loading={markShipped.isPending}
              disabled={!selectedCarrier || !trackingNo}
              onClick={() =>
                markShipped.mutate({
                  orderId,
                  carrier: selectedCarrier as any,
                  trackingNumber: trackingNo,
                })
              }
            >
              <Truck className="h-4 w-4" />
              Kargoya ver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
