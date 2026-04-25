import { formatTry, kurus } from '@sanda/core';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

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
        <Text className="text-muted-foreground">Ürün bulunamadı.</Text>
      </View>
    );
  }

  const p = query.data;
  const variant = p.variants[0];

  return (
    <ScrollView className="flex-1 bg-background">
      {p.media[0] ? (
        <Image
          source={{ uri: p.media[0].url }}
          style={{ width: '100%', aspectRatio: 1 }}
          contentFit="cover"
        />
      ) : null}
      <View className="p-5">
        <Text className="font-display text-2xl text-foreground">{p.nameTr}</Text>
        <Text className="mt-1 text-muted-foreground">{p.seller.displayName}</Text>
        {variant ? (
          <Text className="mt-4 text-2xl font-semibold text-foreground">
            {formatTry(kurus(variant.priceKurus))}
          </Text>
        ) : null}
        {p.description ? (
          <Text className="mt-4 leading-6 text-foreground">{p.description}</Text>
        ) : null}
      </View>
    </ScrollView>
  );
}
