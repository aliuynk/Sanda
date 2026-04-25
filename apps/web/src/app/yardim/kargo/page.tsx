import Link from 'next/link';

export const metadata = { title: 'Kargo ve teslimat' };

export default function HelpShippingPage() {
  return (
    <div className="container max-w-3xl py-14 md:py-20">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Kargo ve teslimat</h1>
      <p className="mt-6 text-muted-foreground">
        Taşıyıcı entegrasyonları (Yurtiçi, MNG, Aras, PTT, vb.) worker katmanında açılır. Üretici
        panelinde her hizmet alanı için SLA ve ücret politikası tanımlanır. Detaylı rehber yakında;
        vitrin davranışı için{' '}
        <Link href="/kesfet" className="font-semibold text-primary hover:underline">
          keşfet
        </Link>{' '}
        sayfasından örnek mağazaları inceleyin.
      </p>
    </div>
  );
}
