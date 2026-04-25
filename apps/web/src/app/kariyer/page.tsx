import type { Route } from 'next';
import Link from 'next/link';

export const metadata = { title: 'Kariyer' };

export default function CareersPage() {
  return (
    <div className="container max-w-3xl py-14 md:py-20">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Kariyer</h1>
      <p className="mt-6 text-muted-foreground">
        Açık pozisyonlar ve başvuru formu hazırlanıyor. Ürün ve mühendislik ile ilgili ön görüşmeler
        için{' '}
        <Link href={'/hakkimizda' as Route} className="font-semibold text-primary hover:underline">
          iletişim
        </Link>{' '}
        kanalları üzerinden ulaşabilirsiniz.
      </p>
    </div>
  );
}
