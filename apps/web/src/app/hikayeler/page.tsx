import { Badge, buttonVariants, cn } from '@sanda/ui-web';
import { BookOpen, Quote } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';

export const metadata = {
  title: 'Hikâyeler',
  description: 'Üreticilerin toprak ve emek hikâyeleri — Sanda vitrininde öne çıkacak içerik alanı.',
};

export default function StoriesPage() {
  return (
    <div className="container max-w-3xl py-14 md:py-20">
      <Badge tone="outline" className="mb-6 border-primary/25 bg-primary/[0.06]">
        Editöryal
      </Badge>
      <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">Hikâyeler</h1>
      <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
        Burada yakında; çiftlik günlükleri, hasat anları ve bölgesel ürün atlasları yayınlanacak.
        Şimdilik üretici anlatılarını doğrudan{' '}
        <Link href={'/ureticiler' as Route} className="font-semibold text-primary hover:underline">
          üretici profillerinden
        </Link>{' '}
        okuyabilirsiniz.
      </p>

      <figure className="glass-panel relative mt-14 rounded-3xl p-8 md:p-10">
        <Quote className="absolute right-6 top-6 h-10 w-10 text-primary/20" aria-hidden />
        <div className="flex items-center gap-3 text-primary">
          <BookOpen className="h-5 w-5" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-[0.2em]">Yakında</span>
        </div>
        <blockquote className="mt-4 font-display text-xl font-medium leading-snug md:text-2xl">
          “Toprağın kodunu anlatan içerik, en iyi organik sertifikadan daha hızlı güven üretir.”
        </blockquote>
        <figcaption className="mt-6 text-sm text-muted-foreground">— Sanda içerik manifestosu</figcaption>
      </figure>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href={'/ureticiler' as Route} className={cn(buttonVariants({ variant: 'outline' }), 'rounded-xl')}>
          Üreticileri keşfet
        </Link>
        <Link href={'/sat' as Route} className={cn(buttonVariants(), 'rounded-xl')}>
          Hikâyeni vitrine taşı
        </Link>
      </div>
    </div>
  );
}
