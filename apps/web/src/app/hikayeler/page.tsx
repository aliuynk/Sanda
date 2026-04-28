import {
  Badge,
  Card,
  CardContent,
} from '@sanda/ui-web';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Leaf,
  User,
} from 'lucide-react';
import type { Metadata } from 'next';
import type { Route } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Hikâyeler',
  description: 'Üreticilerin hikâyeleri, tarım rehberleri ve mevsimsel öneriler.',
};

/* ---------------------------------------------------------------------------
 * Blog / Stories listing page (/hikayeler)
 *
 * Static seed content — will later be replaced by a CMS (e.g. Sanity/Strapi).
 * -------------------------------------------------------------------------- */

interface Story {
  slug: string;
  title: string;
  summary: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  featured?: boolean;
}

const stories: Story[] = [
  {
    slug: 'anadolu-zeytinyagi-rehberi',
    title: 'Anadolu zeytinyağı rehberi: soğuk sıkım neden önemli?',
    summary:
      'Soğuk sıkım zeytinyağının geleneksel yöntemlerle farkını, polifenol değerlerini ve doğru seçim ipuçlarını keşfet.',
    category: 'Rehber',
    author: 'Sanda Editör',
    date: '2026-04-20',
    readTime: '8 dk',
    featured: true,
  },
  {
    slug: 'organik-sertifika-sureci',
    title: 'Organik sertifika süreci: adım adım başvuru rehberi',
    summary:
      'Türkiye\'de organik tarım sertifikası almak isteyen üreticiler için başvuru süreci, denetim aşamaları ve maliyet analizi.',
    category: 'Üreticiler için',
    author: 'Sanda Editör',
    date: '2026-04-15',
    readTime: '12 dk',
  },
  {
    slug: 'mevsimlik-sebze-takvimi',
    title: 'Mevsimlik sebze takvimi: hangi ayda ne yenmeli?',
    summary:
      'Anadolu ikliminde hangi sebze hangi ayda en taze? Mevsiminde beslenmenin sağlık ve çevre faydaları.',
    category: 'Mevsimsel',
    author: 'Sanda Editör',
    date: '2026-04-10',
    readTime: '6 dk',
  },
  {
    slug: 'ciftlikten-sofraya-guvence',
    title: 'Çiftlikten sofraya güvence: emanet ödeme sistemi',
    summary:
      'Sanda\'nın emanet (escrow) ödeme modelinin alıcı ve satıcıyı nasıl koruduğunu öğren.',
    category: 'Platform',
    author: 'Sanda Editör',
    date: '2026-04-05',
    readTime: '5 dk',
  },
  {
    slug: 'dogal-bal-cesitleri',
    title: 'Türkiye\'nin doğal bal çeşitleri ve bölgesel farklar',
    summary:
      'Çam balından kestane balına, Karadeniz\'den Ege\'ye: Türkiye\'nin zengin bal coğrafyası.',
    category: 'Keşfet',
    author: 'Sanda Editör',
    date: '2026-04-01',
    readTime: '10 dk',
  },
  {
    slug: 'kucuk-uretici-destek',
    title: 'Küçük üreticiyi desteklemenin 5 somut yolu',
    summary:
      'Yerel ekonomiye katkı, gıda güvenliği ve sürdürülebilir tarım: bilinçli tüketici olmanın yolları.',
    category: 'Topluluk',
    author: 'Sanda Editör',
    date: '2026-03-25',
    readTime: '7 dk',
  },
];

const categoryColors: Record<string, string> = {
  Rehber: 'bg-emerald-500/10 text-emerald-700',
  'Üreticiler için': 'bg-amber-500/10 text-amber-700',
  Mevsimsel: 'bg-sky-500/10 text-sky-700',
  Platform: 'bg-violet-500/10 text-violet-700',
  Keşfet: 'bg-rose-500/10 text-rose-700',
  Topluluk: 'bg-orange-500/10 text-orange-700',
};

export default function StoriesPage() {
  const featured = stories.find((s) => s.featured);
  const rest = stories.filter((s) => !s.featured);

  return (
    <div className="container max-w-5xl py-10 md:py-14">
      <div className="mb-10">
        <Badge tone="outline" className="mb-3 gap-1.5 rounded-lg border-primary/25 bg-primary/[0.06]">
          <BookOpen className="h-3 w-3" />
          Blog
        </Badge>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
          Hikâyeler
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground">
          Üreticilerin hikâyeleri, tarım rehberleri ve mevsimsel öneriler.
          Çiftlikten sofraya uzanan yolculuğu keşfet.
        </p>
      </div>

      {/* Featured */}
      {featured && (
        <Link href={`/hikayeler/${featured.slug}` as Route}>
          <Card className="group mb-10 overflow-hidden border-border/70 transition-all duration-300 hover:border-primary/25 hover:shadow-xl">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2">
                <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-muted md:aspect-auto">
                  <Leaf className="h-20 w-20 text-primary/30 transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="flex flex-col justify-center p-8 md:p-10">
                  <Badge className={`mb-3 w-fit rounded-md text-xs ${categoryColors[featured.category] ?? ''}`}>
                    {featured.category}
                  </Badge>
                  <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight transition-colors group-hover:text-primary md:text-3xl">
                    {featured.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {featured.summary}
                  </p>
                  <div className="mt-5 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {featured.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {new Date(featured.date).toLocaleDateString('tr-TR', { dateStyle: 'medium' })}
                    </span>
                    <span>{featured.readTime} okuma</span>
                  </div>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    Oku <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((story) => (
          <Link key={story.slug} href={`/hikayeler/${story.slug}` as Route}>
            <Card className="group h-full border-border/70 transition-all duration-200 hover:border-primary/25 hover:shadow-lg">
              <CardContent className="flex h-full flex-col p-0">
                <div className="flex aspect-[16/9] items-center justify-center rounded-t-xl bg-gradient-to-br from-muted/80 to-muted">
                  <Leaf className="h-10 w-10 text-muted-foreground/15 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <Badge className={`mb-2 w-fit rounded-md text-[10px] ${categoryColors[story.category] ?? ''}`}>
                    {story.category}
                  </Badge>
                  <h3 className="font-display text-lg font-semibold leading-snug transition-colors group-hover:text-primary">
                    {story.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                    {story.summary}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{new Date(story.date).toLocaleDateString('tr-TR', { dateStyle: 'medium' })}</span>
                    <span>{story.readTime} okuma</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
