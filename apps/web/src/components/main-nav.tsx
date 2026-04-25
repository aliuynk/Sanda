'use client';

import { cn } from '@sanda/ui-web';
import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { href: '/kesfet', label: 'Keşfet' },
  { href: '/ureticiler', label: 'Üreticiler' },
  { href: '/hikayeler', label: 'Hikâyeler' },
  { href: '/hakkimizda', label: 'Hakkımızda' },
];

export function MainNav() {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-1 md:flex" aria-label="Ana menü">
      {navLinks.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href as Route}
            className={cn(
              'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
