'use client';

import { Button, Card, CardContent } from '@sanda/ui-web';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { useEffect } from 'react';

/**
 * Global error boundary for Next.js app routes.
 *
 * Catches unhandled exceptions in page rendering and provides a
 * retry button. Shows a friendly Turkish message with the earthy
 * design language.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to monitoring (Sentry, etc.)
    console.error('[Sanda Error Boundary]', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-md border-destructive/20 shadow-lg">
        <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Bir sorun oluştu
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Sayfayı yüklerken beklenmeyen bir hata meydana geldi.
              Lütfen tekrar dene veya sorun devam ederse destek ekibimizle iletişime geç.
            </p>
          </div>

          {error.digest && (
            <p className="rounded-lg bg-muted/50 px-3 py-1.5 font-mono text-[11px] text-muted-foreground">
              Hata kodu: {error.digest}
            </p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={reset}
              className="gap-2 rounded-xl shadow-md shadow-primary/20"
            >
              <RefreshCcw className="h-4 w-4" />
              Tekrar dene
            </Button>
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => (window.location.href = '/')}
            >
              Ana sayfaya dön
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
