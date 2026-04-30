import { Link } from 'expo-router';
import { MapPin, Star } from 'lucide-react-native';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { trpc } from '../../lib/trpc';

export function ProducersRow() {
  const q = trpc.sellers.list.useQuery({ limit: 8 });

  return (
    <View className="mt-7">
      <View className="mb-3 flex-row items-end justify-between px-4">
        <View>
          <Text className="font-display text-xl text-foreground">Öne çıkan üreticiler</Text>
          <Text className="text-xs text-muted-foreground">Onaylı, hikâyeli, doğrulanmış.</Text>
        </View>
      </View>
      {q.isLoading ? (
        <View className="px-4 py-6">
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 4, gap: 12 }}
        >
          {(q.data?.items ?? []).map((s) => (
            <Link key={s.id} href={`/seller/${s.slug}`} asChild>
              <Pressable className="w-56 overflow-hidden rounded-2xl border border-border bg-card">
                <View className="h-28 bg-leaf-100" />
                <View className="px-4 py-3">
                  <Text numberOfLines={1} className="font-display text-base text-foreground">
                    {s.displayName}
                  </Text>
                  {s.tagline ? (
                    <Text numberOfLines={2} className="mt-0.5 text-xs text-muted-foreground">
                      {s.tagline}
                    </Text>
                  ) : null}
                  <View className="mt-3 flex-row items-center gap-3">
                    <View className="flex-row items-center gap-1">
                      <Star size={11} color="#a05a1f" fill="#a05a1f" />
                      <Text className="text-[11px] font-semibold text-foreground">
                        {Number(s.ratingAverage).toFixed(2)}
                      </Text>
                    </View>
                    {s.farmName ? (
                      <View className="flex-row items-center gap-1">
                        <MapPin size={11} color="#6b5837" />
                        <Text numberOfLines={1} className="max-w-[100px] text-[11px] text-muted-foreground">
                          {s.farmName}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </Pressable>
            </Link>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
