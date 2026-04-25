'use client';

import { Button } from '@sanda/ui-web';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="font-display text-3xl">Bir şeyler ters gitti</h1>
      <p className="text-muted-foreground">{error.message}</p>
      {error.digest ? (
        <p className="text-xs text-muted-foreground">Referans: {error.digest}</p>
      ) : null}
      <Button onClick={reset}>Tekrar dene</Button>
    </div>
  );
}
