'use client';

import { Button, cn } from '@sanda/ui-web';
import { Leaf, Menu, Search, ShoppingBasket, User, X } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const links = [
  { href: '/kesfet', label: 'Keşfet' },
  { href: '/ureticiler', label: 'Üreticiler' },
  { href: '/hikayeler', label: 'Hikâyeler' },
  { href: '/hakkimizda', label: 'Hakkımızda' },
];

export function MobileMenu() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label="Menüyü aç"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {open ? (
        <div
          id="mobile-nav"
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Site menüsü"
        >
          <button
            type="button"
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            aria-label="Menüyü kapat"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-[min(100%,380px)] flex-col border-l border-border/80 bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b px-4 py-4">
              <Link
                href="/"
                className="flex items-center gap-2 font-display text-lg font-semibold"
                onClick={() => setOpen(false)}
              >
                <Leaf className="h-6 w-6 text-primary" aria-hidden />
                Sanda
              </Link>
              <Button type="button" variant="ghost" size="icon" aria-label="Kapat" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <form action="/kesfet" className="border-b p-4">
              <label className="sr-only" htmlFor="mobile-search">
                Ürün ara
              </label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <input
                  id="mobile-search"
                  name="q"
                  placeholder="Bal, zeytinyağı, ceviz…"
                  className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </form>
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
              {links.map((link) => (
              <Link
                key={link.href}
                href={link.href as Route}
                  className={cn(
                    'rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                    pathname === link.href || pathname.startsWith(`${link.href}/`)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={'/sat' as Route}
                className="mt-2 rounded-xl border border-dashed border-primary/35 bg-primary/[0.06] px-4 py-3 text-sm font-semibold text-primary"
              >
                Üretici olarak katıl
              </Link>
            </nav>
            <div className="flex gap-2 border-t p-4">
              <Link href="/sepet" className="flex-1" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full gap-2">
                  <ShoppingBasket className="h-4 w-4" />
                  Sepet
                </Button>
              </Link>
              <Link href="/giris" className="flex-1" onClick={() => setOpen(false)}>
                <Button className="w-full gap-2">
                  <User className="h-4 w-4" />
                  Giriş
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
