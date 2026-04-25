import Link from 'next/link';

export const metadata = { title: 'Sertifika süreci' };

export default function HelpCertsPage() {
  return (
    <div className="container max-w-3xl py-14 md:py-20">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Sertifika süreci</h1>
      <p className="mt-6 text-muted-foreground">
        Yüklenen belgeler admin kuyruğunda doğrulanır; onaylı rozetler ürün ve mağaza vitrininde
        görünür. Süresi dolan sertifikalar otomatik düşer. Panelde durumu{' '}
        <Link href="/satici/sertifikalar" className="font-semibold text-primary hover:underline">
          Sertifikalar
        </Link>{' '}
        sekmesinden takip edebilirsiniz.
      </p>
    </div>
  );
}
