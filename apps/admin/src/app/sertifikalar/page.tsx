import { Card, CardContent } from '@sanda/ui-web';

import { CertQueueClient } from './queue-client';

export const metadata = {
  title: 'Sertifika doğrulama',
};

export default function CertificationsPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Doğrulama kuyruğu
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Sertifika doğrulama
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Yüklenen belgeleri (organik, İyi Tarım, HACCP, ISO 22000…) tek tek incele. Doğrulama
          yöntemi olarak manuel inceleme dışında ileride kayıt sorgusu (Tarım Bakanlığı), QR kodu
          veya API kontrolünü seçebileceksin.
        </p>
      </header>

      <Card className="border-border/70 bg-card/70 shadow-sm">
        <CardContent className="p-0">
          <CertQueueClient />
        </CardContent>
      </Card>
    </div>
  );
}
