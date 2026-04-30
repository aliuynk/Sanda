import { Card, CardContent } from '@sanda/ui-web';

import { OrdersClient } from './orders-client';

export const metadata = {
  title: 'Siparişler',
};

export default function OrdersAdminPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Operasyon
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Siparişler
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Pazaryeri çapındaki tüm siparişleri filtrele. Operasyonel müdahale gerektiğinde
          uyuşmazlıklar sekmesinden atama ve takibi yap.
        </p>
      </header>

      <Card className="border-border/70 bg-card/70 shadow-sm">
        <CardContent className="p-0">
          <OrdersClient />
        </CardContent>
      </Card>
    </div>
  );
}
