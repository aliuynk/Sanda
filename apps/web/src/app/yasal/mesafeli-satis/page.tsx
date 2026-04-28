import { Badge, Card, CardContent } from '@sanda/ui-web';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mesafeli Satış Sözleşmesi',
  description: 'Sanda platform mesafeli satış sözleşmesi ön bilgilendirme formu.',
};

export default function DistanceSellingPage() {
  return (
    <div className="container max-w-4xl py-14 md:py-20">
      <Badge tone="outline" className="mb-4 border-primary/25 bg-primary/[0.06]">Yasal</Badge>
      <h1 className="font-display text-4xl font-semibold tracking-tight">Mesafeli Satış Sözleşmesi</h1>
      <p className="mt-4 text-sm text-muted-foreground">Son güncelleme: 25 Nisan 2026</p>

      <Card className="mt-8 border-primary/20 bg-primary/[0.03]">
        <CardContent className="p-6 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Önemli not — Çoklu satıcı yapısı</p>
          <p className="mt-2">
            Sanda pazar yeri modelinde her sipariş, ilgili satıcı (üretici) ile alıcı arasında
            doğrudan kurulur. Platform aracı hizmet sağlayıcıdır. Fatura, iade ve ürün sorumluluğu
            satıcıya aittir. Sepetin birden fazla satıcıdan ürün içermesi halinde her satıcı için
            ayrı sipariş ve ayrı mesafeli satış sözleşmesi oluşturulur.
          </p>
        </CardContent>
      </Card>

      <div className="prose prose-neutral mt-10 max-w-none dark:prose-invert prose-headings:font-display prose-headings:tracking-tight prose-a:text-primary">
        <h2>1. Sözleşmenin tarafları</h2>
        <p>
          <strong>Satıcı:</strong> Sanda platformunda mağaza açarak ürün satan üretici/işletme.
          Satıcı bilgileri her siparişte ayrıca belirtilir.
        </p>
        <p>
          <strong>Alıcı:</strong> Platform üzerinden sipariş veren tüketici.
        </p>
        <p>
          <strong>Aracı hizmet sağlayıcı:</strong> Sanda platformu. ETBİS kayıtlı.
        </p>

        <h2>2. Sözleşme konusu</h2>
        <p>
          İşbu sözleşme, alıcının platformdan sipariş ettiği ürün(ler)in satışı ve teslimi
          ile tarafların hak ve yükümlülüklerini düzenler.
        </p>

        <h2>3. Ürün bilgileri ve fiyat</h2>
        <p>
          Ürünün temel nitelikleri, satış fiyatı (KDV dahil), birim bilgisi ve kargo ücreti
          ürün sayfasında ve sipariş özetinde açıkça belirtilir. Fiyatlar Türk Lirası cinsindendir.
        </p>

        <h2>4. Ödeme şekli</h2>
        <p>
          Ödemeler lisanslı ödeme kuruluşu (iyzico) üzerinden güvenli şekilde işlenir.
          Tutar, teslimat onayına kadar emanette (escrow) tutulur.
        </p>

        <h2>5. Teslimat</h2>
        <p>
          Teslimat, satıcının belirlediği hizmet alanı ve kargo kurallarına göre gerçekleştirilir.
          Tahmini teslimat süresi sipariş sırasında gösterilir. Taze gıda ürünlerinde
          soğuk zincir gereksinimleri satıcı tarafından belirtilir.
        </p>

        <h2>6. Cayma hakkı</h2>
        <p>
          Alıcı, ürünün kendisine veya gösterdiği adresteki kişiye tesliminden itibaren
          14 gün içinde hiçbir gerekçe göstermeksizin cayma hakkını kullanabilir.
        </p>
        <p>
          <strong>Cayma hakkı kullanılamayan durumlar:</strong> Çabuk bozulabilen veya
          son kullanma tarihi geçebilecek mallar, ambalajı açıldıktan sonra iade edilemeyecek
          hijyen hassasiyeti olan gıda ürünleri (6502 sayılı Kanun md. 15/ğ).
        </p>

        <h2>7. Uyuşmazlık çözümü</h2>
        <p>
          İşbu sözleşmeden doğan uyuşmazlıklarda Tüketici Hakem Heyetleri ve
          Tüketici Mahkemeleri yetkilidir. Ticaret Bakanlığı tarafından ilan edilen
          parasal sınırlar uygulanır.
        </p>
      </div>
    </div>
  );
}
