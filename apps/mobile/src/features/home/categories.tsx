import { Link } from 'expo-router';
import type { LucideIcon } from 'lucide-react-native';
import { Apple, Carrot, Droplet, Leaf, Milk, Nut, Wheat } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { trpc } from '../../lib/trpc';

const ICONS: Record<string, LucideIcon> = {
  meyve: Apple,
  sebze: Carrot,
  'zeytin-ve-yaglar': Droplet,
  'bal-ve-tatlandirici': Droplet,
  'sut-urunleri': Milk,
  'bakliyat-ve-tahil': Wheat,
  kuruyemis: Nut,
  'recel-ve-konserve': Leaf,
};

export function HomeCategories() {
  const q = trpc.catalog.categories.useQuery();
  if (q.isLoading) return null;
  return (
    <View className="mt-6">
      <View className="mb-3 flex-row items-end justify-between px-4">
        <Text className="font-display text-xl text-foreground">Kategoriler</Text>
        <Link href={{ pathname: '/(tabs)/search' }} asChild>
          <Pressable>
            <Text className="text-sm text-leaf-700">Tümü →</Text>
          </Pressable>
        </Link>
      </View>
      <View className="flex-row flex-wrap px-2">
        {(q.data ?? []).map((cat) => {
          const Icon = ICONS[cat.slug] ?? Leaf;
          return (
            <Link
              key={cat.id}
              href={{ pathname: '/(tabs)/search', params: { kategori: cat.slug } }}
              asChild
            >
              <Pressable className="w-1/4 p-2">
                <View className="items-center rounded-2xl border border-border bg-card px-2 py-3">
                  <View className="mb-1 h-10 w-10 items-center justify-center rounded-xl bg-leaf-50">
                    <Icon size={20} color="#1f4f0f" />
                  </View>
                  <Text
                    numberOfLines={2}
                    className="text-center text-[11px] font-medium text-foreground"
                  >
                    {cat.nameTr}
                  </Text>
                </View>
              </Pressable>
            </Link>
          );
        })}
      </View>
    </View>
  );
}
