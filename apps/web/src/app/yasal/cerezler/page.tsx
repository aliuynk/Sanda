import { Badge } from '@sanda/ui-web';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Çerez Politikası',
  description: 'Sanda çerez politikası — web sitesi ve uygulamada kullanılan çerezler.',
};

export default function CookiePolicyPage() {
  return (
    <div className="container max-w-4xl py-14 md:py-20">
      <Badge tone="outline" className="mb-4 border-primary/25 bg-primary/[0.06]">Yasal</Badge>
      <h1 className="font-display text-4xl font-semibold tracking-tight">Çerez Politikası</h1>
      <p className="mt-4 text-sm text-muted-foreground">Son güncelleme: 25 Nisan 2026</p>

      <div className="prose prose-neutral mt-10 max-w-none dark:prose-invert prose-headings:font-display prose-headings:tracking-tight prose-a:text-primary">
        <h2>1. Çerez nedir?</h2>
        <p>
          Çerezler, web siteleri tarafından cihazınıza yerleştirilen küçük metin dosyalarıdır.
          Platform deneyimini kişiselleştirmek, tercihlerinizi hatırlamak ve hizmetlerimizi
          iyileştirmek için kullanılır.
        </p>

        <h2>2. Kullandığımız çerez türleri</h2>

        <h3>Zorunlu çerezler</h3>
        <p>
          Oturum yönetimi, güvenlik ve temel işlevler için gereklidir. Devre dışı bırakılamaz.
        </p>

        <h3>Analitik çerezler</h3>
        <p>
          Ziyaretçi davranışını anonim olarak analiz etmek için kullanılır (PostHog, AB&apos;de barındırılır).
        </p>

        <h3>İşlevsel çerezler</h3>
        <p>
          Dil tercihi, tema seçimi ve sepet bilgilerinin saklanması için kullanılır.
        </p>

        <h2>3. Çerezleri yönetme</h2>
        <p>
          Tarayıcı ayarlarınızdan çerezleri sınırlayabilir veya silebilirsiniz. Ancak bazı
          zorunlu çerezlerin devre dışı bırakılması platformun düzgün çalışmamasına neden olabilir.
        </p>

        <h2>4. Üçüncü taraf çerezleri</h2>
        <p>
          Ödeme altyapısı (iyzico) ve hata takibi (Sentry) servisleri kendi çerezlerini kullanabilir.
          Bu çerezler ilgili servislerin gizlilik politikalarına tabidir.
        </p>
      </div>
    </div>
  );
}
