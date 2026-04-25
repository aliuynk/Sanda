'use client';

import { formatTry, kurus } from '@sanda/core';
import type { ProductionMethod, ProductStatus, UnitOfMeasure } from '@sanda/db/types';
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  cn,
} from '@sanda/ui-web';
import { CheckCircle2, ExternalLink, Package, Plus } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { TrpcError } from '@/components/forms/trpc-error';
import { productStatusTr } from '@/lib/product-status';
import { productionMethodLabelTr } from '@/lib/production-method';
import { unitOfMeasureShortTr } from '@/lib/unit-of-measure';
import { trpc } from '@/trpc/shared';

import { VariantForm } from './variant-form';

type VariantRow = {
  id: string;
  sku: string;
  nameTr: string;
  unit: UnitOfMeasure;
  quantityPerUnit: number;
  priceKurus: number;
  compareAtPriceKurus: number | null;
  stockQuantity: number;
  isDefault: boolean;
  isActive: boolean;
};

export interface SellerProduct {
  id: string;
  slug: string;
  nameTr: string;
  status: ProductStatus;
  categoryName: string;
  productionMethod: ProductionMethod;
  summary: string | null;
  description: string | null;
  minOrderQty: number;
  stepQty: number;
  isSeasonal: boolean;
  seasonStartMonth: number | null;
  seasonEndMonth: number | null;
  variants: VariantRow[];
  media: Array<{ url: string; altText: string | null }>;
}

export function ProductDetailClient({ product }: { product: SellerProduct }) {
  const [addingVariant, setAddingVariant] = useState(product.variants.length === 0);
  const router = useRouter();
  const utils = trpc.useUtils();

  const publish = trpc.catalog.publish.useMutation({
    onSuccess: async () => {
      await utils.catalog.listMine.invalidate();
      router.refresh();
    },
  });

  const cover = product.media[0];
  const isActive = product.status === 'ACTIVE';
  const canPublish = product.variants.some((v) => v.isActive) && !isActive;

  return (
    <div className="space-y-6">
      <nav className="text-xs text-muted-foreground">
        <Link href={'/satici/urunler' as Route} className="hover:text-foreground">
          Ürünler
        </Link>{' '}
        / {product.nameTr}
      </nav>

      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex gap-5">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-muted">
            {cover?.url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={cover.url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <Package className="h-8 w-8" aria-hidden />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              {product.nameTr}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <Badge
                tone={isActive ? 'success' : 'outline'}
                className={cn('rounded-md', !isActive && 'border-border/80')}
              >
                {productStatusTr[product.status]}
              </Badge>
              <Badge tone="outline" className="rounded-md">
                {product.categoryName}
              </Badge>
              <Badge tone="outline" className="rounded-md">
                {productionMethodLabelTr[product.productionMethod]}
              </Badge>
              {product.isSeasonal &&
              product.seasonStartMonth != null &&
              product.seasonEndMonth != null ? (
                <Badge tone="info" className="rounded-md">
                  Mevsim: {product.seasonStartMonth}–{product.seasonEndMonth}. ay
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isActive ? (
            <Link
              href={`/urun/${product.slug}` as Route}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border/80 bg-card px-4 text-sm font-medium text-foreground transition-colors hover:border-primary/30"
            >
              <ExternalLink className="h-4 w-4" />
              Vitrinde gör
            </Link>
          ) : null}
          <Button
            type="button"
            size="lg"
            className="rounded-xl"
            disabled={!canPublish}
            loading={publish.isPending}
            onClick={() => publish.mutate({ productId: product.id })}
          >
            <CheckCircle2 className="h-4 w-4" />
            {isActive ? 'Yayında' : 'Yayına al'}
          </Button>
        </div>
      </div>

      {!canPublish && !isActive ? (
        <Alert tone="warning">
          <AlertDescription>
            Yayına almak için en az bir aktif varyant gerekiyor. Aşağıdan varyant ekleyebilirsin.
          </AlertDescription>
        </Alert>
      ) : null}

      <TrpcError error={publish.error} title="Yayına alınamadı" />

      {(product.summary || product.description) && (
        <Card className="border-border/70">
          <CardContent className="space-y-3 p-6 text-sm leading-relaxed">
            {product.summary ? <p className="font-medium">{product.summary}</p> : null}
            {product.description ? (
              <p className="whitespace-pre-line text-muted-foreground">{product.description}</p>
            ) : null}
          </CardContent>
        </Card>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold">Varyantlar</h2>
          {!addingVariant ? (
            <Button
              type="button"
              variant="outline"
              className="gap-2 rounded-xl"
              onClick={() => setAddingVariant(true)}
            >
              <Plus className="h-4 w-4" /> Yeni varyant
            </Button>
          ) : null}
        </div>

        {product.variants.length > 0 ? (
          <Card className="border-border/70 shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="border-b border-border/80 bg-muted/30 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Ad</th>
                      <th className="p-3">Birim</th>
                      <th className="p-3 text-right">Fiyat</th>
                      <th className="p-3 text-right">Stok</th>
                      <th className="p-3">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants.map((v) => (
                      <tr
                        key={v.id}
                        className="border-b border-border/50 last:border-0 hover:bg-muted/15"
                      >
                        <td className="p-3 font-mono text-xs">{v.sku}</td>
                        <td className="p-3">
                          {v.nameTr}
                          {v.isDefault ? (
                            <Badge tone="success" className="ml-2 rounded-md">
                              Varsayılan
                            </Badge>
                          ) : null}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {v.quantityPerUnit} {unitOfMeasureShortTr[v.unit]}
                        </td>
                        <td className="p-3 text-right tabular-nums">
                          {formatTry(kurus(v.priceKurus))}
                        </td>
                        <td className="p-3 text-right tabular-nums">{v.stockQuantity}</td>
                        <td className="p-3">
                          <Badge
                            tone={v.isActive ? 'success' : 'neutral'}
                            className="rounded-md"
                          >
                            {v.isActive ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {addingVariant ? (
          <Card className="border-primary/25 bg-primary/[0.03] shadow-sm">
            <CardContent className="p-6 md:p-8">
              <VariantForm
                productId={product.id}
                defaultIsDefault={product.variants.length === 0}
                onSaved={() => {
                  setAddingVariant(false);
                  router.refresh();
                }}
                onCancel={() =>
                  product.variants.length > 0 ? setAddingVariant(false) : undefined
                }
              />
            </CardContent>
          </Card>
        ) : null}
      </section>
    </div>
  );
}
