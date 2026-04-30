import { Card, CardContent, EmptyState } from '@sanda/ui-web';
import { Box } from 'lucide-react';

export const metadata = {
  title: 'Ürünler',
};

export default function ProductsAdminPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Dizin
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Ürünler
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Yayın kapılarına takılan veya manuel onay bekleyen ürünler buradan yönetilir. Operasyonel
          olarak ürün düzenleme her zaman üreticinin panelinden yapılır.
        </p>
      </header>

      <Card className="border-border/70 bg-card/70 shadow-sm">
        <CardContent className="p-0">
          <EmptyState
            icon={<Box className="h-10 w-10" />}
            title="Ürün moderasyon kuyruğu hazırlanıyor"
            description="Listing compliance kapısı tarafından bloke edilen ürünlerin admin görünümü ileride bu sayfada listelenecek."
          />
        </CardContent>
      </Card>
    </div>
  );
}
