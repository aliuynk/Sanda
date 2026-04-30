import { Link } from 'expo-router';
import { Search, ShoppingBasket } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeCategories } from '../../src/features/home/categories';
import { HomeHero } from '../../src/features/home/hero';
import { ProducersRow } from '../../src/features/home/producers-row';
import { ProductRow } from '../../src/features/home/product-row';
import { trpc } from '../../src/lib/trpc';

export default function HomeTab() {
  const featured = trpc.catalog.list.useQuery({ limit: 10, sort: 'popular' });
  const newest = trpc.catalog.list.useQuery({ limit: 10, sort: 'newest' });

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="flex-row items-center gap-3 px-4 pb-2 pt-1">
          <View className="flex-1">
            <Text className="font-display text-2xl text-foreground">Sanda</Text>
            <Text className="text-xs text-muted-foreground">Topraktan sofraya, aracısız.</Text>
          </View>
          <Link href={{ pathname: '/(tabs)/search' }} asChild>
            <Pressable className="h-10 w-10 items-center justify-center rounded-xl border border-border bg-card">
              <Search size={18} color="#3a7725" />
            </Pressable>
          </Link>
          <Link href={{ pathname: '/(tabs)/cart' }} asChild>
            <Pressable className="h-10 w-10 items-center justify-center rounded-xl border border-border bg-card">
              <ShoppingBasket size={18} color="#3a7725" />
            </Pressable>
          </Link>
        </View>

        <HomeHero />

        <HomeCategories />

        <View className="mt-8 px-4">
          <View className="mb-3 flex-row items-end justify-between">
            <Text className="font-display text-xl text-foreground">Popüler ürünler</Text>
            <Link href={{ pathname: '/(tabs)/search', params: { sirala: 'popular' } }} asChild>
              <Pressable>
                <Text className="text-sm text-leaf-700">Tümü →</Text>
              </Pressable>
            </Link>
          </View>
          <ProductRow items={featured.data?.items ?? []} isLoading={featured.isLoading} />
        </View>

        <ProducersRow />

        <View className="mt-8 px-4">
          <View className="mb-3 flex-row items-end justify-between">
            <Text className="font-display text-xl text-foreground">Yeni eklenenler</Text>
            <Link href={{ pathname: '/(tabs)/search', params: { sirala: 'newest' } }} asChild>
              <Pressable>
                <Text className="text-sm text-leaf-700">Tümü →</Text>
              </Pressable>
            </Link>
          </View>
          <ProductRow items={newest.data?.items ?? []} isLoading={newest.isLoading} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
