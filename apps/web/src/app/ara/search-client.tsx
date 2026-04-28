'use client';

import { formatTry, kurus } from '@sanda/core';
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Select,
  Skeleton,
} from '@sanda/ui-web';
import {
  Leaf,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState, useTransition } from 'react';

import { trpc } from '@/trpc/shared';

const sortOptions = [
  { value: 'relevance', label: 'Alaka düzeni' },
  { value: 'price_asc', label: 'Fiyat: düşükten yükseğe' },
  { value: 'price_desc', label: 'Fiyat: yüksekten düşüğe' },
  { value: 'newest', label: 'En yeni' },
];

const productionMethods = [
  { value: '', label: 'Tüm yöntemler' },
  { value: 'ORGANIC', label: 'Organik sertifikalı' },
  { value: 'GOOD_AGRICULTURAL', label: 'İyi Tarım' },
  { value: 'NATURAL', label: 'Doğal / geleneksel' },
  { value: 'CONVENTIONAL', label: 'Konvansiyonel' },
];

export function SearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const initialQuery = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState(searchParams.get('sort') ?? 'relevance');
  const [method, setMethod] = useState(searchParams.get('method') ?? '');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch results via tRPC catalog search
  const { data, isLoading, isFetching } = trpc.catalog.search.useQuery(
    {
      query: initialQuery,
      sort: sort as any,
      productionMethod: method || undefined,
      limit: 24,
    },
    { enabled: initialQuery.length > 0 },
  );

  const products = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!query.trim()) return;
      startTransition(() => {
        const params = new URLSearchParams();
        params.set('q', query.trim());
        if (sort !== 'relevance') params.set('sort', sort);
        if (method) params.set('method', method);
        router.push(`/ara?${params.toString()}` as Route);
      });
    },
    [query, sort, method, router],
  );

  return (
    <div className="container max-w-6xl py-10 md:py-14">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ürün, üretici veya kategori ara..."
            className="h-14 w-full rounded-2xl border border-border/80 bg-card pl-12 pr-32 text-base shadow-sm transition-shadow focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-xl"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <Button type="submit" className="rounded-xl px-5" loading={isPending}>
              Ara
            </Button>
          </div>
        </div>
      </form>

      {/* Filters row */}
      {showFilters && (
        <div className="mb-6 flex flex-wrap items-end gap-4 rounded-2xl border border-border/60 bg-muted/20 p-4">
          <div className="min-w-[180px]">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Sıralama</label>
            <Select value={sort} onChange={(e) => setSort(e.target.value)}>
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </div>
          <div className="min-w-[200px]">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Üretim yöntemi</label>
            <Select value={method} onChange={(e) => setMethod(e.target.value)}>
              {productionMethods.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </div>
          {(sort !== 'relevance' || method) && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-xs text-muted-foreground"
              onClick={() => { setSort('relevance'); setMethod(''); }}
            >
              <X className="h-3 w-3" /> Filtreleri temizle
            </Button>
          )}
        </div>
      )}

      {/* Results header */}
      {initialQuery && (
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">"{initialQuery}"</span> için
            {isLoading ? (
              <span className="ml-1">aranıyor...</span>
            ) : (
              <span className="ml-1">
                <strong>{totalCount}</strong> sonuç bulundu
              </span>
            )}
          </p>
          {products.length > 0 && (
            <Badge tone="outline" className="rounded-md text-xs">
              {products.length} / {totalCount}
            </Badge>
          )}
        </div>
      )}

      {/* Loading state */}
      {isLoading && initialQuery && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-4 w-3/4 rounded-lg" />
              <Skeleton className="h-4 w-1/2 rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* No query state */}
      {!initialQuery && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <Search className="h-10 w-10 text-primary" />
          </div>
          <h2 className="font-display text-2xl font-semibold">Ne arıyorsun?</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Ürün adı, kategori veya üretici ismi yaz. Sonuçlar Meilisearch ile anında gelecek.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {['Organik bal', 'Zeytinyağı', 'Taze sebze', 'Doğal peynir', 'Kurutulmuş meyve'].map(
              (tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setQuery(tag);
                    startTransition(() => router.push(`/ara?q=${encodeURIComponent(tag)}` as Route));
                  }}
                  className="rounded-full border border-border/80 bg-card px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
                >
                  {tag}
                </button>
              ),
            )}
          </div>
        </div>
      )}

      {/* Empty results */}
      {!isLoading && initialQuery && products.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Leaf className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h2 className="font-display text-xl font-semibold">Sonuç bulunamadı</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            "{initialQuery}" ile eşleşen ürün yok. Farklı anahtar kelime dene veya filtreleri kaldır.
          </p>
          <Link
            href={'/kesfet' as Route}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Tüm ürünleri keşfet →
          </Link>
        </div>
      )}

      {/* Product grid */}
      {!isLoading && products.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product: any) => (
            <Link key={product.id} href={`/urun/${product.slug}` as Route}>
              <Card className="group h-full border-border/70 transition-all duration-200 hover:border-primary/25 hover:shadow-lg">
                <CardContent className="p-0">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-muted">
                    {product.media?.[0]?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.media[0].url}
                        alt={product.nameTr}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Leaf className="h-10 w-10 text-muted-foreground/20" />
                      </div>
                    )}
                    {product.productionMethod === 'ORGANIC' && (
                      <Badge tone="success" className="absolute left-2 top-2 rounded-md text-[10px]">
                        Organik
                      </Badge>
                    )}
                  </div>
                  {/* Info */}
                  <div className="space-y-2 p-4">
                    <p className="line-clamp-2 text-sm font-medium leading-snug group-hover:text-primary">
                      {product.nameTr}
                    </p>
                    {product.seller && (
                      <p className="text-xs text-muted-foreground">
                        {product.seller.displayName}
                      </p>
                    )}
                    {product.variants?.[0] && (
                      <p className="font-display text-lg font-semibold tabular-nums text-primary">
                        {formatTry(kurus(product.variants[0].priceKurus))}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
