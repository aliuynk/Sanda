import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@sanda/ui-web';
import { Leaf } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';

import { LoginForm } from './login-form';

export const metadata = {
  title: 'Giriş yap',
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-[75vh] items-center justify-center py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)/0.14),transparent_55%)]" />
      <Card className="relative w-full max-w-md border-border/70 shadow-xl shadow-black/[0.06]">
        <CardHeader className="space-y-4 pb-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 ring-1 ring-primary/20">
            <Leaf className="h-6 w-6 text-primary" aria-hidden />
          </div>
          <div>
            <CardTitle className="font-display text-2xl">Sanda’ya giriş</CardTitle>
            <CardDescription className="mt-3 text-pretty">
              Cep telefonun ile SMS doğrulama kodu alırsın. Hesabın yoksa güvenli şekilde oluşturulur.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pb-8">
          <LoginForm />
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Üretici misin?{' '}
            <Link href={'/sat/basla' as Route} className="font-semibold text-primary hover:underline">
              Başvuruya başla
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
