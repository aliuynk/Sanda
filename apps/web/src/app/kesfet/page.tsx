import { Badge, cn } from '@sanda/ui-web';
import { ArrowUpDown, Leaf, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';

import { ProductGrid } from '@/components/product-grid';
import { kesfetUrl } from '@/lib/kesfet-url';
import { getServerTrpc } from '@/trpc/server';

interface SearchParams {
  q?: string;
  kategori?: string;
  bolge?: string;
  uretici?: string;
  sirala?: 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'popular';
}

export const revalidate = 60;

const sortOptions: { key: SearchParams['sirala']; label: string }[] = [
  { key: 'newest', label: 'En yeni' },
  { key: 'popular', label: 'Popüler' },
  { key: 'rating', label: 'Puan' },
  { key: 'price_asc', label: 'Fiyat ↑' },
  { key: 'price_desc', label: 'Fiyat ↓' },
];

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const trpc = await getServerTrpc();
  const sort = params.sirala ?? 'newest';

  let sellerId: string | undefined;
  let sellerLabel: string | undefined;
  if (params.uretici) {
    try {
      const s = await trpc.sellers.bySlug({ slug: params.uretici });
      sellerId = s.id;
      sellerLabel = s.displayName;
    } catch {
      /* invalid slug — ignore filter */
    }
  }

  const [results, categories] = await Promise.all([
    trpc.catalog.list({
      limit: 24,
      search: params.q,
      categorySlug: params.kategori,
      sort,
      sellerId,
    }),
    trpc.catalog.categories(),
  ]);

  const baseParams = {
    q: params.q,
    kategori: params.kategori,
    bolge: params.bolge,
    uretici: params.uretici,
  };

  return (
    <div className="container py-10 md:py-12">
      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 ring-1 ring-primary/20">
            <Leaf className="h-5 w-5 text-primary" aria-hidden />
          </span>
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Keşfet</h1>
            <p className="mt-1 text-muted-foreground">
              {params.q
                ? `“${params.q}” için sonuçlar`
                : sellerLabel
                  ? `${sellerLabel} ürünleri`
                  : 'Tüm üreticiler, tek şeffaf vitrin.'}
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {params.kategori ? (
            <Badge tone="info" className="rounded-lg px-2.5 py-1">
              Kategori: {params.kategori}
            </Badge>
          ) : null}
          {params.bolge ? (
            <Badge tone="info" className="rounded-lg px-2.5 py-1">
              Bölge: {params.bolge}
            </Badge>
          ) : null}
          {params.uretici && sellerLabel ? (
            <Badge tone="outline" className="rounded-lg border-primary/25 px-2.5 py-1">
              Üretici: {sellerLabel}
              <Link
                href={kesfetUrl({ ...baseParams, uretici: undefined })}
                className="ml-2 text-primary underline-offset-4 hover:underline"
              >
                kaldır
              </Link>
            </Badge>
          ) : params.uretici && !sellerLabel ? (
            <Badge tone="destructive" className="rounded-lg px-2.5 py-1">
              Geçersiz üretici filtresi
            </Badge>
          ) : null}
        </div>
      </header>

      <div className="flex flex-col gap-10 lg:flex-row lg:gap-12">
        <aside className="lg:w-64 lg:shrink-0">
          <div className="glass-panel rounded-2xl p-5">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
              Kategoriler
            </p>
            <nav className="mt-4 space-y-1">
              <Link
                href={kesfetUrl({ ...baseParams, kategori: undefined })}
                className={cn(
                  'block rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                  !params.kategori ? 'bg-primary/12 text-primary' : 'text-muted-foreground hover:bg-muted',
                )}
              >
                Tümü
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={kesfetUrl({ ...baseParams, kategori: cat.slug })}
                  className={cn(
                    'block rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                    params.kategori === cat.slug
                      ? 'bg-primary/12 text-primary'
                      : 'text-muted-foreground hover:bg-muted',
                  )}
                >
                  {cat.nameTr}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowUpDown className="h-4 w-4" aria-hidden />
              Sıralama
            </p>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((opt) => {
                const active = sort === opt.key;
                return (
                  <Link
                    key={opt.key ?? 'newest'}
                    href={kesfetUrl({ ...baseParams, sirala: opt.key })}
                    className={cn(
                      'rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
                      active
                        ? 'border-primary/40 bg-primary/12 text-primary'
                        : 'border-border/80 bg-card text-muted-foreground hover:border-primary/25 hover:text-foreground',
                    )}
                  >
                    {opt.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <ProductGrid products={results.items} />
        </div>
      </div>
    </div>
  );
}
