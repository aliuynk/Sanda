import './globals.css';

import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';

import { AdminShell } from '@/components/admin-shell';
import { TrpcProvider } from '@/trpc/provider';
import { getCurrentPrincipal, getServerTrpc } from '@/trpc/server';

import { LoginGate } from './login-gate';

const sans = Inter({ subsets: ['latin', 'latin-ext'], variable: '--font-sans', display: 'swap' });
const display = Playfair_Display({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Sanda Operasyon', template: '%s · Sanda Ops' },
  description: 'Sanda iç operasyon paneli — üretici onayı, sertifika doğrulama ve sipariş gözetimi.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: '#1a1610',
  width: 'device-width',
  initialScale: 1,
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const principal = await getCurrentPrincipal();
  const isAuthorised = principal?.roles.some((r) =>
    ['ADMIN', 'MODERATOR', 'SUPPORT'].includes(r),
  );

  let pendingCounts: { sellers: number; certifications: number; disputes: number } | undefined;
  let principalProfile: { displayName: string; initials: string; role: string } = {
    displayName: 'Operatör',
    initials: 'OP',
    role: 'ADMIN',
  };

  if (isAuthorised) {
    try {
      const trpc = await getServerTrpc();
      const stats = await trpc.admin.stats();
      pendingCounts = {
        sellers: stats.sellers.pending,
        certifications: stats.certifications.pending,
        disputes: stats.orders.disputed,
      };
      const me = await trpc.auth.me();
      const first = me.profile?.firstName ?? '';
      const last = me.profile?.lastName ?? '';
      const display = me.profile?.displayName || `${first} ${last}`.trim() || me.phone || 'Operatör';
      const initials = (first[0] ?? '') + (last[0] ?? '');
      principalProfile = {
        displayName: display,
        initials: (initials || display.slice(0, 2)).toUpperCase(),
        role: me.roles[0] ?? 'ADMIN',
      };
    } catch {
      pendingCounts = undefined;
    }
  }

  return (
    <html lang="tr" suppressHydrationWarning className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <TrpcProvider>
          {isAuthorised ? (
            <AdminShell principal={principalProfile} pendingCounts={pendingCounts}>
              {children}
            </AdminShell>
          ) : (
            <LoginGate />
          )}
        </TrpcProvider>
      </body>
    </html>
  );
}
