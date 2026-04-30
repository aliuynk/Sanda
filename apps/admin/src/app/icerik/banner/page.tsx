import { Card, CardContent, EmptyState } from '@sanda/ui-web';
import { Megaphone } from 'lucide-react';

export const metadata = {
  title: 'Banner',
};

export default function BannerAdminPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          İçerik
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Banner & kampanyalar
        </h1>
      </header>

      <Card className="border-border/70 bg-card/70 shadow-sm">
        <CardContent className="p-0">
          <EmptyState
            icon={<Megaphone className="h-10 w-10" />}
            title="Banner yönetimi"
            description="Ana sayfa, kategori ve sezonluk banner'lar Banner modeli üzerinden yayınlanır. Yükleme + zamanlama UI'ı eklenecek."
          />
        </CardContent>
      </Card>
    </div>
  );
}
