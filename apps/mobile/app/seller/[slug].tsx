import { formatTry, kurus } from '@sanda/core';
import { Image } from 'expo-image';
import { Link, useLocalSearchParams } from 'expo-router';
import {
  Calendar,
  Leaf,
  MapPin,
  ShieldCheck,
  Sprout,
  Star,
  Truck,
} from 'lucide-react-native';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { trpc } from '../../src/lib/trpc';

export default function SellerScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const q = trpc.sellers.bySlug.useQuery({ slug: slug ?? '' }, { enabled: !!slug });

  if (q.isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator />
      </View>
    );
  }
  if (!q.data) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-8">
        <Text className="text-muted-foreground">Üretici bulunamadı.</Text>
      </View>
    );
  }

  const s = q.data;

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-background">
      <ScrollView className="flex-1">
        <View className="h-32 bg-leaf-200" />
        <View className="-mt-10 px-5">
          <View className="rounded-2xl border border-border bg-card p-5">
            <View className="flex-row items-center gap-3">
              <View className="h-14 w-14 items-center justify-center rounded-2xl bg-leaf-100">
                <Sprout size={26} color="#1f4f0f" />
              </View>
              <View className="flex-1">
                <Text className="font-display text-2xl text-foreground">{s.displayName}</Text>
                {s.tagline ? (
                  <Text numberOfLines={2} className="mt-0.5 text-xs text-muted-foreground">
                    {s.tagline}
                  </Text>
                ) : null}
              </View>
            </View>
            <View className="mt-4 flex-row flex-wrap gap-2">
              <Stat icon={<Star size={11} color="#a05a1f" />} label={`${Number(s.ratingAverage).toFixed(2)} puan`} />
              <Stat label={`${s.productCount} ürün`} />
              {s.farmName ? <Stat icon={<MapPin size={11} color="#6b5837" />} label={s.farmName} /> : null}
              {s.foundedYear ? (
                <Stat icon={<Calendar size={11} color="#6b5837" />} label={String(s.foundedYear)} />
              ) : null}
              {s.allowsFarmVisits ? (
                <Stat tone="success" label="Ziyarete açık" />
              ) : null}
            </View>
          </View>

          {s.story ? (
            <View className="mt-6">
              <Text className="font-display text-lg text-foreground">Hikâye</Text>
              <Text className="mt-2 leading-6 text-muted-foreground">{s.story}</Text>
            </View>
          ) : null}

          {s.certifications.length > 0 ? (
            <View className="mt-6">
              <Text className="font-display text-lg text-foreground">Sertifikalar</Text>
              <View className="mt-3 gap-2">
                {s.certifications.map((c) => (
                  <View
                    key={c.id}
                    className="flex-row items-center gap-3 rounded-2xl border border-border bg-card p-3"
                  >
                    <ShieldCheck size={16} color="#1f4f0f" />
                    <Text className="flex-1 text-sm text-foreground">
                      {c.type.replaceAll('_', ' ')} · {c.issuer}
                    </Text>
                    <View className="rounded-md bg-leaf-100 px-2 py-0.5">
                      <Text className="text-[10px] font-semibold text-leaf-700">Doğrulanmış</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {s.serviceAreas.length > 0 ? (
            <View className="mt-6">
              <Text className="font-display text-lg text-foreground">Hizmet alanları</Text>
              <View className="mt-3 gap-2">
                {s.serviceAreas.map((a) => (
                  <View key={a.id} className="rounded-2xl border border-border bg-card p-3">
                    <View className="flex-row items-center gap-2">
                      <Truck size={14} color="#3a7725" />
                      <Text className="flex-1 text-sm font-medium text-foreground">{a.name}</Text>
                      {a.shippingFee > 0 ? (
                        <Text className="text-sm font-semibold text-foreground">
                          {formatTry(kurus(a.shippingFee))}
                        </Text>
                      ) : (
                        <Text className="text-xs font-semibold text-leaf-700">Ücretsiz</Text>
                      )}
                    </View>
                    <Text className="mt-1 text-[11px] text-muted-foreground">
                      {a.mode.replaceAll('_', ' ')}
                      {a.provinceCodes.length > 0 ? ` · ${a.provinceCodes.length} il` : ''}
                      {a.etaMinDays != null && a.etaMaxDays != null
                        ? ` · ${a.etaMinDays}–${a.etaMaxDays} gün`
                        : ''}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {s.products.length > 0 ? (
            <View className="mt-6">
              <Text className="font-display text-lg text-foreground">Ürünler</Text>
              <View className="mt-3 flex-row flex-wrap">
                {s.products.map((p) => (
                  <Link key={p.id} href={`/product/${p.slug}`} asChild>
                    <Pressable className="w-1/2 p-1.5">
                      <View className="overflow-hidden rounded-2xl border border-border bg-card">
                        {p.media[0] ? (
                          <Image
                            source={{ uri: p.media[0].url }}
                            style={{ width: '100%', aspectRatio: 1 }}
                            contentFit="cover"
                          />
                        ) : (
                          <View className="aspect-square w-full items-center justify-center bg-leaf-50">
                            <Leaf size={28} color="#9ca3af" />
                          </View>
                        )}
                        <View className="p-3">
                          <Text numberOfLines={2} className="text-sm font-medium text-foreground">
                            {p.nameTr}
                          </Text>
                          {p.variants[0] ? (
                            <Text className="mt-1 font-semibold text-foreground">
                              {formatTry(kurus(p.variants[0].priceKurus))}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    </Pressable>
                  </Link>
                ))}
              </View>
            </View>
          ) : null}

          <View className="mb-10" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({
  icon,
  label,
  tone = 'neutral',
}: {
  icon?: React.ReactNode;
  label: string;
  tone?: 'neutral' | 'success';
}) {
  const bg = tone === 'success' ? 'bg-leaf-100' : 'bg-muted';
  const text = tone === 'success' ? 'text-leaf-700' : 'text-foreground';
  return (
    <View className={`flex-row items-center gap-1 rounded-full ${bg} px-2 py-0.5`}>
      {icon}
      <Text className={`text-[11px] font-semibold ${text}`}>{label}</Text>
    </View>
  );
}
