import { Badge, Card, CardContent } from '@sanda/ui-web';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kullanım Koşulları',
  description: 'Sanda platform kullanım koşulları ve hizmet şartları.',
};

export default function TermsPage() {
  return (
    <div className="container max-w-4xl py-14 md:py-20">
      <Badge tone="outline" className="mb-4 border-primary/25 bg-primary/[0.06]">Yasal</Badge>
      <h1 className="font-display text-4xl font-semibold tracking-tight">Kullanım Koşulları</h1>
      <p className="mt-4 text-sm text-muted-foreground">Son güncelleme: 25 Nisan 2026</p>

      <div className="prose prose-neutral mt-10 max-w-none dark:prose-invert prose-headings:font-display prose-headings:tracking-tight prose-a:text-primary">
        <Card className="mb-8 border-primary/20 bg-primary/[0.03]">
          <CardContent className="p-6 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Önemli not</p>
            <p className="mt-2">
              Sanda, aracı hizmet sağlayıcı konumundadır ve ETBİS kayıtlıdır. Satıcı-of-record (satış kaydının sahibi)
              her zaman üretici/satıcıdır. Platform, ödeme aracılığını lisanslı ödeme kuruluşları (iyzico vb.) üzerinden sağlar.
            </p>
          </CardContent>
        </Card>

        <h2>1. Taraflar ve tanımlar</h2>
        <p>
          İşbu Kullanım Koşulları, Sanda platformu (&ldquo;Platform&rdquo;) ile platforma kayıt olan
          tüm kullanıcılar (&ldquo;Kullanıcı&rdquo;, &ldquo;Alıcı&rdquo; veya &ldquo;Satıcı&rdquo;) arasındaki hukuki çerçeveyi belirler.
          Platform, aracı hizmet sağlayıcı (6563 sayılı Kanun kapsamında) olarak faaliyet gösterir.
        </p>

        <h2>2. Hizmet kapsamı</h2>
        <p>
          Platform, tarımsal ve gıda ürünlerinin üreticiden tüketiciye doğrudan satışını
          kolaylaştıran bir pazar yeri altyapısı sunar. Platform:
        </p>
        <ul>
          <li>Ürün listeleme, vitrin ve keşif hizmeti sağlar.</li>
          <li>Çoklu satıcı sepet ve sipariş yönetimi sunar.</li>
          <li>Lisanslı ödeme kuruluşları aracılığıyla ödeme altyapısı sağlar.</li>
          <li>Sertifika doğrulama ve şeffaflık araçları sunar.</li>
          <li>Coğrafi hizmet alanı eşleştirmesi yapar.</li>
        </ul>

        <h2>3. Satıcı sorumluluğu</h2>
        <p>
          Satıcı, ürünlerinin yasal düzenlemelere uygunluğundan, gıda güvenliğinden,
          fatura/e-arşiv/e-belge düzenlemesinden, iade ve ayıplı ürün süreçlerinden
          birinci derecede sorumludur. Platform bu sorumlulukları üstlenmez.
        </p>

        <h2>4. Ödeme ve komisyon</h2>
        <p>
          Ödemeler, lisanslı ödeme kuruluşu üzerinden işlenir. Platform komisyonu
          otomatik olarak kesilir ve kalan tutar satıcıya aktarılır. Platform emanet para
          tutan taraf olarak konumlanmaz; ödeme kuruluşu bu işlevi üstlenir.
        </p>

        <h2>5. Fikri mülkiyet</h2>
        <p>
          Platform arayüzü, tasarımı ve yazılımına ilişkin tüm fikri mülkiyet hakları
          Sanda&apos;ya aittir. Kullanıcılar, yükledikleri içerikler üzerindeki haklarını korur.
        </p>

        <h2>6. Kişisel verilerin korunması</h2>
        <p>
          Kişisel verilerin işlenmesi 6698 sayılı KVKK kapsamında gerçekleştirilir.
          Detaylı bilgi için Gizlilik Politikası ve KVKK Aydınlatma Metni&apos;ne başvurunuz.
        </p>

        <h2>7. Uyuşmazlık çözümü</h2>
        <p>
          İşbu sözleşmeden doğan uyuşmazlıklarda Türk hukuku uygulanır.
          Tüketici işlemlerinde Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir.
        </p>
      </div>
    </div>
  );
}
