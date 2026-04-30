import { Badge, Card, CardContent } from '@sanda/ui-web';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ön Bilgilendirme Formu',
  description: 'Sanda platform ön bilgilendirme formu — mesafeli satış öncesi zorunlu bilgilendirme.',
};

export default function PreInfoPage() {
  return (
    <div className="container max-w-4xl py-14 md:py-20">
      <Badge tone="outline" className="mb-4 border-primary/25 bg-primary/[0.06]">Yasal</Badge>
      <h1 className="font-display text-4xl font-semibold tracking-tight">Ön Bilgilendirme Formu</h1>
      <p className="mt-4 text-sm text-muted-foreground">Son güncelleme: 25 Nisan 2026</p>

      <Card className="mt-8 border-primary/20 bg-primary/[0.03]">
        <CardContent className="p-6 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Aracı hizmet sağlayıcı bildirimi</p>
          <p className="mt-2">
            İşbu ön bilgilendirme formu, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve
            Mesafeli Sözleşmeler Yönetmeliği kapsamında düzenlenmiştir. Sanda aracı hizmet sağlayıcı
            konumundadır; satış ilişkisi doğrudan üretici-satıcı ile alıcı arasında kurulur.
          </p>
        </CardContent>
      </Card>

      <div className="prose prose-neutral mt-10 max-w-none dark:prose-invert prose-headings:font-display prose-headings:tracking-tight prose-a:text-primary">
        <h2>1. Satıcı bilgileri</h2>
        <p>
          Her sipariş için satıcı bilgileri sipariş onay ekranında ve e-postasında
          açıkça belirtilir: satıcı unvanı, adresi, iletişim bilgileri ve vergi numarası.
        </p>

        <h2>2. Ürün bilgileri</h2>
        <p>
          Ürünün temel nitelikleri, tüm vergiler dahil satış fiyatı, birim bilgisi,
          üretim yöntemi, menşe bölgesi ve varsa sertifika bilgileri ürün sayfasında
          ve sipariş özetinde açıkça gösterilir.
        </p>

        <h2>3. Ödeme bilgileri</h2>
        <p>
          Ödemeler, BDDK lisanslı elektronik para kuruluşu iyzico üzerinden 3D Secure ile işlenir.
          Kart bilgileri platformda saklanmaz. Tutar, satıcı için açılan iyzico submerchant hesabına
          hakediş olarak kaydedilir; teslimat onayı ve iade penceresi sonunda komisyon otomatik
          kesilerek satıcı IBAN’ına aktarılır.
        </p>

        <h2>4. Teslimat koşulları</h2>
        <p>
          Teslimat süresi satıcının belirttiği hazırlık süresi ve kargo taşıma süresine bağlıdır.
          Tahmini teslimat süresi sipariş sırasında gösterilir. Taze gıda ürünlerinde
          satıcı soğuk zincir gereksinimlerini belirtir.
        </p>

        <h2>5. Cayma hakkı</h2>
        <p>
          Tüketici, ürünün tesliminden itibaren <strong>14 gün</strong> içinde cayma hakkını kullanabilir.
        </p>
        <p>
          <strong>İstisnalar:</strong> Çabuk bozulabilen veya son kullanma tarihi geçebilecek ürünler,
          tüketicinin isteği doğrultusunda kişiselleştirilen ürünler ve ambalajı açılmış gıda ürünleri
          cayma hakkı kapsamı dışındadır (6502 sayılı Kanun md. 15).
        </p>

        <h2>6. İade prosedürü</h2>
        <p>
          Cayma hakkı kapsamındaki iadeler için platform üzerinden iade talebi oluşturulur.
          Satıcı, iade koşullarını ve kargo detaylarını belirler. İade onayından sonra
          ödeme tutarı aynı ödeme yöntemine iade edilir.
        </p>

        <h2>7. Şikâyet ve uyuşmazlık</h2>
        <p>
          Uyuşmazlıklarda Ticaret Bakanlığı tarafından ilan edilen parasal sınırlara göre
          tüketici hakem heyetleri, üzerinde tüketici mahkemeleri yetkilidir. Platform
          içi destek sistemi üzerinden de şikâyet oluşturulabilir.
        </p>

        <h2>8. İletişim</h2>
        <p>
          Destek: <a href="mailto:destek@sanda.com.tr">destek@sanda.com.tr</a>
        </p>
      </div>
    </div>
  );
}
