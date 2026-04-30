import { Card, CardContent } from '@sanda/ui-web';

import { SellerDirectoryClient } from './directory-client';

export const metadata = {
  title: 'Üreticiler',
};

export default function SellerDirectoryPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Dizin
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Üreticiler
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Onaylı, askıda ve reddedilmiş tüm üreticilerin tek panelden görünümü. Profili açmak için
          satırı seç.
        </p>
      </header>

      <Card className="border-border/70 bg-card/70 shadow-sm">
        <CardContent className="p-0">
          <SellerDirectoryClient />
        </CardContent>
      </Card>
    </div>
  );
}
