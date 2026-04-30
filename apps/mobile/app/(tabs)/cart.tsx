import { formatTry, kurus } from '@sanda/core';
import { Link } from 'expo-router';
import {
  ArrowRight,
  Lock,
  ShieldCheck,
  ShoppingBasket,
  Trash2,
  TriangleAlert,
} from 'lucide-react-native';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { trpc } from '../../src/lib/trpc';

export default function CartTab() {
  const utils = trpc.useUtils();
  const cart = trpc.cart.get.useQuery(undefined, { retry: false });
  const remove = trpc.cart.removeItem.useMutation({
    onSuccess: () => utils.cart.get.invalidate(),
  });

  if (cart.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }

  if (cart.error) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-leaf-100">
            <Lock size={20} color="#1f4f0f" />
          </View>
          <Text className="mt-4 font-display text-2xl text-foreground">Önce giriş yap</Text>
          <Text className="mt-2 text-center leading-6 text-muted-foreground">
            Sepetin hesabına bağlıdır; her cihazdan açabilesin diye giriş gerekiyor.
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

  const items = cart.data?.items ?? [];

  if (items.length === 0) {
    return (
      <SafeAreaView edges={['top']} className="flex-1 bg-background">
        <View className="flex-1 items-center justify-center px-8">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-leaf-50">
            <ShoppingBasket size={24} color="#3a7725" />
          </View>
          <Text className="mt-4 font-display text-2xl text-foreground">Sepetin boş</Text>
          <Text className="mt-2 text-center leading-6 text-muted-foreground">
            Keşfet sayfasından beğendiğin üreticinin ürünlerini ekleyebilirsin.
          </Text>
          <Link href={{ pathname: '/(tabs)/search' }} asChild>
            <Pressable className="mt-6 rounded-xl bg-leaf-700 px-5 py-3">
              <Text className="font-semibold text-white">Ürünleri keşfet</Text>
            </Pressable>
          </Link>
        </View>
      </SafeAreaView>
    );
  }

  const bySeller = groupBy(items, (i) => i.product.sellerId);
  const subtotal = items.reduce((s, i) => s + i.priceSnapshotKurus * Number(i.quantity), 0);
  const sellerCount = Object.keys(bySeller).length;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4 pt-2" contentContainerStyle={{ paddingBottom: 140 }}>
        <Text className="mb-3 font-display text-2xl text-foreground">Sepet</Text>

        {sellerCount > 1 ? (
          <View className="mb-3 flex-row items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3">
            <TriangleAlert size={14} color="#a05a1f" />
            <Text className="flex-1 text-xs text-amber-900">
              {sellerCount} farklı üreticiden ürün var; her biri için ayrı sipariş ve ayrı kargo
              oluşur.
            </Text>
          </View>
        ) : null}

        {Object.entries(bySeller).map(([sellerId, sellerItems]) => (
          <View
            key={sellerId}
            className="mb-3 overflow-hidden rounded-2xl border border-border bg-card"
          >
            <View className="border-b border-border/60 px-4 py-3">
              <Link href={`/seller/${sellerItems[0]!.product.seller.slug}`} asChild>
                <Pressable>
                  <Text className="font-display text-base text-foreground">
                    {sellerItems[0]!.product.seller.displayName}
                  </Text>
                  <Text className="text-[11px] text-muted-foreground">Ayrı sipariş olarak işlenir</Text>
                </Pressable>
              </Link>
            </View>
            {sellerItems.map((item) => (
              <View
                key={item.id}
                className="flex-row items-center gap-3 border-b border-border/40 px-4 py-3 last:border-0"
              >
                <View className="h-14 w-14 overflow-hidden rounded-xl bg-leaf-50" />
                <View className="flex-1">
                  <Text numberOfLines={1} className="text-sm font-medium text-foreground">
                    {item.product.nameTr}
                  </Text>
                  <Text className="mt-0.5 text-[11px] text-muted-foreground">
                    {item.variant.nameTr} × {Number(item.quantity)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="font-semibold text-foreground">
                    {formatTry(kurus(Math.round(item.priceSnapshotKurus * Number(item.quantity))))}
                  </Text>
                  <Pressable
                    onPress={() =>
                      Alert.alert('Sepetten çıkar', 'Bu ürünü kaldırmak istediğine emin misin?', [
                        { text: 'Vazgeç', style: 'cancel' },
                        {
                          text: 'Sil',
                          style: 'destructive',
                          onPress: () => remove.mutate({ cartItemId: item.id }),
                        },
                      ])
                    }
                    className="mt-1 flex-row items-center gap-1"
                  >
                    <Trash2 size={11} color="#737373" />
                    <Text className="text-[11px] text-muted-foreground">Çıkar</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        ))}

        <View className="mt-4 rounded-2xl border border-leaf-200 bg-leaf-50 p-4">
          <View className="flex-row items-center gap-2">
            <ShieldCheck size={14} color="#1f4f0f" />
            <Text className="text-xs font-semibold text-leaf-700">
              Pazaryeri ödemesi · iyzico hakediş
            </Text>
          </View>
          <Text className="mt-1.5 text-[11px] leading-5 text-leaf-800">
            Ödeme lisanslı PSP iyzico üzerinden alınır. Hakediş, teslimat onayı ve iade penceresi
            sonrası satıcıya aktarılır. Sanda parayı tutmaz.
          </Text>
        </View>
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-card px-4 pb-6 pt-3">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs text-muted-foreground">Toplam</Text>
            <Text className="font-display text-xl text-foreground">
              {formatTry(kurus(subtotal))}
            </Text>
          </View>
          <Pressable className="flex-row items-center gap-2 rounded-xl bg-leaf-700 px-5 py-3">
            <Text className="font-semibold text-white">Ödemeye geç</Text>
            <ArrowRight size={16} color="#ffffff" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item);
    acc[k] = acc[k] ? [...acc[k]!, item] : [item];
    return acc;
  }, {});
}
