import { normaliseTurkishPhone } from '@sanda/core';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { trpc } from '../../src/lib/trpc';

export default function AuthScreen() {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [code, setCode] = useState('');

  const requestOtp = trpc.auth.requestOtp.useMutation({
    onSuccess: () => setStep('code'),
  });
  const verifyOtp = trpc.auth.verifyOtp.useMutation();

  return (
    <View className="flex-1 bg-background p-6">
      <Text className="font-display text-2xl text-foreground">Sanda’ya giriş yap</Text>
      <Text className="mt-2 text-muted-foreground">
        Cep telefonuna göndereceğimiz kod ile giriş yapabilirsin.
      </Text>

      {step === 'phone' ? (
        <>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="0555 111 22 33"
            keyboardType="phone-pad"
            className="mt-6 rounded-md border border-input bg-background px-3 py-3 text-foreground"
          />
          <Pressable
            onPress={() => {
              const normalised = normaliseTurkishPhone(phone);
              if (normalised) requestOtp.mutate({ phone: normalised, purpose: 'login' });
            }}
            className="mt-4 items-center rounded-md bg-primary py-3"
          >
            <Text className="font-medium text-primary-foreground">Kod gönder</Text>
          </Pressable>
        </>
      ) : (
        <>
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="6 haneli kod"
            keyboardType="number-pad"
            className="mt-6 rounded-md border border-input bg-background px-3 py-3 text-foreground"
          />
          <Pressable
            onPress={() => {
              const normalised = normaliseTurkishPhone(phone);
              if (normalised) verifyOtp.mutate({ phone: normalised, code });
            }}
            className="mt-4 items-center rounded-md bg-primary py-3"
          >
            <Text className="font-medium text-primary-foreground">Doğrula</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}
