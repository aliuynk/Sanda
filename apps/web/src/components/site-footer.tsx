import { Leaf } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';

const columns = [
  {
    title: 'Keşfet',
    links: [
      { href: '/kesfet', label: 'Tüm ürünler' },
      { href: '/kesfet?kategori=meyve', label: 'Meyve' },
      { href: '/kesfet?kategori=zeytin-ve-yaglar', label: 'Zeytin ve yağlar' },
      { href: '/kesfet?kategori=bal-ve-tatlandirici', label: 'Bal ve tatlandırıcılar' },
      { href: '/ureticiler', label: 'Üreticiler' },
    ],
  },
  {
    title: 'Üretici',
    links: [
      { href: '/sat', label: 'Sanda’da satmaya başla' },
      { href: '/yardim/uretici', label: 'Üretici yardım merkezi' },
      { href: '/yardim/kargo', label: 'Kargo ve teslimat' },
      { href: '/yardim/sertifikalar', label: 'Sertifika süreci' },
    ],
  },
  {
    title: 'Sanda',
    links: [
      { href: '/hakkimizda', label: 'Hakkımızda' },
      { href: '/hikayeler', label: 'Hikâyeler' },
      { href: '/basin', label: 'Basın' },
      { href: '/kariyer', label: 'Kariyer' },
    ],
  },
  {
    title: 'Yasal',
    links: [
      { href: '/yasal/kullanim-kosullari', label: 'Kullanım koşulları' },
      { href: '/yasal/gizlilik', label: 'Gizlilik politikası' },
      { href: '/yasal/kvkk', label: 'KVKK aydınlatma' },
      { href: '/yasal/mesafeli-satis', label: 'Mesafeli satış sözleşmesi' },
      { href: '/yasal/cerezler', label: 'Çerez politikası' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative border-t border-border/80 bg-gradient-to-b from-muted/25 via-background to-earth-50/40">
      <div className="bg-noise pointer-events-none absolute inset-0 opacity-25" aria-hidden />
      <div className="container relative py-16">
        <div className="mb-14 grid gap-10 lg:grid-cols-[1.2fr_2fr] lg:gap-16">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 font-display text-2xl font-semibold tracking-tight">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 ring-1 ring-primary/20">
                <Leaf className="h-6 w-6 text-primary" aria-hidden />
              </span>
              Sanda
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Türkiye genelinde üreticilerin doğrudan tüketiciyle buluştuğu, sertifika ve teslimat
              kurallarının şeffaf olduğu farm-to-table altyapısı.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
              <li className="rounded-full border border-border/80 bg-card/60 px-3 py-1">PostGIS servis alanları</li>
              <li className="rounded-full border border-border/80 bg-card/60 px-3 py-1">Çoklu satıcı sepet</li>
              <li className="rounded-full border border-border/80 bg-card/60 px-3 py-1">Doğrulanan organik</li>
            </ul>
          </div>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title}>
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {col.title}
                </h3>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href as Route} className="transition-colors hover:text-foreground">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-start justify-between gap-4 border-t border-border/60 pt-8 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} Sanda. Tüm hakları saklıdır.</p>
          <p className="rounded-full border border-border/70 bg-card/50 px-3 py-1">
            ETBİS kayıtlı aracı hizmet sağlayıcı.
          </p>
        </div>
      </div>
    </footer>
  );
}
