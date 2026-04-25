import { Leaf, MapPin, Sprout } from 'lucide-react';
import * as React from 'react';

import { Badge } from './badge';
import { cn } from './utils';

export interface ProductCardData {
  slug: string;
  nameTr: string;
  sellerName: string;
  sellerSlug: string;
  imageUrl?: string | null;
  priceLabel: string;
  unitLabel: string;
  originLabel?: string | null;
  productionMethod:
    | 'CONVENTIONAL'
    | 'GOOD_AGRICULTURE'
    | 'ORGANIC_TRANSITION'
    | 'CERTIFIED_ORGANIC'
    | 'NATURAL_TRADITIONAL'
    | 'WILD_HARVESTED';
  inSeason?: boolean;
  hasVerifiedCert?: boolean;
}

const methodLabel: Record<ProductCardData['productionMethod'], string> = {
  CONVENTIONAL: 'Geleneksel',
  GOOD_AGRICULTURE: 'İyi Tarım',
  ORGANIC_TRANSITION: 'Organik geçiş',
  CERTIFIED_ORGANIC: 'Organik sertifikalı',
  NATURAL_TRADITIONAL: 'Atasal / doğal',
  WILD_HARVESTED: 'Doğadan toplama',
};

export function ProductCard({
  data,
  href,
  className,
}: {
  data: ProductCardData;
  href: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm ring-1 ring-black/[0.03] transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {data.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.imageUrl}
            alt={data.nameTr}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Leaf className="h-10 w-10" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {data.hasVerifiedCert ? (
            <Badge tone="success" className="backdrop-blur">
              <Sprout className="h-3 w-3" /> Sertifikalı
            </Badge>
          ) : null}
          {data.inSeason ? (
            <Badge tone="info" className="backdrop-blur">
              Mevsiminde
            </Badge>
          ) : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 font-medium leading-snug">{data.nameTr}</h3>
          <div className="shrink-0 text-right text-sm font-semibold">{data.priceLabel}</div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="truncate">{data.sellerName}</span>
          <span>{data.unitLabel}</span>
        </div>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2 text-xs text-muted-foreground">
          <Badge tone="outline">{methodLabel[data.productionMethod]}</Badge>
          {data.originLabel ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {data.originLabel}
            </span>
          ) : null}
        </div>
      </div>
    </a>
  );
}
