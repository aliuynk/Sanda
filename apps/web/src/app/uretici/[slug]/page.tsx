import { formatDate } from '@sanda/core';
import { Badge, buttonVariants, Card, CardContent, cn } from '@sanda/ui-web';
import { CalendarCheck, MapPin, ShieldCheck, Sprout, Truck } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ProductGrid } from '@/components/product-grid';
import { kesfetUrl } from '@/lib/kesfet-url';
import { getServerTrpc } from '@/trpc/server';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const trpc = await getServerTrpc();
    const s = await trpc.sellers.bySlug({ slug });
    return { title: s.displayName, description: s.tagline ?? undefined };
  } catch {
    return { title: 'Üretici' };
  }
}

export default async function SellerPage({ params }: PageProps) {
  const { slug } = await params;
  const trpc = await getServerTrpc();
  let seller: Awaited<ReturnType<typeof trpc.sellers.bySlug>>;
  try {
    seller = await trpc.sellers.bySlug({ slug });
  } catch {
    notFound();
  }

  const cover = seller.media[0];

  return (
    <div className="container py-10 md:py-14">
      <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-earth-50 via-background to-leaf-50 shadow-xl shadow-black/[0.05]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_100%_0%,hsl(var(--primary)/0.12),transparent)]" />
        <div className="relative grid gap-8 p-8 md:grid-cols-[minmax(0,1fr)_280px] md:items-start md:p-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              {seller.foundedYear ? (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarCheck className="h-4 w-4 text-primary" /> {seller.foundedYear}’den beri
                </span>
              ) : null}
              {seller.ratingCount > 0 ? (
                <Badge tone="info" className="rounded-lg">
                  ★ {Number(seller.ratingAverage).toFixed(1)} ({seller.ratingCount})
                </Badge>
              ) : null}
              {seller.allowsFarmVisits ? (
                <Badge tone="success" className="rounded-lg">
                  Ziyarete açık
                </Badge>
              ) : null}
            </div>
            <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight md:text-4xl lg:text-5xl">
              {seller.displayName}
            </h1>
            {seller.tagline ? (
              <p className="mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">{seller.tagline}</p>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={kesfetUrl({ uretici: seller.slug })}
                className={cn(buttonVariants(), 'rounded-xl')}
              >
                Ürünleri listele
              </Link>
              <Link
                href="/kesfet"
                className={cn(buttonVariants({ variant: 'outline' }), 'rounded-xl')}
              >
                Tüm vitrin
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border/60 bg-muted shadow-inner md:aspect-square">
            {cover?.url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={cover.url} alt={cover.caption ?? seller.displayName} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-primary/20">
                <Sprout className="h-20 w-20" aria-hidden />
              </div>
            )}
          </div>
        </div>
        {seller.certifications.length > 0 ? (
          <div className="relative flex flex-wrap gap-2 border-t border-border/60 bg-background/40 px-8 py-4 backdrop-blur-sm md:px-10">
            {seller.certifications.map((c) => (
              <Badge key={c.id} tone="success" className="rounded-lg">
                <ShieldCheck className="h-3 w-3" /> {c.issuer} — {formatDate(c.expiresAt)}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      {seller.story ? (
        <section className="prose prose-neutral prose-lg mt-12 max-w-none dark:prose-invert">
          <h2 className="font-display text-2xl font-semibold">Hikâyemiz</h2>
          <p className="whitespace-pre-line text-muted-foreground">{seller.story}</p>
        </section>
      ) : null}

      <section className="mt-12">
        <h2 className="mb-6 font-display text-2xl font-semibold">Hizmet verilen bölgeler</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {seller.serviceAreas.map((sa) => (
            <Card key={sa.id} className="border-border/70 transition-shadow hover:shadow-md">
              <CardContent className="flex items-start gap-4 p-5">
                {sa.mode === 'SHIPPING' ? (
                  <Truck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                ) : (
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-display text-lg font-semibold">{sa.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {sa.mode === 'SHIPPING'
                      ? `${sa.carrier ?? 'Kargo'} · ${sa.etaMinDays ?? 2}–${sa.etaMaxDays ?? 4} gün`
                      : sa.mode === 'PICKUP'
                        ? 'Bahçeden teslim alma'
                        : 'Ziyaret ederek teslim'}
                  </div>
                  {sa.provinceCodes.length > 0 ? (
                    <div className="mt-2 text-xs text-muted-foreground">
                      İller: {sa.provinceCodes.join(', ')}
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold">Ürünler</h2>
          <Link
            href={kesfetUrl({ uretici: seller.slug })}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Vitrinde filtrele →
          </Link>
        </div>
        <ProductGrid
          products={seller.products.map((p) => ({
            id: p.id,
            slug: p.slug,
            nameTr: p.nameTr,
            productionMethod: p.productionMethod,
            seasonStartMonth: p.seasonStartMonth,
            seasonEndMonth: p.seasonEndMonth,
            originProvinceCode: p.originProvinceCode,
            seller: { slug: seller.slug, displayName: seller.displayName },
            variants: p.variants,
            media: p.media,
          }))}
        />
      </section>
    </div>
  );
}
