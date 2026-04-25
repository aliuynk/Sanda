import './globals.css';

import { cn } from '@sanda/ui-web';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: { default: 'Sanda Admin', template: '%s · Sanda Admin' },
  robots: { index: false, follow: false },
};

const nav = [
  { href: '/', label: 'Panel' },
  { href: '/uretici-basvurulari', label: 'Üretici başvuruları' },
  { href: '/sertifikalar', label: 'Sertifikalar' },
  { href: '/siparisler', label: 'Siparişler' },
  { href: '/uyusmazliklar', label: 'Uyuşmazlıklar' },
  { href: '/kullanicilar', label: 'Kullanıcılar' },
  { href: '/icerik', label: 'İçerik' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={inter.variable}>
      <body className={cn('flex min-h-screen bg-background font-sans')}>
        <aside className="hidden w-60 border-r bg-card p-4 md:block">
          <div className="mb-6 font-display text-lg font-semibold">Sanda · Admin</div>
          <nav className="flex flex-col gap-1 text-sm">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="rounded-md px-2 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1">
          <header className="flex h-14 items-center justify-between border-b px-6 text-sm">
            <span>Operasyon paneli</span>
            <span className="text-muted-foreground">
              İç kullanım — dış paylaşıma uygun değildir.
            </span>
          </header>
          <main className="p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
