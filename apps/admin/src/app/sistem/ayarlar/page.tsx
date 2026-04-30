import { Badge, Card, CardContent } from '@sanda/ui-web';
import { Coins, CreditCard, Globe2, Lock } from 'lucide-react';

export const metadata = {
  title: 'Platform ayarları',
};

const groups = [
  {
    title: 'Komisyon ve hakediş',
    icon: Coins,
    items: [
      {
        label: 'Platform komisyonu',
        value: 'PLATFORM_COMMISSION_BPS',
        hint: 'Ürün ara toplamı üzerinden bps; kargo dahil değildir.',
      },
      {
        label: 'iyzico submerchant',
        value: 'IYZICO_API_KEY · IYZICO_SECRET_KEY',
        hint: 'TCMB lisanslı elektronik para kuruluşu; submerchant id satıcı bazında saklanır.',
      },
      {
        label: 'Hakediş süreleri',
        value: 'PSP iade penceresi sonunda otomatik aktarım',
        hint: 'Teslimat onayı + iade penceresi; teslim sonrası gün sayısı yapılandırılabilir.',
      },
    ],
  },
  {
    title: 'Vergisel akış',
    icon: CreditCard,
    items: [
      {
        label: 'e-fatura / e-arşiv',
        value: 'Satıcı adına otomatik düzenleme',
        hint: 'Sanda parayı tutmaz; vergisel sorumluluk satıcıdadır, biz e-belge üretimini ve raporlamayı otomatikleştiririz.',
      },
      {
        label: 'Müstahsil makbuzu (çiftçi)',
        value: 'Bireysel çiftçi akışı',
        hint: 'INDIVIDUAL_FARMER türünde fatura yerine müstahsil makbuzu üretilir.',
      },
      {
        label: '2025 e-ticaret tevkifat raporu',
        value: 'Aylık otomatik PDF',
        hint: 'Satıcıya ön muhasebe panelinde sunulur.',
      },
    ],
  },
  {
    title: 'Güvenlik',
    icon: Lock,
    items: [
      {
        label: 'Admin oturumu',
        value: 'sanda_admin_session · 15dk · refresh 30g',
        hint: 'Web ve admin için ayrı audience; cookie isimleri farklı.',
      },
      {
        label: 'KMS',
        value: 'TC Kimlik / IBAN — envelope encryption',
        hint: 'Uygulama katmanında DEK; KMS-wrapped. Logda redact listesi (@sanda/core/logger) aktif.',
      },
      {
        label: '2FA',
        value: 'Operatörler için zorunluluk planlı',
        hint: 'TOTP destek seçeneği eklenecek.',
      },
    ],
  },
  {
    title: 'Yerel ekosistem',
    icon: Globe2,
    items: [
      {
        label: 'Diller',
        value: 'tr-TR (varsayılan), en-US',
        hint: '@sanda/i18n dotted-key sözlükleri.',
      },
      {
        label: 'Para birimi',
        value: 'TRY (kuruş, integer)',
        hint: 'FX yok; tüm kayıtlar TRY üzerinden ilerler.',
      },
      {
        label: 'Kargo entegrasyonları',
        value: 'Yurtiçi · MNG · Aras · PTT · Sürat · HepsiJet · Sendeo · Kolay Gelsin',
        hint: 'services/worker/src/providers/shipping/* altında.',
      },
    ],
  },
] as const;

export default function PlatformSettingsPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Sistem
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Platform ayarları
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Komisyon, ödeme kuruluşu, vergisel akış ve güvenlik politikalarının üst düzey görünümü.
          Değişiklikler şu an env üzerinden; UI yönetimi roadmap&apos;e alındı.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        {groups.map((group) => {
          const Icon = group.icon;
          return (
            <Card key={group.title} className="border-border/70 bg-card/70 shadow-sm">
              <CardContent className="p-0">
                <header className="flex items-center gap-3 border-b border-border/60 px-5 py-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
                    <Icon className="h-4 w-4 text-primary" />
                  </span>
                  <h2 className="font-display text-base font-semibold">{group.title}</h2>
                </header>
                <ul className="divide-y divide-border/50">
                  {group.items.map((item) => (
                    <li key={item.label} className="px-5 py-3.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium">{item.label}</p>
                        <Badge tone="outline" className="rounded-md font-mono text-[10px]">
                          {item.value}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
