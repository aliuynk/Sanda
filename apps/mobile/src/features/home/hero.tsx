import { Leaf, ShieldCheck, Sparkles } from 'lucide-react-native';
import { Text, View } from 'react-native';

export function HomeHero() {
  return (
    <View className="mx-4 mt-3 overflow-hidden rounded-3xl border border-leaf-200/60 bg-leaf-50">
      <View className="px-6 py-7">
        <View className="flex-row items-center gap-2">
          <View className="h-7 w-7 items-center justify-center rounded-xl bg-leaf-200">
            <Sparkles size={14} color="#1f4f0f" />
          </View>
          <Text className="text-xs font-semibold uppercase tracking-widest text-leaf-700">
            Aracısız · şeffaf
          </Text>
        </View>
        <Text className="mt-3 font-display text-2xl leading-tight text-foreground">
          Türkiye’nin üreticileri,{'\n'}tek şeffaf pazarda.
        </Text>
        <Text className="mt-3 leading-6 text-muted-foreground">
          Hasat izi, sertifika durumu ve teslimat kuralları tek ekranda. Üretici nerelere kargo
          gönderdiğini, ziyarete açık olup olmadığını kendisi tanımlar.
        </Text>
        <View className="mt-5 flex-row gap-3">
          <Pill icon={<Leaf size={12} color="#1f4f0f" />} label="Doğrulanmış sertifikalar" />
          <Pill icon={<ShieldCheck size={12} color="#1f4f0f" />} label="Hakediş & PSP" />
        </View>
      </View>
    </View>
  );
}

function Pill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View className="flex-row items-center gap-1.5 rounded-full border border-leaf-200/80 bg-white/70 px-2.5 py-1">
      {icon}
      <Text className="text-[11px] font-semibold text-leaf-700">{label}</Text>
    </View>
  );
}
