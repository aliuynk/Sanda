import { Badge, Card, CardContent } from '@sanda/ui-web';
import { Bell, Building2, CreditCard, UserCircle } from 'lucide-react';

export default function SellerSettingsPage() {
  const sections = [
    {
      icon: UserCircle,
      title: 'Mağaza kimliği',
      body: 'Görünen ad, slug, tagline ve hikâye. Yasal tarafta değişiklikler ek doğrulama gerektirebilir.',
    },
    {
      icon: Building2,
      title: 'Yasal & vergi',
      body: 'ÇKS, MERSİS, IBAN ve KYC alanları şifreli saklanır. Güncelleme akışı yakında bu sekmede.',
    },
    {
      icon: CreditCard,
      title: 'Ödeme & payout',
      body: 'iyzico alt üye işyeri ref, komisyon oranı ve settlement döngüsü — operasyon paneli ile senkron.',
    },
    {
      icon: Bell,
      title: 'Bildirimler',
      body: 'SMS / e-posta / push tercihleri; kritik olaylar (yeni sipariş, sertifika sonu) için ayrı kanallar.',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Ayarlar</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Üretici hesabının omurgası. Form entegrasyonu tamamlanırken bu sayfa modülleri önizler.
        </p>
      </div>

      <div className="grid gap-4">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.title} className="border-border/70">
              <CardContent className="flex gap-4 p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <Icon className="h-5 w-5 text-primary" aria-hidden />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg font-semibold">{s.title}</h2>
                    <Badge tone="neutral" className="rounded-md text-[10px] uppercase tracking-wider">
                      Yakında
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
