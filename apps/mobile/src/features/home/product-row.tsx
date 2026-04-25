import { formatTry, kurus } from '@sanda/core';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

type Item = {
  id: string;
  slug: string;
  nameTr: string;
  seller: { displayName: string };
  variants: Array<{ priceKurus: number }>;
  media: Array<{ url: string }>;
};

export function ProductRow({ items, isLoading }: { items: Item[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <View className="items-center py-12">
        <ActivityIndicator />
      </View>
    );
  }
  return (
    <View className="flex-row flex-wrap">
      {items.map((p) => {
        const price = p.variants[0] ? formatTry(kurus(p.variants[0].priceKurus)) : '—';
        return (
          <Link key={p.id} href={`/product/${p.slug}`} asChild>
            <Pressable className="w-1/2 p-2">
              <View className="overflow-hidden rounded-xl border border-border bg-card">
                {p.media[0] ? (
                  <Image
                    source={{ uri: p.media[0].url }}
                    style={{ width: '100%', aspectRatio: 1 }}
                    contentFit="cover"
                  />
                ) : (
                  <View className="aspect-square w-full bg-muted" />
                )}
                <View className="p-3">
                  <Text numberOfLines={2} className="font-medium text-foreground">
                    {p.nameTr}
                  </Text>
                  <Text className="mt-1 text-xs text-muted-foreground" numberOfLines={1}>
                    {p.seller.displayName}
                  </Text>
                  <Text className="mt-2 font-semibold text-foreground">{price}</Text>
                </View>
              </View>
            </Pressable>
          </Link>
        );
      })}
    </View>
  );
}
