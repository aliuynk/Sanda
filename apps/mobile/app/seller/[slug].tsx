import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

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
  if (!q.data) return null;

  return (
    <ScrollView className="flex-1 bg-background p-5">
      <Text className="font-display text-2xl text-foreground">{q.data.displayName}</Text>
      {q.data.tagline ? (
        <Text className="mt-2 text-muted-foreground">{q.data.tagline}</Text>
      ) : null}
      {q.data.story ? (
        <Text className="mt-4 leading-6 text-foreground">{q.data.story}</Text>
      ) : null}
    </ScrollView>
  );
}
