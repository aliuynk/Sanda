'use client';

import { Avatar, Button, cn, StatusDot } from '@sanda/ui-web';
import {
  AlertTriangle,
  BadgeCheck,
  Bell,
  Box,
  ChevronsUpDown,
  ClipboardList,
  FileSearch,
  Gauge,
  LayoutDashboard,
  LifeBuoy,
  Lock,
  LogOut,
  Megaphone,
  Menu,
  MessageSquareWarning,
  Newspaper,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tags,
  Users,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | null;
  group?: 'queue' | 'directory' | 'system';
};

interface AdminShellProps {
  children: React.ReactNode;
  principal: {
    displayName: string;
    initials: string;
    role: string;
  };
  pendingCounts?: {
    sellers: number;
    certifications: number;
    disputes: number;
  };
}

export function AdminShell({ children, principal, pendingCounts }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    setPaletteOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((s) => !s);
      } else if (event.key === 'Escape') {
        setPaletteOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const navItems: NavItem[] = useMemo(
    () => [
      { href: '/', label: 'Panel', icon: LayoutDashboard, group: 'queue' },
      {
        href: '/uretici-basvurulari',
        label: 'Üretici başvuruları',
        icon: ClipboardList,
        group: 'queue',
        badge: pendingCounts?.sellers ?? null,
      },
      {
        href: '/sertifikalar',
        label: 'Sertifika doğrulama',
        icon: ShieldCheck,
        group: 'queue',
        badge: pendingCounts?.certifications ?? null,
      },
      {
        href: '/uyusmazliklar',
        label: 'Uyuşmazlıklar',
        icon: MessageSquareWarning,
        group: 'queue',
        badge: pendingCounts?.disputes ?? null,
      },
      { href: '/uretici-listesi', label: 'Üreticiler', icon: Store, group: 'directory' },
      { href: '/siparisler', label: 'Siparişler', icon: ShoppingBag, group: 'directory' },
      { href: '/urunler', label: 'Ürünler', icon: Box, group: 'directory' },
      { href: '/kullanicilar', label: 'Kullanıcılar', icon: Users, group: 'directory' },
      { href: '/icerik/kategoriler', label: 'Kategoriler', icon: Tags, group: 'directory' },
      { href: '/icerik/blog', label: 'Blog', icon: Newspaper, group: 'directory' },
      { href: '/icerik/banner', label: 'Banner', icon: Megaphone, group: 'directory' },
      { href: '/sistem/saglik', label: 'Sistem sağlığı', icon: Gauge, group: 'system' },
      { href: '/sistem/audit', label: 'Audit log', icon: FileSearch, group: 'system' },
      { href: '/sistem/ayarlar', label: 'Platform ayarları', icon: Settings, group: 'system' },
    ],
    [pendingCounts],
  );

  const grouped = useMemo(() => {
    return {
      queue: navItems.filter((n) => n.group === 'queue'),
      directory: navItems.filter((n) => n.group === 'directory'),
      system: navItems.filter((n) => n.group === 'system'),
    };
  }, [navItems]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const NavGroup = ({
    label,
    items,
    onNavigate,
  }: {
    label: string;
    items: NavItem[];
    onNavigate?: () => void;
  }) => (
    <div>
      <p className="px-3 pb-2 pt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'group/nav flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/12 text-primary shadow-sm shadow-primary/5'
                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-90" />
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge != null && item.badge > 0 ? (
                  <span
                    className={cn(
                      'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold tabular-nums',
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-primary/12 text-primary',
                    )}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-[radial-gradient(ellipse_120%_70%_at_50%_-20%,hsl(var(--primary)/0.10),transparent_50%),radial-gradient(ellipse_70%_40%_at_100%_60%,hsl(var(--accent)/0.05),transparent_45%)]">
      <div className="bg-noise pointer-events-none absolute inset-0 opacity-[0.30]" aria-hidden />

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-[270px] lg:flex-col lg:border-r lg:border-border/60 lg:bg-card/80 lg:backdrop-blur-xl">
        <div className="flex h-16 items-center gap-3 border-b border-border/60 px-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/12 ring-1 ring-primary/25">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-base font-semibold tracking-tight">
              Sanda · Ops
            </p>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              İç panel
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
          <NavGroup label="Sıra & inceleme" items={grouped.queue} />
          <NavGroup label="Dizin" items={grouped.directory} />
          <NavGroup label="Sistem" items={grouped.system} />
        </nav>

        <div className="border-t border-border/60 p-3">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="mb-2 flex w-full items-center gap-2 rounded-xl border border-border/70 bg-background/60 px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
          >
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left">Hızlı ara…</span>
            <kbd className="hidden rounded border border-border/80 bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground sm:inline-block">
              ⌘K
            </kbd>
          </button>
          <ProfileBlock principal={principal} />
        </div>
      </aside>

      {/* Mobile sheet */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-background/75 backdrop-blur-sm"
            aria-label="Kapat"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-hidden border-r border-border/70 bg-card shadow-2xl">
            <div className="flex h-14 items-center justify-between border-b px-4">
              <div className="flex items-center gap-2 font-display font-semibold">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Sanda · Ops
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Kapat"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="h-[calc(100vh-3.5rem)] space-y-2 overflow-y-auto px-3 py-3">
              <NavGroup
                label="Sıra & inceleme"
                items={grouped.queue}
                onNavigate={() => setMobileOpen(false)}
              />
              <NavGroup
                label="Dizin"
                items={grouped.directory}
                onNavigate={() => setMobileOpen(false)}
              />
              <NavGroup
                label="Sistem"
                items={grouped.system}
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
          </div>
        </div>
      ) : null}

      {/* Main */}
      <div className="relative lg:pl-[270px]">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/65 lg:px-8">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Menü"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2 text-sm">
            <StatusDot tone="success" pulse />
            <span className="font-medium">Sistem operasyonel</span>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              · iyzico bağlı · queue sağlıklı
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="hidden h-9 items-center gap-2 rounded-xl border border-border/70 bg-card px-3 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground sm:inline-flex"
            >
              <Search className="h-4 w-4" />
              <span>Ara</span>
              <kbd className="rounded border border-border/80 bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] font-semibold">
                ⌘K
              </kbd>
            </button>
            <Button variant="ghost" size="icon" aria-label="Bildirimler">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Yardım">
              <LifeBuoy className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>

      {paletteOpen ? (
        <CommandPalette
          items={navItems}
          onClose={() => setPaletteOpen(false)}
          onPick={(href) => {
            setPaletteOpen(false);
            router.push(href);
          }}
        />
      ) : null}
    </div>
  );
}

function ProfileBlock({
  principal,
}: {
  principal: { displayName: string; initials: string; role: string };
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-background/60 p-2.5">
      <div className="flex items-center gap-2.5">
        <Avatar size="sm" alt={principal.displayName} fallback={principal.initials} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight">{principal.displayName}</p>
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <BadgeCheck className="h-3 w-3 text-primary" />
            {principal.role}
          </p>
        </div>
        <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1 text-[11px]">
        <Link
          href="/sistem/ayarlar"
          className="flex items-center justify-center gap-1 rounded-lg border border-border/70 bg-card px-1.5 py-1 text-muted-foreground hover:text-foreground"
        >
          <Lock className="h-3 w-3" />
          Profil
        </Link>
        <button
          type="button"
          className="flex items-center justify-center gap-1 rounded-lg border border-border/70 bg-card px-1.5 py-1 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-3 w-3" />
          Çıkış
        </button>
      </div>
    </div>
  );
}

function CommandPalette({
  items,
  onClose,
  onPick,
}: {
  items: NavItem[];
  onClose: () => void;
  onPick: (href: string) => void;
}) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLocaleLowerCase('tr-TR');
    return items.filter((item) => item.label.toLocaleLowerCase('tr-TR').includes(q));
  }, [items, query]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center px-4 py-20"
      role="dialog"
      aria-modal="true"
      aria-label="Komut paleti"
    >
      <button
        type="button"
        aria-label="Kapat"
        onClick={onClose}
        className="absolute inset-0 bg-background/70 backdrop-blur-md"
      />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-2xl ring-1 ring-black/5 backdrop-blur-xl">
        <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Sayfa ara — üretici, sertifika, sipariş…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border border-border/80 bg-muted/40 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">
            esc
          </kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto py-1.5 text-sm">
          {filtered.length === 0 ? (
            <li className="flex items-center gap-2 px-4 py-6 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4" /> Eşleşen sayfa yok.
            </li>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <button
                    type="button"
                    onClick={() => onPick(item.href)}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-muted/60"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1">{item.label}</span>
                    <span className="text-xs text-muted-foreground">{item.href}</span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
