import { Text, View } from 'react-native';

export function HomeHero() {
  return (
    <View className="mx-4 mt-4 rounded-2xl bg-leaf-50 p-6">
      <Text className="font-display text-2xl text-foreground">
        Topraktan sofraya, aracısız.
      </Text>
      <Text className="mt-2 text-muted-foreground">
        Türkiye’nin her köşesinden üreticilerle doğrudan alışveriş yap, sertifikalarını
        şeffafça gör.
      </Text>
    </View>
  );
}
