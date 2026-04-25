import type { Route } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const TITLES: Record<string, string> = {
  'kullanim-kosullari': 'Kullanım koşulları',
  gizlilik: 'Gizlilik politikası',
  kvkk: 'KVKK aydınlatma metni',
  'mesafeli-satis': 'Mesafeli satış sözleşmesi',
  cerezler: 'Çerez politikası',
};

export function generateStaticParams() {
  return Object.keys(TITLES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = TITLES[slug];
  return title ? { title } : { title: 'Yasal' };
}

export default async function LegalDocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = TITLES[slug];
  if (!title) notFound();

  return (
    <div className="container max-w-3xl py-14 md:py-20">
      <h1 className="font-display text-4xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-6 leading-relaxed text-muted-foreground">
        Bu sayfa hukuk ve uyum ekibi onayına hazırlık şablonudur. Kesin metin yayınlanana kadar
        operasyonel sorularınız için{' '}
        <Link href={'/hakkimizda' as Route} className="font-semibold text-primary hover:underline">
          Hakkımızda
        </Link>{' '}
        bölümündeki ilkeler geçerlidir.
      </p>
    </div>
  );
}
