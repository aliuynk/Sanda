import { Switch, Text, View } from 'react-native';

import { useSellerMode } from '../../src/features/role/use-seller-mode';

export default function AccountTab() {
  const { isSellerMode, setIsSellerMode } = useSellerMode();

  return (
    <View className="flex-1 bg-background p-6">
      <Text className="mb-6 font-display text-2xl text-foreground">Hesabım</Text>

      <View className="mb-4 rounded-xl border border-border bg-card p-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-foreground">Satıcı moduna geç</Text>
            <Text className="mt-1 text-xs text-muted-foreground">
              Satıcıysan, siparişlerini ve ürünlerini buradan yönet.
            </Text>
          </View>
          <Switch value={isSellerMode} onValueChange={setIsSellerMode} />
        </View>
      </View>

      <View className="rounded-xl border border-border bg-card p-4">
        <Text className="text-muted-foreground">
          Profil, adresler, siparişler ve bildirimler ekranları ilerleyen sürümlerde.
        </Text>
      </View>
    </View>
  );
}
