import { Card, CardContent } from '@sanda/ui-web';
import {
  BookOpen,
  CreditCard,
  HelpCircle,
  Leaf,
  MessageCircle,
  Package,
  ShieldCheck,
  Truck,
  UserPlus,
} from 'lucide-react';
import type { Metadata } from 'next';
import type { Route } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Yardım merkezi',
  description: 'Sık sorulan sorular ve destek — Sanda farm-to-table pazar yeri.',
};

const categories = [
  {
    icon: UserPlus,
    title: 'Hesap ve kayıt',
    questions: [
      'Nasıl kayıt olabilirim?',
      'Telefonumu değiştirmek istiyorum.',
      'Hesabımı silebilir miyim?',
    ],
  },
  {
    icon: Package,
    title: 'Sipariş süreci',
    questions: [
      'Siparişimi nasıl takip edebilirim?',
      'Birden fazla üreticiden sipariş verdiğimde ne olur?',
      'Sipariş iptal sürecini nasıl başlatabilirim?',
    ],
  },
  {
    icon: Truck,
    title: 'Teslimat ve kargo',
    questions: [
      'Kargo süresi ne kadar?',
      'Hangi bölgelere teslimat yapılıyor?',
      'Soğuk zincir nasıl sağlanıyor?',
    ],
  },
  {
    icon: CreditCard,
    title: 'Ödeme ve iade',
    questions: [
      'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
      'iyzico hakediş ve satıcı aktarımı nasıl çalışır?',
      'İade koşulları nelerdir?',
    ],
  },
  {
    icon: ShieldCheck,
    title: 'Güvenlik ve gizlilik',
    questions: [
      'Kişisel bilgilerim nasıl korunuyor?',
      'İki faktörlü doğrulama aktif mi?',
      'Verilerimi nasıl indiririm / sildiririm?',
    ],
  },
  {
    icon: Leaf,
    title: 'Sertifikalar ve organik',
    questions: [
      'Organik sertifika nasıl doğrulanıyor?',
      'İyi Tarım Uygulamaları nedir?',
      'Sertifikasız ürünler güvenli mi?',
    ],
  },
];

const sellerFaq = [
  {
    icon: BookOpen,
    title: 'Satıcı başlangıç',
    questions: [
      'Satıcı olarak nasıl kayıt olabilirim?',
      'Hangi belgelere ihtiyacım var?',
      'Platform komisyon oranı nedir?',
    ],
  },
];

export default function HelpCenterPage() {
  return (
    <div className="container max-w-4xl py-14 md:py-20">
      {/* Hero */}
      <div className="mb-12 text-center">
        <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/12">
          <HelpCircle className="h-8 w-8 text-primary" />
        </span>
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
          Nasıl yardımcı olabiliriz?
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
          Sık sorulan sorulara göz at veya destek ekibimizle iletişime geç.
        </p>
      </div>

      {/* FAQ categories — Buyer */}
      <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight">Alıcılar için</h2>
      <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Card
              key={cat.title}
              className="group border-border/70 transition-all duration-200 hover:border-primary/25 hover:shadow-md"
            >
              <CardContent className="p-5">
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 transition-colors group-hover:bg-primary/20">
                  <Icon className="h-5 w-5 text-primary" />
                </span>
                <h3 className="font-display text-lg font-semibold">{cat.title}</h3>
                <ul className="mt-3 space-y-2">
                  {cat.questions.map((q) => (
                    <li key={q}>
                      <button
                        type="button"
                        className="text-left text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {q}
                      </button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* FAQ categories — Seller */}
      <h2 className="mb-6 font-display text-2xl font-semibold tracking-tight">Üreticiler için</h2>
      <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sellerFaq.map((cat) => {
          const Icon = cat.icon;
          return (
            <Card
              key={cat.title}
              className="group border-border/70 transition-all duration-200 hover:border-primary/25 hover:shadow-md"
            >
              <CardContent className="p-5">
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 transition-colors group-hover:bg-primary/20">
                  <Icon className="h-5 w-5 text-primary" />
                </span>
                <h3 className="font-display text-lg font-semibold">{cat.title}</h3>
                <ul className="mt-3 space-y-2">
                  {cat.questions.map((q) => (
                    <li key={q}>
                      <button
                        type="button"
                        className="text-left text-sm text-muted-foreground transition-colors hover:text-primary"
                      >
                        {q}
                      </button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Contact support */}
      <Card className="border-primary/20 bg-primary/[0.03]">
        <CardContent className="flex flex-col items-center gap-6 p-8 text-center sm:flex-row sm:text-left">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/12">
            <MessageCircle className="h-7 w-7 text-primary" />
          </span>
          <div className="flex-1">
            <h3 className="font-display text-xl font-semibold">Sorunun çözülmedi mi?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Destek ekibimiz hafta içi 09:00–18:00 arasında ulaşılabilir. Genellikle 2 saat içinde yanıt veriyoruz.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <a
              href="mailto:destek@sanda.com.tr"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/25 bg-card px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              destek@sanda.com.tr
            </a>
            <span className="text-xs text-muted-foreground">veya uygulama içi mesaj</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
