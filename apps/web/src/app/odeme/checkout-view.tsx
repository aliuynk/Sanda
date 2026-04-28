'use client';

import { formatTry, kurus } from '@sanda/core';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardContent,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Spinner,
  StatusDot,
  Stepper,
} from '@sanda/ui-web';
import {
  CheckCircle2,
  CreditCard,
  Leaf,
  Lock,
  MapPin,
  Plus,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { trpc } from '@/trpc/shared';

/* ---------------------------------------------------------------------------
 * Checkout steps
 * -------------------------------------------------------------------------- */
const steps = [
  { id: 'address', label: 'Teslimat adresi' },
  { id: 'review', label: 'Sipariş önizleme' },
  { id: 'payment', label: 'Ödeme' },
];

export function CheckoutView() {
  const router = useRouter();
  const { data, isLoading } = trpc.cart.get.useQuery();
  const [step, setStep] = useState('address');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddress, setShowNewAddress] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
        <Leaf className="h-12 w-12 text-muted-foreground/30" />
        <p className="text-muted-foreground">Sepetin boş. Ödeme yapabilmek için ürün eklemelisin.</p>
        <Link href={'/kesfet' as Route} className="text-sm font-semibold text-primary hover:underline">
          Ürünleri keşfet →
        </Link>
      </div>
    );
  }

  const bySeller = groupBy(data.items, (i) => i.product.sellerId);
  const subtotal = data.items.reduce(
    (s, i) => s + i.priceSnapshotKurus * Number(i.quantity),
    0,
  );
  const sellerCount = Object.keys(bySeller).length;

  return (
    <div className="space-y-8">
      {/* Stepper */}
      <Stepper steps={steps} currentStep={step} className="mx-auto max-w-xl" />

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Left panel */}
        <div className="space-y-6">
          {step === 'address' && (
            <AddressStep
              selectedAddressId={selectedAddressId}
              onSelect={setSelectedAddressId}
              onShowNew={() => setShowNewAddress(true)}
              onContinue={() => setStep('review')}
            />
          )}

          {step === 'review' && (
            <ReviewStep
              bySeller={bySeller}
              onBack={() => setStep('address')}
              onContinue={() => setStep('payment')}
            />
          )}

          {step === 'payment' && (
            <PaymentStep
              subtotal={subtotal}
              sellerCount={sellerCount}
              onBack={() => setStep('review')}
            />
          )}
        </div>

        {/* Right sidebar — persistent order summary */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="border-border/70 shadow-lg shadow-black/[0.04]">
            <CardContent className="space-y-5 p-6">
              <h2 className="font-display text-lg font-semibold">Sipariş özeti</h2>

              <div className="space-y-3 border-b border-border/60 pb-4">
                {Object.entries(bySeller).map(([sellerId, items]) => (
                  <div key={sellerId} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Avatar size="sm" alt={items[0]!.product.seller.displayName} />
                      <span className="text-sm font-medium">{items[0]!.product.seller.displayName}</span>
                    </div>
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between pl-10 text-xs text-muted-foreground">
                        <span className="truncate pr-2">
                          {item.product.nameTr} × {Number(item.quantity)}
                        </span>
                        <span className="shrink-0 font-medium tabular-nums text-foreground">
                          {formatTry(kurus(Math.round(item.priceSnapshotKurus * Number(item.quantity))))}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ara toplam</span>
                  <span className="font-semibold tabular-nums">{formatTry(kurus(subtotal))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kargo</span>
                  <span className="text-xs text-muted-foreground">Satıcıya göre hesaplanır</span>
                </div>
              </div>

              <div className="flex justify-between border-t border-border/60 pt-4">
                <span className="font-display text-lg font-semibold">Toplam</span>
                <span className="font-display text-lg font-semibold tabular-nums">
                  {formatTry(kurus(subtotal))}
                </span>
              </div>

              {sellerCount > 1 && (
                <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/[0.04] p-3 text-xs text-muted-foreground">
                  <StatusDot tone="info" className="mt-0.5" />
                  <span>
                    Sepetindeki ürünler <strong className="text-foreground">{sellerCount} farklı üreticiye</strong> ait.
                    Her biri için ayrı sipariş, ayrı kargo oluşturulur.
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5 text-primary" />
                <span>Ödemeler iyzico güvenli altyapısı üzerinden işlenir.</span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* New Address Dialog */}
      <Dialog open={showNewAddress} onOpenChange={setShowNewAddress}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni teslimat adresi</DialogTitle>
            <DialogDescription>
              Siparişinin ulaştırılacağı adresi ekle. İl ve ilçe bilgisi kargo hesaplamasında kullanılır.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Alıcı adı</label>
                <Input placeholder="Ad Soyad" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Telefon</label>
                <Input placeholder="05XX XXX XX XX" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Adres</label>
              <Input placeholder="Mahalle, cadde, sokak, bina no, daire no" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium">İl</label>
                <Input placeholder="İl seçin" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">İlçe</label>
                <Input placeholder="İlçe seçin" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Posta kodu</label>
                <Input placeholder="XXXXX" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewAddress(false)}>
              İptal
            </Button>
            <Button onClick={() => setShowNewAddress(false)}>Adresi kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Step: Address Selection
 * -------------------------------------------------------------------------- */
function AddressStep({
  selectedAddressId,
  onSelect,
  onShowNew,
  onContinue,
}: {
  selectedAddressId: string | null;
  onSelect: (id: string) => void;
  onShowNew: () => void;
  onContinue: () => void;
}) {
  const { data: me, isLoading } = trpc.auth.me.useQuery();

  // Fetch addresses linked to the account
  const { data: addresses = [], isLoading: loadingAddr } = trpc.auth.myAddresses.useQuery();

  // Auto-select default address when addresses load
  useEffect(() => {
    if (!selectedAddressId && addresses.length > 0) {
      const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0];
      if (defaultAddr) onSelect(defaultAddr.id);
    }
  }, [addresses, selectedAddressId, onSelect]);

  if (isLoading || loadingAddr) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="grid gap-3 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl border border-border/60 bg-muted/30" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight">Teslimat adresi</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Siparişinin teslim edileceği adresi seç veya yeni adres ekle.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {addresses.map((addr) => (
          <button
            key={addr.id}
            type="button"
            onClick={() => onSelect(addr.id)}
            className={cn(
              'group relative flex flex-col gap-2 rounded-2xl border p-5 text-left transition-all duration-200',
              selectedAddressId === addr.id
                ? 'border-primary/40 bg-primary/[0.06] ring-2 ring-primary/20'
                : 'border-border/70 bg-card hover:border-primary/25 hover:shadow-md',
            )}
          >
            {addr.isDefault && (
              <Badge tone="info" className="absolute right-3 top-3 rounded-md text-[10px]">
                Varsayılan
              </Badge>
            )}
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-display font-semibold">{addr.label ?? 'Adres'}</span>
            </div>
            <p className="text-sm text-muted-foreground">{addr.recipient}</p>
            <p className="text-sm text-muted-foreground">{addr.line1}</p>
            <p className="text-xs text-muted-foreground">
              İlçe {addr.districtId} / İl {addr.provinceCode}
            </p>
            {selectedAddressId === addr.id && (
              <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            )}
          </button>
        ))}

        <button
          type="button"
          onClick={onShowNew}
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border/80 p-8 text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
        >
          <Plus className="h-6 w-6" />
          <span className="text-sm font-medium">Yeni adres ekle</span>
        </button>
      </div>

      <div className="flex justify-end">
        <Button
          size="lg"
          className="rounded-xl px-8 shadow-md shadow-primary/20"
          disabled={!selectedAddressId}
          onClick={onContinue}
        >
          Devam et
          <Truck className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Step: Order Review
 * -------------------------------------------------------------------------- */
function ReviewStep({
  bySeller,
  onBack,
  onContinue,
}: {
  bySeller: Record<string, CartItemType[]>;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight">Sipariş önizleme</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Her üretici için ayrı sipariş ve kargo oluşturulur. Ürünleri ve tutarları kontrol et.
        </p>
      </div>

      {Object.entries(bySeller).map(([sellerId, items]) => (
        <Card key={sellerId} className="border-border/70 shadow-sm">
          <CardContent className="p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar size="md" alt={items[0]!.product.seller.displayName} />
                <div>
                  <Link
                    href={`/uretici/${items[0]!.product.seller.slug}` as Route}
                    className="font-display text-lg font-semibold hover:text-primary hover:underline"
                  >
                    {items[0]!.product.seller.displayName}
                  </Link>
                  <p className="text-xs text-muted-foreground">Ayrı sipariş olarak işlenecek</p>
                </div>
              </div>
              <Badge tone="outline" className="rounded-lg text-xs">
                <Truck className="h-3 w-3" /> Kargo
              </Badge>
            </div>

            <div className="divide-y divide-border/50">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  {item.product.media[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.product.media[0].url}
                      alt=""
                      className="h-16 w-16 rounded-xl border border-border/60 object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
                      <Leaf className="h-6 w-6 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.product.nameTr}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.variant.nameTr} × {Number(item.quantity)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold tabular-nums">
                      {formatTry(kurus(Math.round(item.priceSnapshotKurus * Number(item.quantity))))}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-xl bg-muted/30 p-3 text-xs text-muted-foreground">
              <Truck className="h-3.5 w-3.5 text-primary" />
              <span>Kargo ücreti ödeme aşamasında hesaplanır.</span>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-between">
        <Button variant="outline" className="rounded-xl" onClick={onBack}>
          ← Adrese dön
        </Button>
        <Button
          size="lg"
          className="rounded-xl px-8 shadow-md shadow-primary/20"
          onClick={onContinue}
        >
          Ödemeye geç
          <CreditCard className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Step: Payment
 * -------------------------------------------------------------------------- */
function PaymentStep({
  subtotal,
  sellerCount,
  onBack,
}: {
  subtotal: number;
  sellerCount: number;
  onBack: () => void;
}) {
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    setProcessing(true);
    // TODO: Integrate with iyzico payment API via tRPC
    setTimeout(() => {
      router.push('/siparis/confirmation' as Route);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight">Ödeme</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Ödeme iyzico güvenli altyapısı üzerinden işlenir. Tutar, teslimat onayına kadar emanette tutulur.
        </p>
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardContent className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12 ring-1 ring-primary/20">
              <CreditCard className="h-5 w-5 text-primary" />
            </span>
            <div>
              <h3 className="font-display text-lg font-semibold">Kredi / Banka kartı</h3>
              <p className="text-xs text-muted-foreground">3D Secure ile güvenli ödeme</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Kart üzerindeki isim</label>
              <Input placeholder="AD SOYAD" className="uppercase" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Kart numarası</label>
              <Input placeholder="XXXX XXXX XXXX XXXX" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Son kullanma</label>
                <Input placeholder="AA/YY" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">CVV</label>
                <Input placeholder="XXX" type="password" />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-start gap-2 rounded-xl border border-primary/15 bg-primary/[0.04] p-3 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <div>
              <p className="font-medium text-foreground">Emanet ödeme (Escrow)</p>
              <p className="mt-0.5">
                Ödenen tutar teslimat onayına kadar iyzico altyapısında güvende tutulur.
                Üreticiye ancak teslimat tamamlandığında aktarılır.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/20 p-5 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Yasal onaylar</p>
        <label className="flex items-start gap-2">
          <input type="checkbox" className="mt-0.5 rounded border-border" />
          <span>
            <Link href={'/yasal/mesafeli-satis' as Route} className="text-primary underline" target="_blank">
              Mesafeli satış sözleşmesi
            </Link>{' '}
            ve{' '}
            <Link href={'/yasal/on-bilgilendirme' as Route} className="text-primary underline" target="_blank">
              ön bilgilendirme formu
            </Link>
            'nu okudum ve onaylıyorum.
          </span>
        </label>
        <label className="flex items-start gap-2">
          <input type="checkbox" className="mt-0.5 rounded border-border" />
          <span>
            Sepetimdeki ürünlerin {sellerCount} farklı üreticiden ayrı siparişler olarak işleneceğini kabul ediyorum.
          </span>
        </label>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" className="rounded-xl" onClick={onBack}>
          ← Geri dön
        </Button>
        <Button
          size="lg"
          loading={processing}
          className="rounded-xl px-8 shadow-lg shadow-primary/20"
          onClick={handlePayment}
        >
          <Lock className="h-4 w-4" />
          {formatTry(kurus(subtotal))} Öde
        </Button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Helpers
 * -------------------------------------------------------------------------- */
type CartItemType = {
  id: string;
  priceSnapshotKurus: number;
  quantity: unknown;
  product: {
    nameTr: string;
    slug: string;
    sellerId: string;
    seller: { slug: string; displayName: string };
    media: Array<{ url: string }>;
  };
  variant: { nameTr: string };
};

function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item);
    acc[k] = acc[k] ? [...acc[k]!, item] : [item];
    return acc;
  }, {});
}
