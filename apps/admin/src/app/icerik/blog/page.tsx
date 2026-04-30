import { Card, CardContent, EmptyState } from '@sanda/ui-web';
import { Newspaper } from 'lucide-react';

export const metadata = {
  title: 'Blog',
};

export default function BlogAdminPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          İçerik
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Blog ve hikâyeler
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Üretici hikâyeleri, mevsim rehberleri ve platform duyuruları. Şu an statik içerik
          /hikayeler altında; CMS bağlanınca burada yönetilecek.
        </p>
      </header>

      <Card className="border-border/70 bg-card/70 shadow-sm">
        <CardContent className="p-0">
          <EmptyState
            icon={<Newspaper className="h-10 w-10" />}
            title="CMS entegrasyonu yapılacak"
            description="BlogPost modeli şemada hazır; yazma deneyimi için zengin metin editörü eklenecek."
          />
        </CardContent>
      </Card>
    </div>
  );
}
