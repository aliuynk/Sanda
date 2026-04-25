import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';

import { ProductRow } from '../../src/features/home/product-row';
import { trpc } from '../../src/lib/trpc';

export default function SearchTab() {
  const [q, setQ] = useState('');
  const results = trpc.catalog.list.useQuery({ limit: 30, search: q || undefined });

  return (
    <ScrollView className="flex-1 bg-background px-4 pt-4">
      <Text className="mb-2 font-display text-2xl text-foreground">Keşfet</Text>
      <TextInput
        placeholder="Ceviz, zeytinyağı, bal..."
        value={q}
        onChangeText={setQ}
        className="mb-4 rounded-md border border-input bg-background px-3 py-3 text-foreground"
      />
      <View className="-mx-4">
        <ProductRow items={results.data?.items ?? []} isLoading={results.isLoading} />
      </View>
    </ScrollView>
  );
}
