'use client';

import { Button, cn } from '@sanda/ui-web';
import {
  BarChart3,
  Box,
  ClipboardList,
  FileCheck2,
  Home,
  LineChart,
  Menu,
  MessageCircle,
  Settings,
  ShoppingBag,
  Sprout,
  Truck,
  X,
} from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const sellerNav = [
  { href: '/satici', label: 'Panel', icon: Home },
  { href: '/satici/onboarding', label: 'Onboarding', icon: ClipboardList },
  { href: '/satici/siparisler', label: 'Siparişler', icon: ShoppingBag },
  { href: '/satici/urunler', label: 'Ürünler', icon: Box },
  { href: '/satici/hizmet-alanlari', label: 'Hizmet alanları', icon: Truck },
  { href: '/satici/sertifikalar', label: 'Sertifikalar', icon: FileCheck2 },
  { href: '/satici/kazanc', label: 'Kazanç', icon: BarChart3 },
  { href: '/satici/analitik', label: 'Analitik', icon: LineChart },
  { href: '/satici/ziyaretler', label: 'Çiftlik ziyareti', icon: Sprout },
  { href: '/satici/mesajlar', label: 'Mesajlar', icon: MessageCircle },
  { href: '/satici/ayarlar', label: 'Ayarlar', icon: Settings },
];

export function SellerWorkspaceShell({
  displayName,
  children,
}: {
  displayName: string;
  children: React.ReactNode;
}) {
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

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-0.5">
      {sellerNav.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === '/satici'
            ? pathname === '/satici' || pathname === '/satici/'
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href as Route}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
              active
                ? 'bg-primary/12 text-primary shadow-sm shadow-primary/10'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,hsl(var(--primary)/0.12),transparent_50%),radial-gradient(ellipse_80%_50%_at_100%_50%,hsl(var(--accent)/0.06),transparent_45%)]">
      <div className="bg-noise pointer-events-none absolute inset-0 opacity-[0.35]" aria-hidden />
      <div className="container relative grid gap-6 py-8 lg:grid-cols-[280px_1fr] lg:gap-10 lg:py-10">
        <aside className="hidden lg:block">
          <div className="glass-panel sticky top-24 rounded-2xl p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Üretici çalışma alanı
            </p>
            <p className="mt-2 font-display text-lg font-semibold leading-snug tracking-tight">{displayName}</p>
            <div className="mt-5 border-t border-border/60 pt-5">
              <NavLinks />
            </div>
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          <div className="glass-panel flex items-center justify-between rounded-2xl px-4 py-3 lg:hidden">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Panel</p>
              <p className="font-display text-base font-semibold">{displayName}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 rounded-xl border-border/80"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <Menu className="h-4 w-4" />
              Menü
            </Button>
          </div>

          {open ? (
            <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Panel menüsü">
              <button
                type="button"
                className="absolute inset-0 bg-background/75 backdrop-blur-sm"
                aria-label="Kapat"
                onClick={() => setOpen(false)}
              />
              <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-hidden rounded-t-3xl border border-border/80 bg-card shadow-2xl">
                <div className="flex items-center justify-between border-b px-5 py-4">
                  <span className="font-display font-semibold">Menü</span>
                  <Button type="button" variant="ghost" size="icon" aria-label="Kapat" onClick={() => setOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="max-h-[calc(85vh-4rem)] overflow-y-auto p-4">
                  <NavLinks onNavigate={() => setOpen(false)} />
                </div>
              </div>
            </div>
          ) : null}

          {children}
        </div>
      </div>
    </div>
  );
}
