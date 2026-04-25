import { Badge, buttonVariants, Card, CardContent, cn } from '@sanda/ui-web';
import {
  ArrowRight,
  Leaf,
  MapPin,
  Radar,
  ShieldCheck,
  Sparkles,
  Truck,
} from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';

import { ProducerCard } from '@/components/producer-card';
import { ProductGrid } from '@/components/product-grid';
import { getServerTrpc } from '@/trpc/server';

export const revalidate = 300;

export default async function HomePage() {
  const trpc = await getServerTrpc();
  const [featured, categories, producers] = await Promise.all([
    trpc.catalog.list({ limit: 8, sort: 'popular' }),
    trpc.catalog.categories(),
    trpc.sellers.list({ limit: 4 }),
  ]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,hsl(var(--primary)/0.18),transparent_55%),radial-gradient(ellipse_50%_40%_at_100%_0%,hsl(var(--accent)/0.12),transparent)]" />
        <div className="bg-noise pointer-events-none absolute inset-0 opacity-30" aria-hidden />
        <div className="container relative grid gap-12 py-16 md:grid-cols-[1.05fr_0.95fr] md:py-24">
          <div className="flex flex-col justify-center gap-8">
            <Badge tone="outline" className="w-fit gap-1.5 border-primary/25 bg-primary/[0.06] px-3 py-1 text-xs font-semibold">
              <Sparkles className="h-3 w-3 text-primary" aria-hidden />
              Aracısız · şeffaf · ülke çapında
            </Badge>
            <h1 className="font-display text-balance text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl lg:text-[3.25rem]">
              Türkiye’nin üreticileri,{' '}
              <span className="bg-gradient-to-r from-primary to-leaf-600 bg-clip-text text-transparent dark:from-primary dark:to-leaf-400">
                tek şeffaf pazarda.
              </span>
            </h1>
            <p className="max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Hasat izi, sertifika durumu ve teslimat kuralları tek ekranda. Üretici nerelere kargo
              gönderdiğini, bahçe ziyaretine açık olup olmadığını kendisi tanımlar — Sanda bunu
              alıcıya aynen gösterir.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/kesfet" className={cn(buttonVariants({ size: 'lg' }), 'rounded-xl px-8 shadow-lg shadow-primary/20')}>
                Ürünleri keşfet
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/sat"
                className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'rounded-xl border-primary/30 bg-background/50')}
              >
                Üretici olarak katıl
              </Link>
            </div>
            <TrustRow />
          </div>

          <div className="relative flex flex-col justify-between gap-6 rounded-3xl border border-border/70 bg-card/80 p-8 shadow-xl shadow-black/[0.04] ring-1 ring-black/[0.04] backdrop-blur-md">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/15 blur-3xl" aria-hidden />
            <div className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-accent/10 blur-3xl" aria-hidden />
            <div className="relative space-y-6">
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/12 ring-1 ring-primary/20">
                  <ShieldCheck className="h-6 w-6 text-primary" aria-hidden />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold">Doğrulanmış sertifikalar</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Organik, İyi Tarım, coğrafi işaret — belgeler yaşam döngüsüyle yönetilir; süresi
                    dolan rozet otomatik düşer.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/12 ring-1 ring-primary/20">
                  <Radar className="h-6 w-6 text-primary" aria-hidden />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold">Coğrafi gerçeklik</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Servis alanları PostGIS ile modellenir; hangi ilde hangi kargo / elden teslim
                    kuralının geçerli olduğu netleşir.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/12 ring-1 ring-primary/20">
                  <Truck className="h-6 w-6 text-primary" aria-hidden />
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold">Çoklu satıcı sepet</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    Her üretici için ayrı sipariş, ayrı kargo ve ayrı ödeme akışı — alıcı checkout’ta
                    bunu tek ekranda görür.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative flex flex-wrap items-center gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" aria-hidden />
              <span>Ankara’dan Hatay’a üreticiler; vitrin tek çatı altında.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-16 md:py-20">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Kategoriler</h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Tarım, hayvansal ürünler ve beslenme — hiyerarşik taksonomi ile doğru rafta.
            </p>
          </div>
          <Link href="/kesfet" className="text-sm font-semibold text-primary hover:underline">
            Tüm vitrin →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/kesfet?kategori=${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6 shadow-sm ring-1 ring-black/[0.03] transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
            >
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-100" />
              <Leaf className="relative mb-4 h-7 w-7 text-primary" aria-hidden />
              <h3 className="relative font-display text-lg font-semibold">{cat.nameTr}</h3>
              {cat.children.length > 0 ? (
                <p className="relative mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {cat.children.map((c) => c.nameTr).join(' · ')}
                </p>
              ) : null}
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-border/60 bg-gradient-to-b from-muted/20 to-background py-16 md:py-20">
        <div className="container">
          <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Badge tone="outline" className="mb-3 border-primary/20 bg-primary/[0.05]">
                Üretici vitrini
              </Badge>
              <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Öne çıkan üreticiler</h2>
              <p className="mt-2 max-w-xl text-muted-foreground">
                Onaylı profiller; hikâye, ürün sayısı ve puanlarıyla keşfe hazır.
              </p>
            </div>
            <Link href={'/ureticiler' as Route} className="text-sm font-semibold text-primary hover:underline">
              Tüm üreticiler →
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {producers.items.map((s) => (
              <ProducerCard key={s.id} seller={s} />
            ))}
          </div>
        </div>
      </section>

      <section className="container py-16 md:py-20">
        <div className="mb-8 flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Popüler ürünler</h2>
          <Link href="/kesfet?sirala=popular" className="text-sm font-semibold text-primary hover:underline">
            Tümünü gör →
          </Link>
        </div>
        <ProductGrid products={featured.items} />
      </section>

      <section className="border-t border-border/60 bg-muted/15">
        <div className="container grid gap-8 py-16 md:grid-cols-2 md:py-20">
          <Card className="overflow-hidden border-border/70 shadow-lg shadow-black/[0.03]">
            <CardContent className="p-8 md:p-10">
              <h3 className="font-display text-2xl font-semibold">Alıcılar için</h3>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  Dalından sofraya tazelik; üretici mesafesi tek tık.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  Sertifika durumu ve hasat notları şeffaf.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  Kargo / ziyaret / elden teslim seçenekleri üreticinin kurallarına göre listelenir.
                </li>
              </ul>
              <Link href="/kesfet" className={cn(buttonVariants({ variant: 'outline' }), 'mt-8 rounded-xl')}>
                Alışverişe başla
              </Link>
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/[0.07] via-card to-card shadow-lg shadow-primary/10">
            <CardContent className="p-8 md:p-10">
              <h3 className="font-display text-2xl font-semibold">Üreticiler için</h3>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  Mağazanı, fiyatını ve teslimat bölgelerini sen belirlersin.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  Sertifikalarını yükle; doğrulama süreci panelde izlenir.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  Çoklu satıcı sepet mimarisi ile operasyonel karmaşa olmadan ölçeklen.
                </li>
              </ul>
              <Link
                href={'/sat/basla' as Route}
                className={cn(buttonVariants(), 'mt-8 rounded-xl shadow-md shadow-primary/25')}
              >
                Üretici başvurusu
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}

function TrustRow() {
  const items = ['Sertifikalı üreticiler', 'Şeffaf fiyatlandırma', 'Batch-seviyesinde izlenebilirlik'];
  return (
    <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
      {items.map((item) => (
        <li key={item} className="inline-flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          <span className="font-medium text-foreground/80">{item}</span>
        </li>
      ))}
    </ul>
  );
}
