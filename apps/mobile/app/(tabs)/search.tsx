import { useLocalSearchParams } from 'expo-router';
import { Search as SearchIcon, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProductRow } from '../../src/features/home/product-row';
import { trpc } from '../../src/lib/trpc';

const SORTS = [
  { value: 'newest', label: 'En yeni' },
  { value: 'popular', label: 'Popüler' },
  { value: 'rating', label: 'Puan' },
  { value: 'price_asc', label: 'Fiyat ↑' },
  { value: 'price_desc', label: 'Fiyat ↓' },
] as const;

export default function SearchTab() {
  const params = useLocalSearchParams<{ kategori?: string; sirala?: string }>();
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<string | undefined>(params.kategori);
  const [sort, setSort] = useState<(typeof SORTS)[number]['value']>(
    (params.sirala as (typeof SORTS)[number]['value']) ?? 'newest',
  );

  const categoriesQuery = trpc.catalog.categories.useQuery();
  const results = trpc.catalog.list.useQuery({
    limit: 30,
    search: q || undefined,
    categorySlug: category,
    sort,
  });

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="px-4 pt-2">
        <Text className="font-display text-2xl text-foreground">Keşfet</Text>
      </View>

      <View className="mx-4 mt-3 flex-row items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
        <SearchIcon size={16} color="#6b5837" />
        <TextInput
          placeholder="Ceviz, zeytinyağı, bal…"
          value={q}
          onChangeText={setQ}
          className="flex-1 text-foreground"
        />
        {q ? (
          <Pressable onPress={() => setQ('')}>
            <X size={14} color="#6b5837" />
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingTop: 12 }}
      >
        <Chip active={!category} onPress={() => setCategory(undefined)}>
          Tümü
        </Chip>
        {(categoriesQuery.data ?? []).map((c) => (
          <Chip key={c.id} active={category === c.slug} onPress={() => setCategory(c.slug)}>
            {c.nameTr}
          </Chip>
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingTop: 8 }}
      >
        <Text className="self-center text-[11px] uppercase tracking-widest text-muted-foreground">
          Sırala
        </Text>
        {SORTS.map((s) => (
          <Chip key={s.value} active={sort === s.value} onPress={() => setSort(s.value)}>
            {s.label}
          </Chip>
        ))}
      </ScrollView>

      <ScrollView className="flex-1 mt-3 px-2" contentContainerStyle={{ paddingBottom: 24 }}>
        <ProductRow items={results.data?.items ?? []} isLoading={results.isLoading} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Chip({
  active,
  onPress,
  children,
}: {
  active?: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`shrink-0 rounded-full border px-3 py-1.5 ${
        active ? 'border-leaf-700 bg-leaf-100' : 'border-border bg-card'
      }`}
    >
      <Text
        className={`text-xs font-semibold ${active ? 'text-leaf-700' : 'text-muted-foreground'}`}
      >
        {children}
      </Text>
    </Pressable>
  );
}
