import type { Route } from 'next';
import Link from 'next/link';

export const metadata = { title: 'Üretici yardım merkezi' };

export default function HelpProducerPage() {
  return (
    <div className="container max-w-3xl py-14 md:py-20">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Üretici yardım merkezi</h1>
      <p className="mt-6 text-muted-foreground">
        Onboarding, ÇKS / MERSİS doğrulaması ve sertifika yükleme adımları burada derlenecek.
        Şimdilik doğrudan{' '}
        <Link href={'/sat/basla' as Route} className="font-semibold text-primary hover:underline">
          başvuru akışına
        </Link>{' '}
        gidebilir veya{' '}
        <Link href={'/satici' as Route} className="font-semibold text-primary hover:underline">
          paneli
        </Link>{' '}
        açabilirsiniz.
      </p>
    </div>
  );
}
