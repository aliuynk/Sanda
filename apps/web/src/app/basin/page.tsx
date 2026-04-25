import type { Route } from 'next';
import Link from 'next/link';

export const metadata = { title: 'Basın' };

export default function PressPage() {
  return (
    <div className="container max-w-3xl py-14 md:py-20">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Basın</h1>
      <p className="mt-6 text-muted-foreground">
        Basın bültenleri ve iletişim kanalı yakında. Şimdilik{' '}
        <Link href={'/hakkimizda' as Route} className="font-semibold text-primary hover:underline">
          hakkımızda
        </Link>{' '}
        sayfasındaki misyon özetini kullanabilirsiniz.
      </p>
    </div>
  );
}
