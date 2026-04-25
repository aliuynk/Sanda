import { formatDate } from '@sanda/core';
import { Badge, Card, CardContent, EmptyState } from '@sanda/ui-web';
import { FileCheck2 } from 'lucide-react';

import { getServerTrpc } from '@/trpc/server';

const statusTone: Record<string, 'success' | 'warning' | 'destructive' | 'neutral'> = {
  VERIFIED: 'success',
  PENDING_REVIEW: 'warning',
  REJECTED: 'destructive',
  EXPIRED: 'destructive',
  REVOKED: 'destructive',
};

export default async function CertificationsPage() {
  const trpc = await getServerTrpc();
  const certs = await trpc.certifications.list();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Sertifikalarım</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Organik, İyi Tarım, coğrafi işaret ve diğer belgeler — doğrulama durumu vitrindeki rozetlerle
          birebir eşlenir.
        </p>
      </div>

      {certs.length === 0 ? (
        <EmptyState
          className="rounded-2xl border-primary/20 bg-primary/[0.03]"
          icon={<FileCheck2 className="h-10 w-10 text-primary" />}
          title="Henüz sertifika yok"
          description="Belgelerini yüklediğinde burada durumlarını takip edebilirsin. Onaylı rozetler ürün kartlarında görünür."
        />
      ) : (
        <div className="grid gap-4">
          {certs.map((c) => (
            <Card key={c.id} className="border-border/70 transition-shadow hover:shadow-md">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
                <div className="min-w-0">
                  <div className="font-display text-lg font-semibold">
                    {c.type.replaceAll('_', ' ')} — {c.issuer}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Sertifika no: {c.certificateNumber} · Geçerlilik: {formatDate(c.expiresAt)}
                  </div>
                </div>
                <Badge tone={statusTone[c.status] ?? 'neutral'} className="rounded-md">
                  {c.status.replaceAll('_', ' ')}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
