import { Card, CardContent, EmptyState } from '@sanda/ui-web';
import { FileSearch } from 'lucide-react';

export const metadata = {
  title: 'Audit log',
};

export default function AuditLogPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Sistem
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Audit log
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Onaylar, redler ve hassas okumalar AuditEvent olarak append-only saklanır. Bu sayfa
          ileride tarihte yolculuk arayüzüyle (entity-temelli, role-temelli, ip-temelli) gelir.
        </p>
      </header>

      <Card className="border-border/70 bg-card/70 shadow-sm">
        <CardContent className="p-0">
          <EmptyState
            icon={<FileSearch className="h-10 w-10" />}
            title="Audit log görüntüleyici hazırlanıyor"
            description="AuditEvent tablosu zaten yazılıyor. Filtre + sayfalama UI'ı eklendiğinde tüm aksiyonlar buradan izlenebilecek."
          />
        </CardContent>
      </Card>
    </div>
  );
}
