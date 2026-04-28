import { Badge, Button, Card, CardContent } from '@sanda/ui-web';
import { CheckCircle2, Leaf, Package, ShoppingBag } from 'lucide-react';
import type { Metadata } from 'next';
import type { Route } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sipariş onayı',
  description: 'Siparişin başarıyla oluşturuldu.',
};

export default function OrderConfirmationPage() {
  return (
    <div className="container max-w-2xl py-16 md:py-24">
      <div className="flex flex-col items-center text-center">
        {/* Success animation */}
        <div className="relative mb-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/12 ring-4 ring-primary/10">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
          <span className="absolute -right-1 -top-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
            <Leaf className="h-4 w-4" />
          </span>
        </div>

        <Badge tone="success" className="mb-4 rounded-lg px-3 py-1 text-sm">
          Sipariş oluşturuldu
        </Badge>

        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Teşekkürler!
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
          Siparişin başarıyla oluşturuldu. Üretici hazırlık sürecine başladığında seni bilgilendireceğiz.
          Sipariş detaylarını aşağıdan takip edebilirsin.
        </p>

        <Card className="mt-10 w-full border-border/70 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Durum</span>
                <Badge tone="info" className="rounded-md">Ödeme bekleniyor</Badge>
              </div>

              <div className="rounded-xl border border-primary/15 bg-primary/[0.04] p-4 text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Emanet ödeme aktif</p>
                <p className="mt-1">
                  Ödeme tutarı iyzico güvenli altyapısında emanette tutulur.
                  Teslimat onayından sonra üreticiye aktarılır.
                </p>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-muted/20 p-4 text-xs text-muted-foreground">
                <Package className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Sonraki adımlar</p>
                  <ul className="mt-2 space-y-1 list-inside list-disc">
                    <li>Üretici siparişi onaylayıp hazırlığa başlayacak.</li>
                    <li>Kargoya verildiğinde takip numarasını SMS ile alacaksın.</li>
                    <li>Teslimattan sonra ürünleri değerlendirebilirsin.</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href={'/siparislerim' as Route}>
            <Button variant="outline" className="gap-2 rounded-xl">
              <Package className="h-4 w-4" />
              Siparişlerimi gör
            </Button>
          </Link>
          <Link href={'/kesfet' as Route}>
            <Button className="gap-2 rounded-xl shadow-md shadow-primary/20">
              <ShoppingBag className="h-4 w-4" />
              Keşfetmeye devam et
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
