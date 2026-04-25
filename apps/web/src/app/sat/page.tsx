import { buttonVariants, Card, CardContent, cn } from '@sanda/ui-web';
import { CheckCircle2, FileCheck, Flower2, HeartHandshake, Truck } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';

export const metadata = {
  title: 'Sanda’da satıcı olmak',
};

const steps = [
  {
    icon: HeartHandshake,
    title: 'Kimlik ve iletişim',
    description: 'Cep telefonu ile kimliğini doğrula; hesabını 2 dakikada aç.',
  },
  {
    icon: FileCheck,
    title: 'Yasal bilgiler',
    description:
      'Çiftçi misin, esnaf mı, kooperatif mi? Sana uygun yol açılır: TC, ÇKS no, vergi no ya da MERSİS.',
  },
  {
    icon: Flower2,
    title: 'Çiftlik hikâyen',
    description: 'Üretim yöntemin, bahçen, ürün çeşitliliğin — müşterilere anlatacağımız hikâye.',
  },
  {
    icon: Truck,
    title: 'Teslimat alanları',
    description: 'Kargoyla nerelere gönderiyorsun? Kim bahçeye gelip alabilir? Kuralı sen belirle.',
  },
  {
    icon: CheckCircle2,
    title: 'Sertifikalar (opsiyonel)',
    description: 'Organik, İyi Tarım, coğrafi işaret gibi belgelerini yükle; biz doğrularız.',
  },
];

export default function BecomeSellerPage() {
  return (
    <div className="container py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="font-display text-4xl leading-tight md:text-5xl">
          Üretiminin hikâyesini, doğrudan tüketiciye anlat.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          Sanda, aracısız bir pazar yeri. Ne kadar satacağına, nereye göndereceğine, kime
          açacağına sen karar verirsin. Biz sadece seni görünür kılarız.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href={'/sat/basla' as Route} className={cn(buttonVariants({ size: 'lg' }))}>
            Başvuruyu başlat
          </Link>
          <Link
            href={'/yardim/uretici' as Route}
            className={cn(buttonVariants({ size: 'lg', variant: 'outline' }))}
          >
            Nasıl çalışıyor?
          </Link>
        </div>
      </div>

      <ol className="mx-auto mt-16 grid max-w-5xl gap-4 md:grid-cols-5">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <li key={step.title}>
              <Card className="h-full">
                <CardContent className="flex flex-col gap-2 p-5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {i + 1}
                    </span>
                    <Icon className="h-5 w-5 text-primary" aria-hidden />
                  </div>
                  <h3 className="font-medium">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ol>

      <section className="mx-auto mt-20 max-w-3xl rounded-xl border bg-muted/30 p-8 text-center">
        <h2 className="font-display text-2xl">Komisyon ne kadar?</h2>
        <p className="mt-3 text-muted-foreground">
          Sanda ürün bedeli üzerinden sabit %10 komisyon alır. Kargo ücreti doğrudan sana geçer,
          komisyondan düşülmez. KDV ve mali yükümlülükler üretim tipine göre değişir; onboarding
          sonrası tam özet görürsün.
        </p>
      </section>
    </div>
  );
}
