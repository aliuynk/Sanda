'use client';

import { normaliseTurkishPhone } from '@sanda/core';
import { Alert, AlertDescription, Button, Input, Label } from '@sanda/ui-web';
import { useState } from 'react';

import { trpc } from '@/trpc/shared';

type Step = 'phone' | 'code';

export function LoginForm() {
  const [step, setStep] = useState<Step>('phone');
  const [rawPhone, setRawPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const requestOtp = trpc.auth.requestOtp.useMutation({
    onSuccess: () => setStep('code'),
    onError: (e) => setError(e.message),
  });
  const verifyOtp = trpc.auth.verifyOtp.useMutation({
    onError: (e) => setError(e.message),
  });

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const phone = normaliseTurkishPhone(rawPhone);
    if (!phone) {
      setError('Geçerli bir Türkiye cep telefonu girin.');
      return;
    }
    requestOtp.mutate({ phone, purpose: 'login' });
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const phone = normaliseTurkishPhone(rawPhone);
    if (!phone) return;
    verifyOtp.mutate({ phone, code });
  };

  return (
    <form
      onSubmit={step === 'phone' ? handlePhoneSubmit : handleCodeSubmit}
      className="space-y-4"
    >
      {step === 'phone' ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="phone">Cep telefonu</Label>
            <Input
              id="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="0555 111 22 33"
              value={rawPhone}
              onChange={(e) => setRawPhone(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" loading={requestOtp.isPending}>
            Kod gönder
          </Button>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="code">Doğrulama kodu</Label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{4,8}"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={8}
              required
            />
            <p className="text-xs text-muted-foreground">
              {rawPhone} numarasına gönderilen 6 haneli kodu gir.
            </p>
          </div>
          <Button type="submit" className="w-full" loading={verifyOtp.isPending}>
            Doğrula ve giriş yap
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setStep('phone')}
          >
            Telefonu değiştir
          </Button>
        </>
      )}
      {error ? (
        <Alert tone="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </form>
  );
}
