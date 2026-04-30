import { Badge, Card, CardContent } from '@sanda/ui-web';
import { Globe2, Shield, Sprout, Target } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Hakkımızda',
  description: 'Sanda’nın misyonu: Türkiye’de üreticinin doğrudan görünür olduğu şeffaf farm-to-table altyapısı.',
};

export default function AboutPage() {
  return (
    <div className="container max-w-4xl py-14 md:py-20">
      <Badge tone="outline" className="mb-6 border-primary/25 bg-primary/[0.06]">
        Misyon
      </Badge>
      <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
        Üreticiyi protokolle değil, <span className="text-primary">ürünüyle</span> tanıtıyoruz.
      </h1>
      <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
        Sanda; organik iddiasını pazarlama sözüne bırakmaz. Sertifikalar yaşam döngüsüyle yönetilir,
        teslimat kuralları coğrafi gerçeklikle eşlenir, çoklu satıcı sepetler checkout’ta şeffafça
        ayrılır. Amaç: Türkiye genelinde tek çatı altında, uzun vadeli güven mimarisi.
      </p>

      <div className="mt-14 grid gap-6 md:grid-cols-2">
        <Card className="border-border/70 shadow-md">
          <CardContent className="flex gap-4 p-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/12">
              <Target className="h-5 w-5 text-primary" aria-hidden />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold">Pazar yeri + operasyon</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Yalnızca liste sayfası değil: sipariş bölme, lisanslı PSP üzerinden submerchant
                hakediş, kargo soy ağacı ve üretici paneli aynı tip sisteminde birleşir.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70 shadow-md">
          <CardContent className="flex gap-4 p-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/12">
              <Shield className="h-5 w-5 text-primary" aria-hidden />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold">Doğrulanabilir güven</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Rozetler admin doğrulamasına dayanır; süresi dolan belge otomatik olarak vitrinden
                düşer. Alıcı “organik” etiketini her zaman belge durumuyla birlikte görür.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70 shadow-md">
          <CardContent className="flex gap-4 p-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/12">
              <Globe2 className="h-5 w-5 text-primary" aria-hidden />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold">Ülke çapında ölçek</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                PostGIS servis alanları ve taşıyıcı soyutlaması ile üretici kendi coğrafyasında
                operasyon kurallarını tanımlar; sistem bunu alıcıya tek tip UX ile sunar.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/70 shadow-md">
          <CardContent className="flex gap-4 p-6">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/12">
              <Sprout className="h-5 w-5 text-primary" aria-hidden />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold">Farm-to-table gerçeği</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Bahçe ziyareti, elden teslim ve kargo aynı üreticide bir arada; her mod için ayrı
                kural seti ve şeffaf SLA.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="mt-14 text-center text-sm text-muted-foreground">
        Üretici olmak için{' '}
        <Link href="/sat" className="font-semibold text-primary hover:underline">
          başvuru sayfasına
        </Link>{' '}
        gidin veya{' '}
        <Link href="/kesfet" className="font-semibold text-primary hover:underline">
          vitrini keşfedin
        </Link>
        .
      </p>
    </div>
  );
}
