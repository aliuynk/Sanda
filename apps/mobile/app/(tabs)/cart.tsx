import { Text, View } from 'react-native';

export default function CartTab() {
  return (
    <View className="flex-1 items-center justify-center bg-background p-8">
      <Text className="font-display text-2xl text-foreground">Sepet</Text>
      <Text className="mt-2 text-center text-muted-foreground">
        Sepet ekranı yakında — siparişlerin, ödeme ve kargo takibi.
      </Text>
    </View>
  );
}
