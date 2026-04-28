import { buttonVariants, cn } from '@sanda/ui-web';
import { Leaf, Search } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-6 py-20 text-center">
      <div className="relative">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-muted/50">
          <span className="font-display text-6xl font-semibold text-muted-foreground/30">4</span>
          <Leaf className="h-10 w-10 text-primary" />
          <span className="font-display text-6xl font-semibold text-muted-foreground/30">4</span>
        </div>
      </div>

      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Sayfa bulunamadı
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Aradığın sayfa taşınmış, silinmiş veya hiç var olmamış olabilir.
          Doğru adreste olduğundan emin ol.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/" className={cn(buttonVariants(), 'gap-2 rounded-xl shadow-md shadow-primary/20')}>
          Ana sayfaya dön
        </Link>
        <Link
          href={'/ara' as Route}
          className={cn(buttonVariants({ variant: 'outline' }), 'gap-2 rounded-xl')}
        >
          <Search className="h-4 w-4" />
          Arama yap
        </Link>
      </div>
    </div>
  );
}
