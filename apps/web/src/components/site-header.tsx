import { Button, buttonVariants, cn } from '@sanda/ui-web';
import { Leaf, Search, ShoppingBasket, User } from 'lucide-react';
import Link from 'next/link';

import { MainNav } from '@/components/main-nav';
import { MobileMenu } from '@/components/mobile-menu';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/55">
      <div className="container flex h-16 items-center gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-display text-xl font-semibold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12 ring-1 ring-primary/20">
            <Leaf className="h-5 w-5 text-primary" aria-hidden />
          </span>
          <span>Sanda</span>
        </Link>

        <MainNav />

        <form action="/ara" className="mx-auto hidden max-w-md flex-1 lg:block">
          <label className="sr-only" htmlFor="global-search">
            Ürün ara
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              id="global-search"
              name="q"
              placeholder="Bal, zeytinyağı, peynir, reçel…"
              className="h-10 w-full rounded-xl border border-input/80 bg-card/50 pl-10 pr-4 text-sm shadow-inner shadow-black/[0.02] placeholder:text-muted-foreground focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring/60"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <MobileMenu />
          <Link
            href="/sat"
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'hidden rounded-xl border-primary/25 bg-primary/[0.04] font-semibold text-primary shadow-none md:inline-flex',
            )}
          >
            Üretici ol
          </Link>
          <Link href="/sepet" aria-label="Sepet">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ShoppingBasket className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/giris" aria-label="Giriş yap">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
