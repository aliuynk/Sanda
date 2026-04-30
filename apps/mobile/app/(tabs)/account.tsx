import { Link } from 'expo-router';
import {
  ArrowRight,
  Bell,
  ChevronRight,
  HelpCircle,
  KeyRound,
  Lock,
  LogIn,
  MapPin,
  Package,
  Settings,
  ShieldCheck,
  Sparkles,
  Sprout,
  Store,
  Truck,
  User,
} from 'lucide-react-native';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSellerMode } from '../../src/features/role/use-seller-mode';
import { trpc } from '../../src/lib/trpc';

export default function AccountTab() {
  const { isSellerMode, setIsSellerMode } = useSellerMode();
  const me = trpc.auth.me.useQuery(undefined, { retry: false });

  if (me.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (me.error) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-leaf-100">
            <LogIn size={20} color="#1f4f0f" />
          </View>
          <Text className="mt-4 font-display text-2xl text-foreground">Giriş yapmamışsın</Text>
          <Text className="mt-2 text-center leading-6 text-muted-foreground">
            Siparişlerini, adreslerini ve bildirim tercihlerini yönetmek için giriş yap.
          </Text>
          <Link href={{ pathname: '/auth' }} asChild>
            <Pressable className="mt-6 flex-row items-center gap-2 rounded-xl bg-leaf-700 px-5 py-3">
              <Text className="font-semibold text-white">Giriş yap</Text>
              <ArrowRight size={16} color="#ffffff" />
            </Pressable>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  const account = me.data!;
  const profile = account.profile;
  const fullName = profile?.displayName || `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim();
  const isSeller = Boolean(account.sellerProfile);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-5 pt-4">
          <View className="overflow-hidden rounded-3xl border border-leaf-200/60 bg-leaf-50 p-5">
            <View className="flex-row items-center gap-4">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white">
                <User size={24} color="#1f4f0f" />
              </View>
              <View className="flex-1">
                <Text className="font-display text-xl text-foreground">
                  {fullName || account.phone || 'Hesabım'}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {account.phone ?? account.email}
                </Text>
                <View className="mt-2 flex-row gap-2">
                  {account.roles.map((r) => (
                    <View key={r} className="rounded-full bg-leaf-200 px-2 py-0.5">
                      <Text className="text-[10px] font-semibold text-leaf-700">{r}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {isSeller ? (
            <View className="mt-4 flex-row items-center gap-3 rounded-2xl border border-border bg-card p-4">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-leaf-100">
                <Sprout size={18} color="#1f4f0f" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-foreground">Üretici modu</Text>
                <Text className="text-[11px] text-muted-foreground">
                  Siparişlerini ve ürünlerini buradan yönet.
                </Text>
              </View>
              <Switch
                value={isSellerMode}
                onValueChange={setIsSellerMode}
                trackColor={{ false: '#d4d4d4', true: '#3a7725' }}
                thumbColor={'#ffffff'}
              />
            </View>
          ) : (
            <Pressable className="mt-4 flex-row items-center gap-3 rounded-2xl border border-leaf-200/60 bg-leaf-50 p-4">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-leaf-100">
                <Store size={18} color="#1f4f0f" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-foreground">Üretici ol</Text>
                <Text className="text-[11px] text-muted-foreground">
                  Kayıtlı satıcı, kooperatif veya çiftçi olarak başvur.
                </Text>
              </View>
              <ChevronRight size={16} color="#737373" />
            </Pressable>
          )}
        </View>

        <View className="mt-6 px-5">
          <Text className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Alışveriş
          </Text>
          <View className="overflow-hidden rounded-2xl border border-border bg-card">
            <Row icon={<Package size={16} color="#3a7725" />} label="Siparişlerim" sublabel="Aktif ve geçmiş" />
            <Row icon={<MapPin size={16} color="#3a7725" />} label="Adreslerim" sublabel="Teslimat adreslerini yönet" />
            <Row icon={<Sparkles size={16} color="#3a7725" />} label="Favori üreticiler" sublabel="Takip ettiklerin" last />
          </View>
        </View>

        <View className="mt-5 px-5">
          <Text className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Hesap
          </Text>
          <View className="overflow-hidden rounded-2xl border border-border bg-card">
            <Row icon={<User size={16} color="#3a7725" />} label="Profil bilgileri" />
            <Row icon={<Bell size={16} color="#3a7725" />} label="Bildirimler" />
            <Row icon={<ShieldCheck size={16} color="#3a7725" />} label="Güvenlik" sublabel="2FA, oturumlar" />
            <Row icon={<KeyRound size={16} color="#3a7725" />} label="Gizlilik" sublabel="KVKK ve veri haklarım" last />
          </View>
        </View>

        <View className="mt-5 px-5">
          <Text className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Destek
          </Text>
          <View className="overflow-hidden rounded-2xl border border-border bg-card">
            <Row icon={<HelpCircle size={16} color="#3a7725" />} label="Yardım merkezi" />
            <Row icon={<Truck size={16} color="#3a7725" />} label="Kargo ve iade" />
            <Row icon={<Settings size={16} color="#3a7725" />} label="Uygulama ayarları" last />
          </View>
        </View>

        <View className="mx-5 mt-6 rounded-2xl border border-border bg-card p-4">
          <View className="flex-row items-center gap-2">
            <Lock size={12} color="#1f4f0f" />
            <Text className="text-[11px] font-semibold text-leaf-700">Gizlilik açıklaması</Text>
          </View>
          <Text className="mt-1.5 text-[11px] leading-5 text-muted-foreground">
            Hassas veriler (TC Kimlik, IBAN) uygulama katmanında envelope-encrypted saklanır. PSP
            (iyzico) ödeme akışını yönetir; Sanda parayı tutmaz.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({
  icon,
  label,
  sublabel,
  last,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  last?: boolean;
}) {
  return (
    <Pressable
      className={`flex-row items-center gap-3 px-4 py-3.5 ${last ? '' : 'border-b border-border/40'}`}
    >
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-leaf-50">{icon}</View>
      <View className="flex-1">
        <Text className="text-sm font-medium text-foreground">{label}</Text>
        {sublabel ? (
          <Text className="text-[11px] text-muted-foreground">{sublabel}</Text>
        ) : null}
      </View>
      <ChevronRight size={14} color="#737373" />
    </Pressable>
  );
}
