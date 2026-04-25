import { buttonVariants, cn } from '@sanda/ui-web';
import { Users } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';

import { ProducerCard } from '@/components/producer-card';
import { getServerTrpc } from '@/trpc/server';

export const metadata = {
  title: 'Üreticiler',
  description: 'Onaylı üretici profilleri — vitrin, sertifikalar ve hizmet alanları şeffaf.',
};

export const revalidate = 120;

export default async function ProducersPage() {
  const trpc = await getServerTrpc();
  const { items } = await trpc.sellers.list({ limit: 48 });

  return (
    <div className="container py-10 md:py-14">
      <header className="mb-12 max-w-3xl">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 ring-1 ring-primary/20">
            <Users className="h-6 w-6 text-primary" aria-hidden />
          </span>
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Üreticiler</h1>
            <p className="mt-2 text-muted-foreground">
              Her profil; ürün çeşidi, puanlar ve doğrulanmış sertifikalarla vitrinde. Coğrafi kapsama
              ve teslimat kuralları profilden okunur.
            </p>
          </div>
        </div>
        <Link href={'/sat/basla' as Route} className={cn(buttonVariants(), 'mt-8 inline-flex rounded-xl')}>
          Üretici olarak katıl
        </Link>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((s) => (
          <ProducerCard key={s.id} seller={s} />
        ))}
      </div>
    </div>
  );
}
