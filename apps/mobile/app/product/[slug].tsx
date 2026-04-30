import { formatTry, kurus } from '@sanda/core';
import { Image } from 'expo-image';
import { Link, useLocalSearchParams } from 'expo-router';
import {
  CalendarDays,
  Leaf,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBasket,
  Truck,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { trpc } from '../../src/lib/trpc';

export default function ProductScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const query = trpc.catalog.bySlug.useQuery({ slug: slug ?? '' }, { enabled: !!slug });

  if (query.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }
  if (!query.data) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-8">
        <Leaf size={32} color="#9ca3af" />
        <Text className="mt-3 text-muted-foreground">Ürün bulunamadı.</Text>
      </View>
    );
  }

  const p = query.data;
  const defaultVariant = p.variants.find((v) => v.isDefault) ?? p.variants[0];

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 96 }}>
        {p.media[0] ? (
          <Image
            source={{ uri: p.media[0].url }}
            style={{ width: '100%', aspectRatio: 1 }}
            contentFit="cover"
          />
        ) : (
          <View className="aspect-square w-full items-center justify-center bg-leaf-50">
            <Leaf size={56} color="#9ca3af" />
          </View>
        )}

        <View className="px-5 py-5">
          <View className="flex-row flex-wrap gap-2">
            {p.productionMethod === 'CERTIFIED_ORGANIC' ? (
              <Pill tone="success" icon={<ShieldCheck size={11} color="#1f4f0f" />}>
                Organik sertifikalı
              </Pill>
            ) : null}
            {p.originProvinceCode ? (
              <Pill tone="neutral" icon={<MapPin size={11} color="#6b5837" />}>
                {p.originProvinceCode}
              </Pill>
            ) : null}
            {p.isSeasonal ? (
              <Pill tone="info" icon={<CalendarDays size={11} color="#0c4a6e" />}>
                Mevsiminde
              </Pill>
            ) : null}
          </View>

          <Text className="mt-3 font-display text-2xl leading-tight text-foreground">
            {p.nameTr}
          </Text>

          <Link href={`/seller/${p.seller.slug}`} asChild>
            <Pressable className="mt-3 flex-row items-center gap-2 self-start rounded-full border border-border bg-card px-3 py-1.5">
              <Text className="text-sm font-medium text-foreground">{p.seller.displayName}</Text>
              <Text className="text-xs text-muted-foreground">üretici profili →</Text>
            </Pressable>
          </Link>

          {defaultVariant ? (
            <View className="mt-5 rounded-2xl border border-border bg-card p-4">
              <Text className="font-display text-2xl font-semibold text-foreground">
                {formatTry(kurus(defaultVariant.priceKurus))}
              </Text>
              <Text className="mt-0.5 text-xs text-muted-foreground">{defaultVariant.nameTr}</Text>
            </View>
          ) : null}

          {p.harvestNotes ? (
            <Info icon={<CalendarDays size={14} color="#3a7725" />} text={`Hasat: ${p.harvestNotes}`} />
          ) : null}
          <Info
            icon={<Truck size={14} color="#3a7725" />}
            text={`Teslimat: ${p.seller.serviceAreas.length} bölge / yöntem`}
          />

          {p.description ? (
            <View className="mt-5">
              <Text className="font-display text-base text-foreground">Ürün detayı</Text>
              <Text className="mt-2 leading-6 text-muted-foreground">{p.description}</Text>
            </View>
          ) : null}

          {p.storageNotes ? (
            <View className="mt-5">
              <Text className="font-display text-base text-foreground">Saklama</Text>
              <Text className="mt-2 leading-6 text-muted-foreground">{p.storageNotes}</Text>
            </View>
          ) : null}

          {p.seller.certifications.length > 0 ? (
            <View className="mt-6">
              <Text className="font-display text-base text-foreground">Üreticinin sertifikaları</Text>
              <View className="mt-3 gap-2">
                {p.seller.certifications.map((c) => (
                  <View
                    key={c.id}
                    className="flex-row items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3"
                  >
                    <View className="flex-1 flex-row items-center gap-2">
                      <ShieldCheck size={14} color="#1f4f0f" />
                      <Text className="flex-1 text-sm text-foreground" numberOfLines={1}>
                        {c.type.replaceAll('_', ' ')} · {c.issuer}
                      </Text>
                    </View>
                    <View className="rounded-md bg-leaf-100 px-2 py-0.5">
                      <Text className="text-[10px] font-semibold text-leaf-700">Doğrulanmış</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      {defaultVariant ? (
        <BottomBuyBar
          unitPrice={defaultVariant.priceKurus}
          variantId={defaultVariant.id}
          productId={p.id}
          minOrderQty={Number(p.minOrderQty)}
          stepQty={Number(p.stepQty)}
        />
      ) : null}
    </SafeAreaView>
  );
}

function Info({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <View className="mt-3 flex-row items-center gap-2.5 rounded-2xl border border-border bg-card p-3">
      {icon}
      <Text className="flex-1 text-sm text-foreground">{text}</Text>
    </View>
  );
}

function Pill({
  children,
  icon,
  tone,
}: {
  children: React.ReactNode;
  icon: React.ReactNode;
  tone: 'success' | 'info' | 'neutral';
}) {
  const bg =
    tone === 'success' ? 'bg-leaf-100' : tone === 'info' ? 'bg-sky-100' : 'bg-card';
  const text =
    tone === 'success'
      ? 'text-leaf-700'
      : tone === 'info'
        ? 'text-sky-800'
        : 'text-foreground';
  return (
    <View className={`flex-row items-center gap-1 rounded-full ${bg} px-2 py-1`}>
      {icon}
      <Text className={`text-[11px] font-semibold ${text}`}>{children}</Text>
    </View>
  );
}

function BottomBuyBar({
  unitPrice,
  productId,
  variantId,
  minOrderQty,
  stepQty,
}: {
  unitPrice: number;
  productId: string;
  variantId: string;
  minOrderQty: number;
  stepQty: number;
}) {
  const [qty, setQty] = useState(Math.max(minOrderQty, stepQty));
  const utils = trpc.useUtils();
  const mutation = trpc.cart.addItem.useMutation({
    onSuccess: () => utils.cart.get.invalidate(),
  });

  const decrement = () => setQty((q) => Math.max(minOrderQty, +(q - stepQty).toFixed(3)));
  const increment = () => setQty((q) => +(q + stepQty).toFixed(3));

  return (
    <View className="absolute bottom-0 left-0 right-0 flex-row items-center gap-3 border-t border-border bg-card px-4 py-3">
      <View className="flex-row items-center overflow-hidden rounded-xl border border-border">
        <Pressable className="h-10 w-10 items-center justify-center" onPress={decrement}>
          <Minus size={16} color="#3a7725" />
        </Pressable>
        <Text className="min-w-[48px] text-center text-sm font-semibold text-foreground">
          {qty}
        </Text>
        <Pressable className="h-10 w-10 items-center justify-center" onPress={increment}>
          <Plus size={16} color="#3a7725" />
        </Pressable>
      </View>
      <Pressable
        disabled={mutation.isPending}
        onPress={() => mutation.mutate({ productId, variantId, quantity: qty })}
        className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-leaf-700 px-4 py-3"
      >
        <ShoppingBasket size={16} color="#ffffff" />
        <Text className="text-sm font-semibold text-white">
          Sepete ekle · {formatTry(kurus(Math.round(unitPrice * qty)))}
        </Text>
      </Pressable>
    </View>
  );
}
