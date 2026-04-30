import { Badge, buttonVariants, Card, CardContent, cn } from '@sanda/ui-web';
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  CreditCard,
  FileCheck,
  Flower2,
  HeartHandshake,
  Leaf,
  MapPin,
  MessageCircle,
  Percent,
  Scale,
  ShieldCheck,
  Sprout,
  Truck,
  Users,
  Zap,
} from 'lucide-react';
import type { Metadata } from 'next';
import type { Route } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Sanda'da satıcı olmak",
  description:
    'Türkiye\'nin şeffaf pazar yerinde üretici olarak kayıt ol. Kendi fiyatını, teslimat alanlarını ve çiftlik ziyaretlerini yönet.',
};

const steps = [
  {
    icon: HeartHandshake,
    title: 'Kimlik ve iletişim',
    description: 'Cep telefonu ile kimliğini doğrula; hesabını 2 dakikada aç.',
    detail: 'SMS doğrulama, şifresiz güvenli giriş',
  },
  {
    icon: FileCheck,
    title: 'Yasal bilgiler',
    description:
      'Çiftçi misin, esnaf mı, kooperatif mi? Sana uygun yol açılır: TC, ÇKS no, vergi no ya da MERSİS.',
    detail: 'e-fatura / e-arşiv entegrasyonu hazır',
  },
  {
    icon: Flower2,
    title: 'Çiftlik hikâyen',
    description: 'Üretim yöntemin, bahçen, ürün çeşitliliğin — müşterilere anlatacağımız hikâye.',
    detail: 'Fotoğraf, video ve hikâye desteği',
  },
  {
    icon: Truck,
    title: 'Teslimat alanları',
    description: 'Kargoyla nerelere gönderiyorsun? Kim bahçeye gelip alabilir? Kuralı sen belirle.',
    detail: 'PostGIS ile il bazlı kapsama yönetimi',
  },
  {
    icon: CheckCircle2,
    title: 'Sertifikalar (opsiyonel)',
    description: 'Organik, İyi Tarım, coğrafi işaret gibi belgelerini yükle; biz doğrularız.',
    detail: 'Otomatik süre takibi & rozet yönetimi',
  },
];

const advantages = [
  {
    icon: CreditCard,
    title: 'Güvenli ödeme',
    description:
      'iyzico lisanslı altyapısıyla ödeme alınır, komisyon otomatik kesilir, kalan tutar hesabına aktarılır.',
  },
  {
    icon: Scale,
    title: 'Satıcı-of-record modeli',
    description:
      'Hukuki satıcı sensin. Fatura, e-arşiv, iade ve ürün sorumluluğu doğrudan sende — platform aracı değil, pazaryer.',
  },
  {
    icon: MapPin,
    title: 'Coğrafi kontrol',
    description:
      'Kargoyla nerelere gönderdiğini, elden teslim alanlarını ve bahçe ziyaretine açık olup olmadığını sen belirlersin.',
  },
  {
    icon: ShieldCheck,
    title: 'Doğrulanmış sertifikalar',
    description:
      'Organik, İyi Tarım, coğrafi işaret belgelerini yükle; süresi dolanlar otomatik düşer, alıcılar gerçek durumu görür.',
  },
  {
    icon: BarChart3,
    title: 'Analitik ve raporlar',
    description:
      'Sipariş, kazanç, komisyon, tevkifat raporları ve satış analitikleri — tek panelden takip.',
  },
  {
    icon: MessageCircle,
    title: 'Doğrudan iletişim',
    description:
      'Alıcılarla platform içi mesajlaşma; sipariş bazlı soruları anında yanıtla, güven inşa et.',
  },
];

const sellerTypes = [
  {
    icon: Sprout,
    title: 'Bireysel üretici',
    description:
      'Şahıs işletmesi, çiftçi kaydı (ÇKS) ve gerekli gıda belgeleri ile yasal satıcı olarak kayıt.',
    badge: 'Çiftçi / esnaf',
  },
  {
    icon: Users,
    title: 'Kooperatif & birlik',
    description:
      'Köy, ilçe bazlı kooperatifler ve kadın girişimi kooperatifleri platform üzerinden satıcı olur. Üretici ürün sağlar, kooperatif hukuki satıcıdır.',
    badge: 'Güçlü model',
  },
  {
    icon: Building2,
    title: 'Şirket / işletme',
    description:
      'Limited, anonim şirket veya ticari işletme olarak MERSİS, vergi numarası ve ticaret sicil ile kayıt.',
    badge: 'Ölçeklenebilir',
  },
];

export default function BecomeSellerPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,hsl(var(--primary)/0.22),transparent_55%),radial-gradient(ellipse_50%_40%_at_0%_80%,hsl(var(--accent)/0.10),transparent)]" />
        <div className="bg-noise pointer-events-none absolute inset-0 opacity-30" aria-hidden />
        <div className="container relative mx-auto max-w-5xl py-20 text-center md:py-28">
          <Badge
            tone="outline"
            className="mx-auto mb-6 w-fit gap-1.5 border-primary/25 bg-primary/[0.06] px-3 py-1 text-xs font-semibold"
          >
            <Leaf className="h-3 w-3 text-primary" aria-hidden />
            Komisyon: sadece %10 · Kargo komisyon dışı
          </Badge>
          <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl lg:text-6xl">
            Üretiminin hikâyesini,{' '}
            <span className="bg-gradient-to-r from-primary to-leaf-600 bg-clip-text text-transparent dark:from-primary dark:to-leaf-400">
              doğrudan tüketiciye anlat.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Sanda, aracısız bir pazar yeri. Ne kadar satacağına, nereye göndereceğine, kime
            açacağına sen karar verirsin. Biz sadece seni görünür kılarız — vergini otomatikleştiririz,
            parayı lisanslı ödeme kuruluşu dağıtır.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={'/sat/basla' as Route}
              className={cn(
                buttonVariants({ size: 'lg' }),
                'rounded-xl px-8 shadow-lg shadow-primary/20',
              )}
            >
              Başvuruyu başlat
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#nasil-calisir"
              className={cn(
                buttonVariants({ size: 'lg', variant: 'outline' }),
                'rounded-xl border-primary/30 bg-background/50',
              )}
            >
              Nasıl çalışır?
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground">
            {[
              'Lisanslı ödeme altyapısı (iyzico)',
              'e-fatura / e-arşiv entegrasyonu',
              'Belgesiz ürün yayınlanmaz',
            ].map((item) => (
              <span key={item} className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span className="font-medium text-foreground/80">{item}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Seller Types */}
      <section className="border-b border-border/60 bg-gradient-to-b from-muted/20 to-background py-16 md:py-20">
        <div className="container">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Sen ne tip üreticisin?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Bireysel üreticiyi platforma çekeriz, ama satışa başlamadan önce yasal satıcı haline
              getiririz. Kooperatif modeli özellikle küçük üreticiler için güçlüdür.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">
            {sellerTypes.map((type) => {
              const Icon = type.icon;
              return (
                <Card
                  key={type.title}
                  className="group relative overflow-hidden border-border/70 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl"
                >
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-100" />
                  <CardContent className="relative space-y-4 p-7">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 ring-1 ring-primary/20">
                        <Icon className="h-5 w-5 text-primary" aria-hidden />
                      </span>
                      <Badge tone="outline" className="rounded-lg border-primary/25 text-xs">
                        {type.badge}
                      </Badge>
                    </div>
                    <h3 className="font-display text-xl font-semibold">{type.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {type.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="nasil-calisir" className="container py-16 md:py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <Badge tone="outline" className="mb-4 border-primary/20 bg-primary/[0.05]">
            5 adımda satışa başla
          </Badge>
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Nasıl çalışır?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Onboarding süreci seni adım adım yönlendirir. Her aşamada nerede olduğunu görür, istediğin zaman devam edersin.
          </p>
        </div>
        <div className="relative mx-auto max-w-4xl">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 hidden h-full w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent md:block" />
          <ol className="space-y-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="relative md:pl-16">
                  <span className="absolute left-3.5 top-5 hidden h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground md:flex">
                    {i + 1}
                  </span>
                  <Card className="border-border/70 shadow-sm transition-all duration-300 hover:shadow-md">
                    <CardContent className="flex items-start gap-5 p-6">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/12 ring-1 ring-primary/20 md:hidden">
                        <span className="text-xs font-bold text-primary">{i + 1}</span>
                      </span>
                      <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/12 ring-1 ring-primary/20 md:flex">
                        <Icon className="h-5 w-5 text-primary" aria-hidden />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-lg font-semibold">{step.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {step.description}
                        </p>
                        <Badge
                          tone="outline"
                          className="mt-3 rounded-md border-primary/20 bg-primary/[0.04] text-xs"
                        >
                          <Zap className="h-3 w-3 text-primary" />
                          {step.detail}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Advantages grid */}
      <section className="border-y border-border/60 bg-gradient-to-b from-muted/20 to-background py-16 md:py-20">
        <div className="container">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
              Neden Sanda?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Platform olarak pazaryeri kalırız — &quot;vergini biz üstleniyoruz&quot; demeyiz, &quot;vergisel süreci
              otomatikleştiriyoruz&quot; deriz.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2 lg:grid-cols-3">
            {advantages.map((adv) => {
              const Icon = adv.icon;
              return (
                <Card
                  key={adv.title}
                  className="group border-border/70 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <CardContent className="space-y-3 p-6">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/12 ring-1 ring-primary/20 transition-colors group-hover:bg-primary/20">
                      <Icon className="h-5 w-5 text-primary" aria-hidden />
                    </span>
                    <h3 className="font-display text-lg font-semibold">{adv.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {adv.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Commission & CTA */}
      <section className="container py-16 md:py-20">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          <Card className="overflow-hidden border-border/70 shadow-lg shadow-black/[0.03]">
            <CardContent className="p-8 md:p-10">
              <div className="flex items-center gap-3">
                <Percent className="h-8 w-8 text-primary" aria-hidden />
                <h3 className="font-display text-2xl font-semibold">Komisyon ne kadar?</h3>
              </div>
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
                <div className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>
                    Sanda ürün bedeli üzerinden sabit <strong className="text-foreground">%10 komisyon</strong> alır.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>Kargo ücreti doğrudan sana geçer, komisyondan düşülmez.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>Ödeme iyzico lisanslı altyapısından teslimat sonrası aktarılır.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>
                    KDV ve mali yükümlülükler üretim tipine göre değişir; onboarding sonrası tam özet
                    görürsün.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/[0.07] via-card to-card shadow-lg shadow-primary/10">
            <CardContent className="flex flex-col justify-center p-8 md:p-10">
              <h3 className="font-display text-2xl font-semibold">Satışa başla</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Kayıt tamamen ücretsiz. İlk ürününü oluşturana kadar hiçbir ücret ödenmez. Onboarding
                süreci seni yasal satıcı haline getirir — belgeler hazır olduğunda vitrinde
                görünürsün.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={'/sat/basla' as Route}
                  className={cn(
                    buttonVariants({ size: 'lg' }),
                    'rounded-xl px-8 shadow-md shadow-primary/25',
                  )}
                >
                  Üretici başvurusu
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/yardim"
                  className={cn(
                    buttonVariants({ size: 'lg', variant: 'outline' }),
                    'rounded-xl',
                  )}
                >
                  Sıkça sorulan sorular
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Document gate note */}
      <section className="border-t border-border/60 bg-muted/10">
        <div className="container mx-auto max-w-3xl py-12 text-center">
          <ShieldCheck className="mx-auto h-8 w-8 text-primary" aria-hidden />
          <h3 className="mt-4 font-display text-xl font-semibold">
            Belgesiz ürün yayına çıkmaz
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Kategori bazlı belge kapısı: Organik sertifika olmadan &quot;organik&quot; iddiası yapılamaz, laboratuvar
            analizi olmadan &quot;pestisitsiz&quot; beyanı verilemez. Paketli gıda, takviye edici gıda ve et/süt
            ürünleri için ek onay gerekir. Bu yaklaşım hem tüketiciyi korur hem de platformun
            güvenilirliğini sağlar.
          </p>
        </div>
      </section>
    </>
  );
}
