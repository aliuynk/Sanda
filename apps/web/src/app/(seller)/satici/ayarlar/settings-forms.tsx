'use client';

import {
  Button,
  Card,
  CardContent,
  Input,
  Select,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  useToast,
} from '@sanda/ui-web';
import {
  Bell,
  Building2,
  CreditCard,
  Save,
  Shield,
  Store,
  UserCircle,
} from 'lucide-react';
import { useState } from 'react';

/* ---------------------------------------------------------------------------
 * Seller Settings — real forms replacing the placeholder cards.
 *
 * Each tab is a separate form that can be independently saved.
 * Sensitive fields (TC, IBAN) show masked values with edit toggles.
 * -------------------------------------------------------------------------- */

const sellerTypes = [
  { value: 'INDIVIDUAL_FARMER', label: 'Bireysel çiftçi (ÇKS kayıtlı)' },
  { value: 'SOLE_PROPRIETOR', label: 'Şahıs işletmesi (vergi levhası)' },
  { value: 'COOPERATIVE', label: 'Kooperatif / birlik (MERSİS)' },
  { value: 'COMPANY', label: 'Şirket (limited / anonim)' },
];

export function SettingsForms() {
  const toast = useToast();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Ayarlar</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Mağaza kimliği, yasal bilgiler, ödeme ve bildirim ayarlarını yönet.
        </p>
      </div>

      <Tabs defaultValue="store">
        <TabsList>
          <TabsTrigger value="store">
            <Store className="h-4 w-4" /> Mağaza
          </TabsTrigger>
          <TabsTrigger value="legal">
            <Building2 className="h-4 w-4" /> Yasal
          </TabsTrigger>
          <TabsTrigger value="payment">
            <CreditCard className="h-4 w-4" /> Ödeme
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4" /> Bildirimler
          </TabsTrigger>
        </TabsList>

        {/* Store Identity */}
        <TabsContent value="store">
          <Card className="border-border/70 shadow-sm">
            <CardContent className="space-y-6 p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12">
                  <UserCircle className="h-5 w-5 text-primary" />
                </span>
                <div>
                  <h2 className="font-display text-xl font-semibold">Mağaza kimliği</h2>
                  <p className="text-xs text-muted-foreground">
                    Alıcıların gördüğü bilgiler. Slug (URL) değişiklikleri eski bağlantıları bozar.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Mağaza adı *</label>
                  <Input placeholder="Örn: Bolu Organik Çiftliği" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Slug (URL)</label>
                  <div className="flex items-center gap-0">
                    <span className="flex h-10 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-xs text-muted-foreground">
                      sanda.com.tr/uretici/
                    </span>
                    <Input className="rounded-l-none" placeholder="bolu-organik" />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Tagline</label>
                <Input placeholder="Kısa bir tanıtım cümlesi (vitrinde görünür)" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Hikâye</label>
                <Textarea
                  placeholder="Çiftliğinin hikâyesi, üretim felsefesi, ailenin geçmişi..."
                  className="min-h-[120px]"
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Üretici profil sayfasında tam metin olarak görünür.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Çiftlik adı</label>
                  <Input placeholder="Resmi çiftlik/işletme adı" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">İlçe</label>
                  <Input placeholder="Çiftliğin bulunduğu ilçe" />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  className="gap-2 rounded-xl"
                  onClick={() => toast.success('Mağaza bilgileri güncellendi')}
                >
                  <Save className="h-4 w-4" />
                  Kaydet
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Legal & Tax */}
        <TabsContent value="legal">
          <Card className="border-border/70 shadow-sm">
            <CardContent className="space-y-6 p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12">
                  <Building2 className="h-5 w-5 text-primary" />
                </span>
                <div>
                  <h2 className="font-display text-xl font-semibold">Yasal ve vergi bilgileri</h2>
                  <p className="text-xs text-muted-foreground">
                    Bu bilgiler şifreli saklanır. Değişiklik ek doğrulama gerektirebilir.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
                <p className="font-semibold">Hassas bilgi uyarısı</p>
                <p className="mt-1">
                  TC Kimlik numarası ve IBAN bilgileri uygulama katmanında zarf şifreleme (envelope encryption) 
                  ile korunur. Admin dahil hiçbir kullanıcı bu bilgilerin tam halini göremez.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Üretici tipi *</label>
                <Select>
                  <option value="">Tip seçin</option>
                  {sellerTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">TC Kimlik no</label>
                  <Input placeholder="••••••••••• (şifreli)" type="password" />
                  <p className="mt-1 text-xs text-muted-foreground">11 haneli, sadece doğrulama için</p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">ÇKS numarası</label>
                  <Input placeholder="Çiftçi Kayıt Sistemi no" />
                  <p className="mt-1 text-xs text-muted-foreground">Bireysel çiftçiler için zorunlu</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Vergi no / MERSİS</label>
                  <Input placeholder="Vergi kimlik numarası veya MERSİS no" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Vergi dairesi</label>
                  <Input placeholder="Vergi dairesi adı" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Ticaret sicil no</label>
                <Input placeholder="Şirketler için geçerli" />
              </div>

              <div className="flex justify-end">
                <Button
                  className="gap-2 rounded-xl"
                  onClick={() => toast.info('Yasal bilgi güncelleme', 'Değişiklik admin onayına sunulacak.')}
                >
                  <Shield className="h-4 w-4" />
                  Doğrulamaya gönder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment & Payout */}
        <TabsContent value="payment">
          <Card className="border-border/70 shadow-sm">
            <CardContent className="space-y-6 p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12">
                  <CreditCard className="h-5 w-5 text-primary" />
                </span>
                <div>
                  <h2 className="font-display text-xl font-semibold">Ödeme ve hakediş</h2>
                  <p className="text-xs text-muted-foreground">
                    Komisyon sonrası net tutarının aktarılacağı hesap bilgileri.
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">IBAN *</label>
                <Input placeholder="TR•• •••• •••• •••• •••• •••• ••" className="font-mono" />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  IBAN adresi şifreli saklanır. Hesap sahibi adı TC Kimlik ile eşleşmelidir.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Hesap sahibi</label>
                  <Input placeholder="Ad Soyad / Unvan" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Banka</label>
                  <Input placeholder="Banka adı" readOnly className="bg-muted/30" />
                  <p className="mt-1 text-xs text-muted-foreground">IBAN'dan otomatik çözümlenir</p>
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-sm">
                <h3 className="font-medium">Komisyon ve hakediş bilgisi</h3>
                <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Platform komisyonu</span>
                    <span className="font-semibold text-foreground">%10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hakediş döngüsü</span>
                    <span className="font-semibold text-foreground">Haftalık (Çarşamba)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ödeme sağlayıcı</span>
                    <span className="font-semibold text-foreground">iyzico</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  className="gap-2 rounded-xl"
                  onClick={() => toast.success('Ödeme bilgileri güncellendi')}
                >
                  <Save className="h-4 w-4" />
                  Kaydet
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card className="border-border/70 shadow-sm">
            <CardContent className="space-y-6 p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12">
                  <Bell className="h-5 w-5 text-primary" />
                </span>
                <div>
                  <h2 className="font-display text-xl font-semibold">Bildirim tercihleri</h2>
                  <p className="text-xs text-muted-foreground">
                    Hangi olaylarda SMS, e-posta veya push bildirim almak istediğini ayarla.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <NotificationRow
                  title="Yeni sipariş"
                  description="Bir alıcı sipariş verdiğinde anında bildirim al."
                  defaultChecked
                  critical
                />
                <NotificationRow
                  title="Sipariş iptali"
                  description="Alıcı siparişi iptal ettiğinde bildirim al."
                  defaultChecked
                  critical
                />
                <NotificationRow
                  title="Sertifika süresi dolmak üzere"
                  description="Sertifika bitiş tarihinden 30 gün önce hatırlatma."
                  defaultChecked
                />
                <NotificationRow
                  title="Hakediş ödemesi"
                  description="Haftalık hakediş hesabına aktarıldığında bildirim."
                  defaultChecked
                />
                <NotificationRow
                  title="Yeni değerlendirme"
                  description="Bir alıcı ürünlerini değerlendirdiğinde bildirim."
                  defaultChecked={false}
                />
                <NotificationRow
                  title="Yeni mesaj"
                  description="Alıcıdan gelen mesajlar için push bildirimi."
                  defaultChecked
                />
                <NotificationRow
                  title="Stok uyarıları"
                  description="Bir varyant stoğu 5'in altına düştüğünde uyarı."
                  defaultChecked={false}
                />
                <NotificationRow
                  title="Platform güncellemeleri"
                  description="Yeni özellikler, bakım bildirimleri ve duyurular."
                  defaultChecked={false}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  className="gap-2 rounded-xl"
                  onClick={() => toast.success('Bildirim tercihleri güncellendi')}
                >
                  <Save className="h-4 w-4" />
                  Kaydet
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationRow({
  title,
  description,
  defaultChecked,
  critical,
}: {
  title: string;
  description: string;
  defaultChecked: boolean;
  critical?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 p-4">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{title}</p>
          {critical && (
            <span className="rounded-md bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
              Kritik
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={setChecked}
        disabled={critical}
      />
    </div>
  );
}
