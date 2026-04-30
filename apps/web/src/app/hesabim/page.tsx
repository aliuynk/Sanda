import {
  Avatar,
  Badge,
  buttonVariants,
  Card,
  CardContent,
  cn,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@sanda/ui-web';
import {
  Bell,
  KeyRound,
  MapPin,
  Package,
  ShieldCheck,
  Sparkles,
  Store,
  User,
} from 'lucide-react';
import type { Metadata, Route } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getServerTrpc } from '@/trpc/server';

import { AccountTabs } from './account-tabs';

export const metadata: Metadata = {
  title: 'Hesabım',
  description: 'Profil bilgilerin, adresler ve bildirim tercihlerin.',
};

export default async function AccountPage() {
  const trpc = await getServerTrpc();

  let me: Awaited<ReturnType<typeof trpc.auth.me>>;
  try {
    me = await trpc.auth.me();
  } catch {
    redirect('/giris?next=/hesabim');
  }

  const addresses = await trpc.auth.myAddresses();

  const displayName =
    me.profile?.displayName ?? `${me.profile?.firstName ?? ''} ${me.profile?.lastName ?? ''}`.trim();

  const hasSeller = Boolean(me.sellerProfile);
  const memberSince = new Date(me.createdAt).getFullYear();

  return (
    <div className="container max-w-5xl py-10 md:py-14">
      <header className="mb-10 grid gap-6 rounded-3xl border border-border/70 bg-card/70 p-6 shadow-sm shadow-black/[0.03] backdrop-blur-md md:grid-cols-[1fr_auto] md:p-8">
        <div className="flex items-start gap-5">
          <Avatar
            size="xl"
            src={me.profile?.avatarUrl}
            alt={displayName || me.phone || 'Kullanıcı'}
            fallback={displayName?.slice(0, 2).toUpperCase()}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl font-semibold tracking-tight">
                {displayName || 'Hesabım'}
              </h1>
              {hasSeller ? (
                <Badge tone="success" className="rounded-md text-[10px]">
                  <Store className="h-2.5 w-2.5" /> Üretici
                </Badge>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-mono">{me.phone ?? '—'}</span>
              {me.email ? <span> · {me.email}</span> : null}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <Badge tone="outline" className="rounded-md">
                <Sparkles className="h-3 w-3 text-primary" /> {memberSince}&apos;den beri üye
              </Badge>
              {me.roles.map((r) => (
                <Badge key={r} tone="outline" className="rounded-md text-[10px]">
                  {r}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 md:flex-col md:items-end">
          <Link
            href={'/siparislerim' as Route}
            className={cn(buttonVariants({ variant: 'outline' }), 'gap-2 rounded-xl')}
          >
            <Package className="h-4 w-4" />
            Siparişlerim
          </Link>
          {hasSeller ? (
            <Link
              href={'/satici' as Route}
              className={cn(buttonVariants(), 'gap-2 rounded-xl')}
            >
              <Store className="h-4 w-4" />
              Üretici paneli
            </Link>
          ) : (
            <Link
              href={'/sat' as Route}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'gap-2 rounded-xl border-primary/25 text-primary',
              )}
            >
              <Store className="h-4 w-4" />
              Üretici ol
            </Link>
          )}
        </div>
      </header>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="addresses">
            <MapPin className="h-4 w-4" />
            Adresler
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4" />
            Bildirimler
          </TabsTrigger>
          <TabsTrigger value="security">
            <ShieldCheck className="h-4 w-4" />
            Güvenlik
          </TabsTrigger>
        </TabsList>

        <AccountTabs
          initialAccount={{
            firstName: me.profile?.firstName ?? '',
            lastName: me.profile?.lastName ?? '',
            displayName: me.profile?.displayName ?? null,
            email: me.email ?? '',
            phone: me.phone ?? '',
            phoneVerified: Boolean(me.phoneVerifiedAt),
            twoFactorEnabled: me.twoFactorEnabled,
            marketingOptIn: me.marketingOptIn,
          }}
          initialAddresses={addresses}
        />

        <TabsContent value="security">
          <Card className="border-border/70 shadow-sm">
            <CardContent className="space-y-5 p-6">
              <div>
                <h2 className="font-display text-xl font-semibold">Güvenlik</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Hesabını korumak için iki faktörlü doğrulamayı etkinleştir, oturumlarını yönet.
                </p>
              </div>

              <Card className="border-border/60">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                    </span>
                    <div>
                      <p className="font-medium">İki faktörlü doğrulama</p>
                      <p className="text-xs text-muted-foreground">
                        Hesabına ek güvenlik katmanı ekle (TOTP).
                      </p>
                    </div>
                  </div>
                  <Badge
                    tone={me.twoFactorEnabled ? 'success' : 'neutral'}
                    className="rounded-md"
                  >
                    {me.twoFactorEnabled ? 'Açık' : 'Kapalı'}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="border-border/60">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                      <KeyRound className="h-5 w-5 text-muted-foreground" />
                    </span>
                    <div>
                      <p className="font-medium">Aktif oturumlar</p>
                      <p className="text-xs text-muted-foreground">
                        Cihazlarındaki açık oturumları gör ve kapat.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    Görüntüle
                  </button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
