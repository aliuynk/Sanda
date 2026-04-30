import { Badge, Card, CardContent, StatusDot } from '@sanda/ui-web';
import {
  Activity,
  Boxes,
  Database,
  Network,
  ShieldCheck,
  Workflow,
} from 'lucide-react';

export const metadata = {
  title: 'Sistem sağlığı',
};

const services = [
  { name: 'PostgreSQL + PostGIS', status: 'healthy', tone: 'success', icon: Database, latency: '4ms' },
  { name: 'Redis (BullMQ)', status: 'healthy', tone: 'success', icon: Workflow, latency: '1ms' },
  { name: 'Meilisearch', status: 'healthy', tone: 'success', icon: Network, latency: '8ms' },
  { name: 'MinIO (S3)', status: 'healthy', tone: 'success', icon: Boxes, latency: '12ms' },
  { name: 'iyzico (PSP)', status: 'connected', tone: 'success', icon: ShieldCheck, latency: '—' },
  { name: 'NetGSM (SMS)', status: 'connected', tone: 'success', icon: Activity, latency: '—' },
] as const;

const queues = [
  { name: 'notifications', waiting: 0, active: 0, failed: 0 },
  { name: 'cert-verify', waiting: 0, active: 0, failed: 0 },
  { name: 'payouts', waiting: 0, active: 0, failed: 0 },
  { name: 'shipment-tracking', waiting: 0, active: 0, failed: 0 },
  { name: 'search-index', waiting: 0, active: 0, failed: 0 },
];

export default function SystemHealthPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Sistem
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Sistem sağlığı
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Servis bağlantıları ve BullMQ kuyruk sağlığı. Gerçek metrikler OpenTelemetry / Prometheus
          devreye girince burada beslenecek.
        </p>
      </header>

      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Servisler
        </p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.name} className="border-border/70 bg-card/70 shadow-sm">
                <CardContent className="flex items-center justify-between gap-4 p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
                      <Icon className="h-5 w-5 text-primary" />
                    </span>
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">Latency: {s.latency}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StatusDot tone="success" pulse />
                    <Badge tone="success" className="rounded-md">
                      {s.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          BullMQ kuyrukları
        </p>
        <Card className="border-border/70 bg-card/70 shadow-sm">
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="border-b border-border/60 bg-muted/30 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Kuyruk</th>
                  <th className="px-5 py-3">Bekleyen</th>
                  <th className="px-5 py-3">Aktif</th>
                  <th className="px-5 py-3">Başarısız</th>
                </tr>
              </thead>
              <tbody>
                {queues.map((q) => (
                  <tr key={q.name} className="border-b border-border/40 last:border-0">
                    <td className="px-5 py-3 font-mono text-xs font-semibold">{q.name}</td>
                    <td className="px-5 py-3 tabular-nums">{q.waiting}</td>
                    <td className="px-5 py-3 tabular-nums">{q.active}</td>
                    <td className="px-5 py-3 tabular-nums">{q.failed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
