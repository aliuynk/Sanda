import { Link } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { HomeHero } from '../../src/features/home/hero';
import { ProductRow } from '../../src/features/home/product-row';
import { trpc } from '../../src/lib/trpc';

export default function HomeTab() {
  const featured = trpc.catalog.list.useQuery({ limit: 10, sort: 'popular' });

  return (
    <ScrollView className="flex-1 bg-background">
      <HomeHero />
      <View className="px-4 pt-2">
        <View className="mb-3 flex-row items-end justify-between">
          <Text className="font-display text-xl text-foreground">Popüler ürünler</Text>
          <Link href="/(tabs)/search" asChild>
            <Pressable>
              <Text className="text-sm text-muted-foreground">Tümü</Text>
            </Pressable>
          </Link>
        </View>
        <ProductRow
          items={featured.data?.items ?? []}
          isLoading={featured.isLoading}
        />
      </View>
    </ScrollView>
  );
}
