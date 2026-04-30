'use client';

import type { AppRouter } from '@sanda/api/client';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Select,
  StatusPill,
  Textarea,
  useToast,
} from '@sanda/ui-web';
import type { inferRouterOutputs } from '@trpc/server';
import {
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileCheck,
  Hash,
  Layers,
  Package,
  ShieldCheck,
  Store,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { trpc } from '@/trpc/shared';

type RouterOutputs = inferRouterOutputs<AppRouter>;
type Cert = RouterOutputs['admin']['certifications']['getById'];

const certStatusTone: Record<string, 'success' | 'warning' | 'destructive' | 'info' | 'neutral'> = {
  PENDING_REVIEW: 'warning',
  VERIFIED: 'success',
  REJECTED: 'destructive',
  EXPIRED: 'neutral',
  REVOKED: 'destructive',
};

const certStatusTr: Record<string, string> = {
  PENDING_REVIEW: 'İncelemede',
  VERIFIED: 'Doğrulandı',
  REJECTED: 'Reddedildi',
  EXPIRED: 'Süresi doldu',
  REVOKED: 'İptal edildi',
};

export function CertReviewPanel({ cert }: { cert: Cert }) {
  const router = useRouter();
  const toast = useToast();
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [method, setMethod] = useState<'MANUAL_ADMIN' | 'REGISTRY_LOOKUP' | 'QR_CODE' | 'API_CHECK'>(
    'MANUAL_ADMIN',
  );

  const utils = trpc.useUtils();
  const review = trpc.certifications.review.useMutation({
    onSuccess: async (_, variables) => {
      await Promise.all([
        utils.admin.certifications.list.invalidate(),
        utils.admin.certifications.getById.invalidate({ id: cert.id }),
        utils.admin.stats.invalidate(),
        utils.admin.recentActivity.invalidate(),
      ]);
      router.refresh();
      if (variables.decision === 'verify') {
        toast.success('Sertifika doğrulandı');
        setVerifyOpen(false);
      } else {
        toast.success('Sertifika reddedildi');
        setRejectOpen(false);
        setReason('');
      }
    },
    onError: (e) => toast.error('İşlem başarısız', e.message),
  });

  const isExpired = new Date(cert.expiresAt) < new Date();
  const expiresInDays = Math.round(
    (new Date(cert.expiresAt).getTime() - Date.now()) / (24 * 60 * 60 * 1000),
  );

  return (
    <div className="space-y-6">
      <Card className="border-border/70 bg-card/80 shadow-sm">
        <CardContent className="space-y-6 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/12 ring-1 ring-primary/20">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </span>
                <div>
                  <h2 className="font-display text-2xl font-semibold tracking-tight">
                    {cert.type.replaceAll('_', ' ')}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {cert.issuer} ·{' '}
                    <span className="font-mono">{cert.certificateNumber}</span>
                  </p>
                </div>
                <StatusPill tone={certStatusTone[cert.status] ?? 'neutral'} className="ml-2">
                  {certStatusTr[cert.status] ?? cert.status}
                </StatusPill>
              </div>
              {cert.scopeDescription ? (
                <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                  {cert.scopeDescription}
                </p>
              ) : null}
            </div>

            {cert.status === 'PENDING_REVIEW' ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="rounded-xl border-red-300/60 text-red-700 hover:bg-red-50"
                  onClick={() => setRejectOpen(true)}
                >
                  <XCircle className="h-4 w-4" />
                  Reddet
                </Button>
                <Button
                  className="rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700"
                  onClick={() => setVerifyOpen(true)}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Doğrula
                </Button>
              </div>
            ) : null}
          </div>

          {isExpired ? (
            <Alert tone="destructive">
              <AlertTitle>Sertifikanın süresi geçmiş</AlertTitle>
              <AlertDescription>
                Geçerlilik tarihi {new Date(cert.expiresAt).toLocaleDateString('tr-TR')} olarak girilmiş.
                Ürünler bu sertifikaya dayanarak organik / İyi Tarım iddiası taşıyamaz.
              </AlertDescription>
            </Alert>
          ) : expiresInDays <= 30 ? (
            <Alert tone="warning">
              <AlertTitle>Süresi yaklaşıyor</AlertTitle>
              <AlertDescription>
                {expiresInDays} gün içinde geçerliliğini kaybedecek. Üreticiyi yenileme için
                bilgilendir.
              </AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-0">
            <header className="border-b border-border/60 px-5 py-3.5">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <FileCheck className="h-4 w-4 text-primary" />
                Belge önizleme
              </h3>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Belge tarayıcıda açılır; gerçek doğrulama için her zaman orijinal kayıt sistemini kullan.
              </p>
            </header>
            <div className="p-5">
              <div className="overflow-hidden rounded-2xl border border-border/70 bg-muted/30">
                <iframe
                  src={cert.documentUrl}
                  title="Sertifika belgesi"
                  className="h-[480px] w-full bg-card"
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <a
                  href={cert.documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Yeni sekmede aç
                </a>
                {cert.documentChecksum ? (
                  <span className="font-mono text-[10px] text-muted-foreground">
                    SHA-256: {cert.documentChecksum.slice(0, 16)}…
                  </span>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/70 shadow-sm">
            <CardContent className="space-y-4 p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <Store className="h-4 w-4 text-primary" />
                Üretici
              </h3>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-xs font-semibold text-primary">
                  {cert.seller.displayName.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <Link
                    href={`/uretici-basvurulari/${cert.seller.id}`}
                    className="block font-medium hover:text-primary"
                  >
                    {cert.seller.displayName}
                  </Link>
                  <p className="text-[11px] text-muted-foreground">
                    {cert.seller.kind.replaceAll('_', ' ')} · /uretici/{cert.seller.slug}
                  </p>
                </div>
              </div>
              <Link
                href={`/uretici-basvurulari/${cert.seller.id}`}
                className={cn(
                  'block rounded-lg border border-border/70 bg-card px-3 py-2 text-center text-xs font-semibold text-muted-foreground hover:border-primary/30 hover:text-foreground',
                )}
              >
                Üretici profilini incele →
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardContent className="space-y-4 p-5 text-sm">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <Hash className="h-4 w-4 text-primary" />
                Belge meta
              </h3>
              <Field icon={Calendar} label="Verildi">
                {new Date(cert.issuedAt).toLocaleDateString('tr-TR')}
              </Field>
              <Field icon={Calendar} label="Geçerlilik">
                {new Date(cert.expiresAt).toLocaleDateString('tr-TR')}
              </Field>
              <Field icon={Layers} label="Doğrulama yöntemi">
                {cert.verificationMethod ?? '—'}
              </Field>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardContent className="space-y-3 p-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <Package className="h-4 w-4 text-primary" />
                Kapsam
              </h3>
              {cert.products.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Belge tüm üreticiyi kapsıyor (ürüne özel kapsam tanımlanmadı).
                </p>
              ) : (
                <ul className="space-y-2">
                  {cert.products.map((p) => (
                    <li key={p.product.id} className="flex items-center gap-2 text-sm">
                      <Badge tone="outline" className="rounded-md text-[10px]">
                        Ürün
                      </Badge>
                      <span className="truncate">{p.product.nameTr}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={verifyOpen} onOpenChange={setVerifyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sertifikayı doğrula</DialogTitle>
            <DialogDescription>
              Doğrulama yöntemini seçince ilgili rozet üretici sayfasında görünür hale gelir.
              Onaylanan sertifikaya bağlı kategoriler için yayın kapısı açılır.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Yöntem
            </label>
            <Select value={method} onChange={(e) => setMethod(e.target.value as typeof method)}>
              <option value="MANUAL_ADMIN">Manuel admin doğrulaması</option>
              <option value="REGISTRY_LOOKUP">Resmi kayıt sorgusu</option>
              <option value="QR_CODE">QR kod / dijital kanıt</option>
              <option value="API_CHECK">API kontrolü</option>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyOpen(false)}>
              Vazgeç
            </Button>
            <Button
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              loading={review.isPending}
              onClick={() =>
                review.mutate({
                  certificationId: cert.id,
                  decision: 'verify',
                  verificationMethod: method,
                })
              }
            >
              Doğrula
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sertifikayı reddet</DialogTitle>
            <DialogDescription>
              Üreticiye nedenini gönderiyoruz; düzelterek tekrar yükleyebilir.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reddedilme sebebi (zorunlu)…"
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Vazgeç
            </Button>
            <Button
              variant="destructive"
              loading={review.isPending}
              disabled={reason.trim().length < 3}
              onClick={() =>
                review.mutate({
                  certificationId: cert.id,
                  decision: 'reject',
                  rejectionReason: reason,
                })
              }
            >
              Reddet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70" />
      <div>
        <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </dt>
        <dd className="mt-0.5 text-sm">{children}</dd>
      </div>
    </div>
  );
}
