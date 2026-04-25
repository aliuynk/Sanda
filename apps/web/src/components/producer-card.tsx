import { cn } from '@sanda/ui-web';
import { Sprout, Store } from 'lucide-react';
import Link from 'next/link';

export type ProducerCardSeller = {
  slug: string;
  displayName: string;
  tagline: string | null;
  productCount: number;
  ratingAverage: unknown;
  ratingCount: number;
  media: Array<{ url: string; caption: string | null }>;
};

export function ProducerCard({ seller, className }: { seller: ProducerCardSeller; className?: string }) {
  const img = seller.media[0];
  const rating = seller.ratingCount > 0 ? Number(seller.ratingAverage) : null;

  return (
    <Link
      href={`/uretici/${seller.slug}`}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm ring-1 ring-black/[0.03] transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/[0.07]',
        className,
      )}
    >
      <div className="relative aspect-[5/4] overflow-hidden bg-gradient-to-br from-earth-100 via-leaf-50 to-background">
        {img?.url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={img.url}
            alt={img.caption ?? seller.displayName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-primary/25">
            <Sprout className="h-16 w-16" aria-hidden />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">{seller.displayName}</h3>
          {seller.tagline ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{seller.tagline}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {seller.productCount > 0 ? (
              <span className="inline-flex items-center gap-1 font-medium text-foreground/80">
                <Store className="h-3.5 w-3.5 text-primary" aria-hidden />
                {seller.productCount} ürün
              </span>
            ) : null}
            {rating != null ? (
              <span className="font-medium text-amber-700 dark:text-amber-400">
                ★ {rating.toFixed(1)}
                <span className="font-normal text-muted-foreground"> ({seller.ratingCount})</span>
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
