import { buttonVariants, cn } from '@sanda/ui-web';
import { ArrowRight, LockKeyhole, Smartphone } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getServerTrpc } from '@/trpc/server';

import { IdentityForm } from './identity-form';

export const metadata = {
  title: 'Başvuruyu başlat',
  description: 'Sanda üretici onboarding — mağaza kimliği ve doğrulama.',
};

export default async function StartSellingPage() {
  const trpc = await getServerTrpc();
  let account: Awaited<ReturnType<typeof trpc.auth.me>> | null = null;
  try {
    account = await trpc.auth.me();
  } catch {
    // unauthenticated — render guest CTA
  }

  if (account?.sellerProfile) {
    redirect('/satici/onboarding' as Route);
  }

  return (
    <div className="container max-w-3xl py-12 md:py-20">
      <div className="mb-10 text-center">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/12 ring-1 ring-primary/25">
          <Smartphone className="h-7 w-7 text-primary" aria-hidden />
        </span>
        <h1 className="mt-8 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Üretici onboarding
        </h1>
        <p className="mt-4 text-pretty text-muted-foreground">
          Mağaza kimliğini oluştur. Sonraki adımlarda yasal bilgiler, çiftlik hikâyesi ve hizmet
          alanları tanımlanır.
        </p>
      </div>

      {account ? (
        <>
          <ol className="mb-10 grid gap-2 text-xs text-muted-foreground md:grid-cols-5">
            {['Kimlik', 'Yasal', 'Çiftlik', 'Teslimat', 'İnceleme'].map((step, i) => (
              <li
                key={step}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-3 py-2 font-medium',
                  i === 0
                    ? 'border-primary/30 bg-primary/[0.06] text-primary'
                    : 'border-border/80 bg-card/60',
                )}
              >
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold',
                    i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <IdentityForm defaultDisplayName={account.profile?.firstName ?? undefined} />
        </>
      ) : (
        <div className="glass-panel rounded-3xl p-10 text-center">
          <LockKeyhole className="mx-auto h-8 w-8 text-primary" aria-hidden />
          <h2 className="mt-4 font-display text-2xl font-semibold">Önce hesabına giriş yap</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
            Mağaza kimliğini güvenli biçimde oluşturabilmek için hesap gerekli. Telefonunla SMS
            doğrulama hızlı ve şifresizdir.
          </p>
          <Link
            href={'/giris?next=/sat/basla' as Route}
            className={cn(buttonVariants({ size: 'lg' }), 'mt-8 inline-flex rounded-xl px-8')}
          >
            Giriş veya kayıt
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
