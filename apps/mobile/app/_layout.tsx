import '../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppProviders } from '../src/providers';

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#f7f5f0' },
          headerTintColor: '#261e14',
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: '#fbfaf7' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ presentation: 'modal', title: 'Giriş yap' }} />
        <Stack.Screen name="product/[slug]" options={{ title: 'Ürün' }} />
        <Stack.Screen name="seller/[slug]" options={{ title: 'Üretici' }} />
      </Stack>
    </AppProviders>
  );
}
