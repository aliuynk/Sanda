import { Badge } from '@sanda/ui-web';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KVKK Aydınlatma Metni',
  description: 'Sanda — 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni.',
};

export default function KvkkPage() {
  return (
    <div className="container max-w-4xl py-14 md:py-20">
      <Badge tone="outline" className="mb-4 border-primary/25 bg-primary/[0.06]">Yasal</Badge>
      <h1 className="font-display text-4xl font-semibold tracking-tight">KVKK Aydınlatma Metni</h1>
      <p className="mt-4 text-sm text-muted-foreground">Son güncelleme: 25 Nisan 2026</p>

      <div className="prose prose-neutral mt-10 max-w-none dark:prose-invert prose-headings:font-display prose-headings:tracking-tight prose-a:text-primary">
        <h2>1. Veri sorumlusu</h2>
        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz;
          veri sorumlusu olarak Sanda tarafından aşağıda açıklanan kapsamda işlenecektir.
        </p>

        <h2>2. İşlenen kişisel veriler</h2>
        <p>
          Kimlik bilgileri (ad, soyad, TC kimlik no), iletişim bilgileri (telefon, e-posta),
          finansal bilgiler (IBAN), işlem güvenliği bilgileri (IP adresi, oturum bilgileri),
          konum bilgileri (teslimat adresi) kategorilerinde kişisel veriler işlenmektedir.
        </p>

        <h2>3. İşleme amaçları</h2>
        <ul>
          <li>Üyelik ve platform hizmetlerinin sunulması</li>
          <li>Sipariş, ödeme ve teslimat süreçlerinin yürütülmesi</li>
          <li>Yasal yükümlülüklerin yerine getirilmesi</li>
          <li>Satıcı kimlik doğrulama ve sertifika süreçleri</li>
          <li>Platform güvenliğinin sağlanması</li>
          <li>İletişim faaliyetlerinin yürütülmesi</li>
        </ul>

        <h2>4. Aktarım</h2>
        <p>
          Kişisel veriler; ödeme kuruluşları (iyzico), kargo firmaları, yasal merciler ve
          platform hizmet sağlayıcılarına aktarılabilir. Yurt dışına veri aktarımı yapılması
          halinde KVKK'nın 9. maddesi kapsamında gerekli önlemler alınır.
        </p>

        <h2>5. Haklar</h2>
        <p>KVKK'nın 11. maddesi kapsamında aşağıdaki haklara sahipsiniz:</p>
        <ul>
          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
          <li>İşlenmişse buna ilişkin bilgi talep etme</li>
          <li>İşlenme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme</li>
          <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</li>
          <li>Eksik veya yanlış işlenmiş olması halinde düzeltilmesini isteme</li>
          <li>KVKK'nın 7. maddesi kapsamında silinmesini veya yok edilmesini isteme</li>
          <li>İşlenen verilerin münhasıran otomatik sistemler aracılığıyla analiz edilmesi
            suretiyle aleyhine bir sonuç ortaya çıkmasına itiraz etme</li>
        </ul>

        <h2>6. Başvuru yöntemi</h2>
        <p>
          Yukarıda belirtilen haklarınızı kullanmak için destek@sanda.com.tr adresine
          yazılı başvuruda bulunabilirsiniz. Başvurular en geç 30 gün içinde yanıtlanır.
        </p>
      </div>
    </div>
  );
}
