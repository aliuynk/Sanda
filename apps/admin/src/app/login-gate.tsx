import { Button, Card, CardContent } from '@sanda/ui-web';
import { ArrowRight, ShieldCheck, Terminal } from 'lucide-react';

export function LoginGate() {
  const isDev = process.env.NODE_ENV !== 'production';
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(ellipse_120%_70%_at_50%_-20%,hsl(var(--primary)/0.16),transparent_55%)]">
      <div className="bg-noise pointer-events-none absolute inset-0 opacity-[0.30]" aria-hidden />
      <div className="container relative flex min-h-screen items-center justify-center py-16">
        <Card className="w-full max-w-lg overflow-hidden border-border/70 shadow-2xl shadow-black/[0.06]">
          <CardContent className="space-y-8 p-8 sm:p-10">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 ring-1 ring-primary/20">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </span>
              <div>
                <p className="font-display text-2xl font-semibold tracking-tight">Sanda · Ops</p>
                <p className="text-sm text-muted-foreground">İç operasyon paneli</p>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/40 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Yetki gerekiyor</p>
              <p>
                Bu panel yalnızca <strong>ADMIN</strong>, <strong>MODERATOR</strong> ve{' '}
                <strong>SUPPORT</strong> rolleriyle erişilebilir. Üretici / alıcı oturumları burada
                geçerli değildir.
              </p>
            </div>

            {isDev ? (
              <div className="space-y-4">
                <a
                  href="/api/dev/login"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-colors hover:bg-primary/90"
                >
                  Geliştirici girişi (mock admin)
                  <ArrowRight className="h-4 w-4" />
                </a>
                <p className="flex items-start gap-2 rounded-xl border border-border/70 bg-card px-3 py-2 text-xs text-muted-foreground">
                  <Terminal className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  <span>
                    Yalnızca <code className="rounded bg-muted px-1 py-0.5 font-mono">NODE_ENV !==
                    production</code> iken aktif. Üretimde SSO / SMS-OTP üzerinden gerçek admin
                    bağlanır.
                  </span>
                </p>
              </div>
            ) : (
              <Button className="w-full rounded-xl" disabled>
                SSO ile giriş — yapılandırılmamış
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
