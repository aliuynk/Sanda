import type { Metadata } from 'next';
import { Suspense } from 'react';

import { SearchClient } from './search-client';

export const metadata: Metadata = {
  title: 'Ara',
  description: 'Sanda\'da ürün, üretici veya kategori ara.',
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="container max-w-6xl py-10">
          <div className="h-14 w-full animate-pulse rounded-2xl bg-muted" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-48 animate-pulse rounded-2xl bg-muted" />
                <div className="h-4 w-3/4 animate-pulse rounded-lg bg-muted" />
                <div className="h-4 w-1/2 animate-pulse rounded-lg bg-muted" />
              </div>
            ))}
          </div>
        </div>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
