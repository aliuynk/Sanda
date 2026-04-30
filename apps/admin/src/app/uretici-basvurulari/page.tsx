import { Card, CardContent } from '@sanda/ui-web';

import { SellerQueueClient } from './queue-client';

export const metadata = {
  title: 'Üretici başvuruları',
};

export default function SellerApplicationsPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          İnceleme kuyruğu
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Üretici başvuruları
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Onay öncesinde yasal bilgi, çiftlik profili, hizmet alanı ve kategori gerektiren belgeleri
          tek tek kontrol et. Onay/red kararları AuditEvent olarak iz bırakır; reinstatement her
          zaman mümkündür.
        </p>
      </header>

      <Card className="border-border/70 bg-card/70 shadow-sm">
        <CardContent className="p-0">
          <SellerQueueClient />
        </CardContent>
      </Card>
    </div>
  );
}
