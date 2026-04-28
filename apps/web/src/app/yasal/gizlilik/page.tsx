import { Badge } from '@sanda/ui-web';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası',
  description: 'Sanda gizlilik politikası — kişisel verilerin korunması ve işlenmesi.',
};

export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl py-14 md:py-20">
      <Badge tone="outline" className="mb-4 border-primary/25 bg-primary/[0.06]">Yasal</Badge>
      <h1 className="font-display text-4xl font-semibold tracking-tight">Gizlilik Politikası</h1>
      <p className="mt-4 text-sm text-muted-foreground">Son güncelleme: 25 Nisan 2026</p>

      <div className="prose prose-neutral mt-10 max-w-none dark:prose-invert prose-headings:font-display prose-headings:tracking-tight prose-a:text-primary">
        <h2>1. Toplanan veriler</h2>
        <p>
          Platform hizmetlerinin sunulması için aşağıdaki kişisel veriler toplanır:
        </p>
        <ul>
          <li><strong>Kimlik bilgileri:</strong> Ad, soyad, TC kimlik numarası (satıcılar için, şifreli saklanır)</li>
          <li><strong>İletişim bilgileri:</strong> Telefon numarası, e-posta adresi</li>
          <li><strong>Finansal bilgiler:</strong> IBAN (satıcılar için, şifreli saklanır), ödeme kart bilgileri (iyzico tarafından işlenir, platformda saklanmaz)</li>
          <li><strong>Konum bilgileri:</strong> Teslimat adresleri, satıcı çiftlik konumu</li>
          <li><strong>Cihaz bilgileri:</strong> IP adresi, tarayıcı bilgileri, cihaz türü</li>
        </ul>

        <h2>2. Verilerin işlenme amacı</h2>
        <p>
          Kişisel veriler yalnızca platformun işlevselliği, yasal yükümlülüklerin yerine getirilmesi
          ve kullanıcı deneyiminin iyileştirilmesi amaçlarıyla işlenir.
        </p>

        <h2>3. Verilerin paylaşımı</h2>
        <p>
          Kişisel veriler, siparişin tamamlanması için gerekli taraflarla (satıcı, kargo firması,
          ödeme kuruluşu) paylaşılır. Üçüncü taraf pazarlama amacıyla paylaşılmaz.
        </p>

        <h2>4. Veri güvenliği</h2>
        <p>
          Hassas veriler (TC Kimlik, IBAN) uygulama katmanında zarf şifreleme (envelope encryption)
          ile korunur. KMS-wrapped DEK hiçbir zaman uygulama loglarında yer almaz.
        </p>

        <h2>5. Veri saklama süresi</h2>
        <p>
          Kişisel veriler, işleme amacının gerektirdiği süre boyunca saklanır. Yasal zorunluluklar
          gereği saklama süreleri farklılık gösterebilir.
        </p>

        <h2>6. Kullanıcı hakları</h2>
        <p>
          KVKK kapsamında veri sahipleri; verilerine erişim, düzeltme, silme, aktarım
          ve işlemeye itiraz haklarına sahiptir. Başvurular destek@sanda.com.tr adresine yapılabilir.
        </p>
      </div>
    </div>
  );
}
