import { formatTry, kurus } from '@sanda/core';
import type { ProductCardData } from '@sanda/ui-web';
import { EmptyState, ProductCard } from '@sanda/ui-web';
import { Leaf } from 'lucide-react';

import { getInSeasonFlag, monthIsSeasonal } from '@/lib/season';

type ProductItem = {
  id: string;
  slug: string;
  nameTr: string;
  productionMethod: ProductCardData['productionMethod'];
  seasonStartMonth: number | null;
  seasonEndMonth: number | null;
  originProvinceCode: string | null;
  seller: { slug: string; displayName: string };
  variants: Array<{ priceKurus: number; unit: string; quantityPerUnit: unknown }>;
  media: Array<{ url: string; altText: string | null }>;
};

export function ProductGrid({ products }: { products: ProductItem[] }) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={<Leaf className="h-10 w-10" />}
        title="Sonuç bulunamadı"
        description="Filtreleri değiştirerek ya da farklı bir arama deneyerek tekrar deneyin."
      />
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => {
        const variant = p.variants[0];
        const priceLabel = variant ? formatTry(kurus(variant.priceKurus)) : '—';
        const unitLabel = variant
          ? `${String(variant.quantityPerUnit)} ${unitShort(variant.unit)}`
          : '';
        return (
          <ProductCard
            key={p.id}
            href={`/urun/${p.slug}`}
            data={{
              slug: p.slug,
              nameTr: p.nameTr,
              sellerName: p.seller.displayName,
              sellerSlug: p.seller.slug,
              imageUrl: p.media[0]?.url ?? null,
              priceLabel,
              unitLabel,
              originLabel: p.originProvinceCode ?? null,
              productionMethod: p.productionMethod,
              inSeason: monthIsSeasonal(p.seasonStartMonth, p.seasonEndMonth),
              hasVerifiedCert:
                p.productionMethod === 'CERTIFIED_ORGANIC' ||
                p.productionMethod === 'GOOD_AGRICULTURE',
            }}
          />
        );
      })}
      {/* dummy to keep helper referenced during tree-shaking */}
      <span hidden data-flag={getInSeasonFlag(new Date().getMonth() + 1, 1, 12) ? '1' : '0'} />
    </div>
  );
}

function unitShort(unit: string): string {
  switch (unit) {
    case 'GRAM':
      return 'gr';
    case 'KILOGRAM':
      return 'kg';
    case 'LITER':
      return 'lt';
    case 'MILLILITER':
      return 'ml';
    case 'PIECE':
      return 'adet';
    case 'BUNCH':
      return 'demet';
    case 'DOZEN':
      return 'düz.';
    case 'BOX':
      return 'kutu';
    default:
      return '';
  }
}
