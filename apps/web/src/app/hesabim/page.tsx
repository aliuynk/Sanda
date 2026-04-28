import {
  Avatar,
  Badge,
  buttonVariants,
  Card,
  CardContent,
  cn,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@sanda/ui-web';
import {
  Bell,
  CreditCard,
  MapPin,
  Package,
  Settings,
  ShieldCheck,
  User,
} from 'lucide-react';
import type { Metadata } from 'next';
import type { Route } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Hesabım',
  description: 'Profil bilgilerin, adresler ve bildirim tercihlerin.',
};

export default function AccountPage() {
  // TODO: Fetch from trpc.auth.me() in server component
  const account = {
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    phone: '+90 532 XXX XX XX',
    email: 'ahmet@example.com',
    avatarUrl: null,
    roles: ['BUYER'],
    memberSince: '2024',
  };

  const addresses = [
    {
      id: '1',
      label: 'Ev',
      recipient: 'Ahmet Yılmaz',
      line1: 'Atatürk Mah. Cumhuriyet Cad. No:42/5',
      district: 'Çankaya',
      province: 'Ankara',
      isDefault: true,
    },
    {
      id: '2',
      label: 'İş',
      recipient: 'Ahmet Yılmaz',
      line1: 'Kızılay İş Merkezi A Blok Kat:3',
      district: 'Çankaya',
      province: 'Ankara',
      isDefault: false,
    },
  ];

  return (
    <div className="container max-w-4xl py-10 md:py-14">
      {/* Profile header */}
      <div className="mb-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
        <Avatar
          size="xl"
          src={account.avatarUrl}
          alt={`${account.firstName} ${account.lastName}`}
        />
        <div className="flex-1">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {account.firstName} {account.lastName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{account.phone}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge tone="outline" className="rounded-lg">
              <User className="h-3 w-3" /> Alıcı
            </Badge>
            <Badge tone="outline" className="rounded-lg text-xs">
              {account.memberSince}'den beri üye
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={'/siparislerim' as Route}
            className={cn(buttonVariants({ variant: 'outline' }), 'rounded-xl gap-2')}
          >
            <Package className="h-4 w-4" />
            Siparişlerim
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="addresses">
            <MapPin className="h-4 w-4" />
            Adresler
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4" />
            Bildirimler
          </TabsTrigger>
          <TabsTrigger value="security">
            <ShieldCheck className="h-4 w-4" />
            Güvenlik
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="border-border/70 shadow-sm">
            <CardContent className="p-6">
              <h2 className="font-display text-xl font-semibold">Profil bilgileri</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Kişisel bilgilerini güncelle. Bu bilgiler sadece sipariş ve iletişim amaçlı kullanılır.
              </p>
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <ProfileField label="Ad" value={account.firstName} />
                <ProfileField label="Soyad" value={account.lastName} />
                <ProfileField label="Telefon" value={account.phone} verified />
                <ProfileField label="E-posta" value={account.email ?? 'Eklenmedi'} />
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  className={cn(buttonVariants(), 'rounded-xl')}
                >
                  Değişiklikleri kaydet
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses">
          <div className="grid gap-4 sm:grid-cols-2">
            {addresses.map((addr) => (
              <Card key={addr.id} className="border-border/70 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-display font-semibold">{addr.label}</span>
                    </div>
                    {addr.isDefault && (
                      <Badge tone="info" className="rounded-md text-[10px]">Varsayılan</Badge>
                    )}
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <p>{addr.recipient}</p>
                    <p>{addr.line1}</p>
                    <p>{addr.district} / {addr.province}</p>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button type="button" className="text-xs font-medium text-primary hover:underline">
                      Düzenle
                    </button>
                    <button type="button" className="text-xs font-medium text-muted-foreground hover:text-destructive">
                      Sil
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <button
              type="button"
              className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border/80 p-8 text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
            >
              <MapPin className="h-6 w-6" />
              <span className="text-sm font-medium">Yeni adres ekle</span>
            </button>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="border-border/70 shadow-sm">
            <CardContent className="p-6">
              <h2 className="font-display text-xl font-semibold">Bildirim tercihleri</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Hangi olaylar için bildirim almak istediğini ayarla.
              </p>
              <div className="mt-6 space-y-4">
                {[
                  { label: 'Sipariş güncellemeleri', desc: 'Sipariş durumu değişikliklerinde bildirim al.', default: true },
                  { label: 'Kargo takibi', desc: 'Kargo hareketi olduğunda SMS al.', default: true },
                  { label: 'Kampanya ve fırsatlar', desc: 'Üreticilerden özel teklifler ve sezonluk fırsatlar.', default: false },
                  { label: 'Üretici haberleri', desc: 'Takip ettiğin üreticilerin yeni ürün ve haberleri.', default: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-xl border border-border/60 p-4">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" defaultChecked={item.default} className="peer sr-only" />
                      <div className="peer h-5 w-9 rounded-full bg-muted transition-colors after:absolute after:left-[2px] after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="border-border/70 shadow-sm">
            <CardContent className="p-6">
              <h2 className="font-display text-xl font-semibold">Güvenlik</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Hesap güvenliğini yönet. Oturumlar ve iki faktörlü doğrulama ayarları.
              </p>
              <div className="mt-6 space-y-4">
                <Card className="border-border/60">
                  <CardContent className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                      </span>
                      <div>
                        <p className="font-medium">İki faktörlü doğrulama</p>
                        <p className="text-xs text-muted-foreground">Hesabına ek güvenlik katmanı ekle.</p>
                      </div>
                    </div>
                    <Badge tone="neutral" className="rounded-md">Kapalı</Badge>
                  </CardContent>
                </Card>
                <Card className="border-border/60">
                  <CardContent className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                        <Settings className="h-5 w-5 text-muted-foreground" />
                      </span>
                      <div>
                        <p className="font-medium">Aktif oturumlar</p>
                        <p className="text-xs text-muted-foreground">Açık olan tüm oturumlarını görüntüle ve yönet.</p>
                      </div>
                    </div>
                    <button type="button" className="text-xs font-semibold text-primary hover:underline">
                      Görüntüle
                    </button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProfileField({
  label,
  value,
  verified,
}: {
  label: string;
  value: string;
  verified?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium">{value}</p>
        {verified && (
          <Badge tone="success" className="rounded-md text-[10px]">
            <ShieldCheck className="h-2.5 w-2.5" /> Doğrulanmış
          </Badge>
        )}
      </div>
    </div>
  );
}
