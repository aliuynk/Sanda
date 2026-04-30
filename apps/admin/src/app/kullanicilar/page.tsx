import { Card, CardContent } from '@sanda/ui-web';

import { UsersClient } from './users-client';

export const metadata = {
  title: 'Kullanıcılar',
};

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Dizin
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Kullanıcılar
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Alıcı ve satıcı hesapları. KVKK uyarınca PII alanlar maskelenmiştir; tam erişim için
          audit log üzerinden geçici yetki açılır.
        </p>
      </header>

      <Card className="border-border/70 bg-card/70 shadow-sm">
        <CardContent className="p-0">
          <UsersClient />
        </CardContent>
      </Card>
    </div>
  );
}
