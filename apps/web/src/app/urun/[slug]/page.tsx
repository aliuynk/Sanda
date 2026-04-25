import { formatDate, formatTry, kurus } from '@sanda/core';
import { Badge, buttonVariants, Card, CardContent, cn } from '@sanda/ui-web';
import { CalendarDays, Leaf, MapPin, ShieldCheck, Truck } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AddToCartButton } from '@/components/add-to-cart-button';
import { getServerTrpc } from '@/trpc/server';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const trpc = await getServerTrpc();
    const product = await trpc.catalog.bySlug({ slug });
    return {
      title: product.nameTr,
      description: product.summary ?? product.description?.slice(0, 160) ?? undefined,
      openGraph: {
        title: product.nameTr,
        images: product.media[0]?.url ? [{ url: product.media[0].url }] : undefined,
      },
    };
  } catch {
    return { title: 'Ürün' };
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const trpc = await getServerTrpc();
  let product: Awaited<ReturnType<typeof trpc.catalog.bySlug>>;
  try {
    product = await trpc.catalog.bySlug({ slug });
  } catch {
    notFound();
  }

  const defaultVariant = product.variants.find((v) => v.isDefault) ?? product.variants[0];
  const price = defaultVariant ? formatTry(kurus(defaultVariant.priceKurus)) : '—';

  return (
    <div className="container py-10 md:py-14">
      <nav className="mb-6 flex flex-wrap gap-1 text-sm text-muted-foreground">
        <Link href="/kesfet" className="hover:text-foreground">
          Keşfet
        </Link>
        <span className="px-1">/</span>
        <Link href={`/kesfet?kategori=${product.category.slug}`} className="hover:text-foreground">
          {product.category.nameTr}
        </Link>
        <span className="px-1">/</span>
        <span className="text-foreground">{product.nameTr}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-border/70 bg-muted shadow-lg shadow-black/[0.04] ring-1 ring-black/[0.04]">
            {product.media[0] ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={product.media[0].url}
                alt={product.media[0].altText ?? product.nameTr}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center text-muted-foreground">
                <Leaf className="h-20 w-20 opacity-30" aria-hidden />
              </div>
            )}
          </div>
          {product.media.length > 1 ? (
            <div className="grid grid-cols-4 gap-3">
              {product.media.slice(1, 5).map((m) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  key={m.url}
                  src={m.url}
                  alt={m.altText ?? ''}
                  className="aspect-square w-full rounded-2xl border border-border/60 object-cover"
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <div className="flex flex-wrap gap-2">
            {product.productionMethod === 'CERTIFIED_ORGANIC' ? (
              <Badge tone="success" className="rounded-lg">
                <ShieldCheck className="h-3 w-3" /> Organik sertifikalı
              </Badge>
            ) : null}
            {product.originProvinceCode ? (
              <Badge tone="outline" className="rounded-lg">
                <MapPin className="h-3 w-3" /> İl {product.originProvinceCode}
              </Badge>
            ) : null}
            {product.isSeasonal ? (
              <Badge tone="info" className="rounded-lg">
                Mevsiminde
              </Badge>
            ) : null}
          </div>

          <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight md:text-4xl lg:text-[2.75rem]">
            {product.nameTr}
          </h1>

          <Link
            href={`/uretici/${product.seller.slug}`}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-border/80 bg-card px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
          >
            <span className="text-foreground">{product.seller.displayName}</span>
            <span className="text-xs">üretici profili →</span>
          </Link>

          <Card className="border-border/70 shadow-md">
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-display text-3xl font-semibold tabular-nums">{price}</div>
                {defaultVariant ? (
                  <div className="mt-1 text-sm text-muted-foreground">{defaultVariant.nameTr}</div>
                ) : null}
              </div>
              {defaultVariant ? (
                <AddToCartButton
                  productId={product.id}
                  variantId={defaultVariant.id}
                  minOrderQty={Number(product.minOrderQty)}
                  stepQty={Number(product.stepQty)}
                />
              ) : null}
            </CardContent>
          </Card>

          <div className="grid gap-3 text-sm">
            {product.harvestNotes ? (
              <div className="glass-panel flex items-start gap-3 rounded-2xl p-4">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>Hasat: {product.harvestNotes}</span>
              </div>
            ) : null}
            <div className="glass-panel flex items-start gap-3 rounded-2xl p-4">
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                Teslimat: {product.seller.serviceAreas.length} tanımlı bölge / yöntem. Ayrıntılar
                üretici profilinde.
              </span>
            </div>
          </div>

          {product.description ? (
            <section>
              <h2 className="mb-3 font-display text-xl font-semibold">Ürün detayı</h2>
              <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{product.description}</p>
            </section>
          ) : null}

          {product.storageNotes ? (
            <section>
              <h2 className="mb-3 font-display text-xl font-semibold">Saklama</h2>
              <p className="leading-relaxed text-muted-foreground">{product.storageNotes}</p>
            </section>
          ) : null}

          {product.seller.certifications.length > 0 ? (
            <section>
              <h2 className="mb-4 font-display text-xl font-semibold">Üreticinin sertifikaları</h2>
              <ul className="space-y-3 text-sm">
                {product.seller.certifications.map((c) => (
                  <li
                    key={c.id}
                    className="glass-panel flex flex-col gap-2 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span>
                      <strong>{c.type.replaceAll('_', ' ')}</strong> — {c.issuer} / {c.certificateNumber}
                    </span>
                    <Badge tone="success" className="w-fit rounded-lg">
                      Geçerlilik: {formatDate(c.expiresAt)}
                    </Badge>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <Link
            href={`/uretici/${product.seller.slug}`}
            className={cn(buttonVariants({ variant: 'outline' }), 'rounded-xl')}
          >
            Üreticinin profilini gör
          </Link>
        </div>
      </div>
    </div>
  );
}
