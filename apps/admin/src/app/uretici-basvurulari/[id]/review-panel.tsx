'use client';

import type { AppRouter } from '@sanda/api/client';
import { formatTry, kurus } from '@sanda/core';
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
  StatusPill,
  Textarea,
  useToast,
} from '@sanda/ui-web';
import type { inferRouterOutputs } from '@trpc/server';
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ExternalLink,
  FileCheck,
  HandCoins,
  Landmark,
  MapPin,
  Package,
  Phone,
  ShieldCheck,
  Sprout,
  Truck,
  User,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { trpc } from '@/trpc/shared';

type RouterOutputs = inferRouterOutputs<AppRouter>;
type Seller = RouterOutputs['admin']['sellers']['getById'];

const sellerKindTr: Record<string, string> = {
  INDIVIDUAL_FARMER: 'Bireysel çiftçi',
  REGISTERED_FARMER: 'Kayıtlı çiftçi (ÇKS)',
  COOPERATIVE: 'Kooperatif / üretici birliği',
  SMALL_BUSINESS: 'Esnaf / küçük işletme',
  COMPANY: 'Şirket (Ltd / A.Ş.)',
};

const sellerStatusTone: Record<string, 'success' | 'warning' | 'destructive' | 'info' | 'neutral'> = {
  DRAFT: 'neutral',
  PENDING_REVIEW: 'warning',
  APPROVED: 'success',
  SUSPENDED: 'destructive',
  REJECTED: 'destructive',
};

const sellerStatusTr: Record<string, string> = {
  DRAFT: 'Taslak',
  PENDING_REVIEW: 'İncelemede',
  APPROVED: 'Onaylı',
  SUSPENDED: 'Askıda',
  REJECTED: 'Reddedildi',
};

export function SellerReviewPanel({ seller: initialSeller }: { seller: Seller }) {
  const router = useRouter();
  const toast = useToast();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [reason, setReason] = useState('');

  const utils = trpc.useUtils();
  const onMutationSettled = async () => {
    await Promise.all([
      utils.admin.sellers.list.invalidate(),
      utils.admin.sellers.getById.invalidate({ id: initialSeller.id }),
      utils.admin.stats.invalidate(),
      utils.admin.recentActivity.invalidate(),
    ]);
    router.refresh();
  };

  const approve = trpc.admin.sellers.approve.useMutation({
    onSuccess: async () => {
      await onMutationSettled();
      toast.success('Üretici onaylandı');
    },
    onError: (e) => toast.error('Onaylama başarısız', e.message),
  });
  const reject = trpc.admin.sellers.reject.useMutation({
    onSuccess: async () => {
      await onMutationSettled();
      toast.success('Üretici reddedildi');
      setRejectOpen(false);
      setReason('');
    },
    onError: (e) => toast.error('Red başarısız', e.message),
  });
  const suspend = trpc.admin.sellers.suspend.useMutation({
    onSuccess: async () => {
      await onMutationSettled();
      toast.success('Üretici askıya alındı');
      setSuspendOpen(false);
      setReason('');
    },
    onError: (e) => toast.error('Askıya alma başarısız', e.message),
  });
  const reinstate = trpc.admin.sellers.reinstate.useMutation({
    onSuccess: async () => {
      await onMutationSettled();
      toast.success('Üretici yeniden aktif');
    },
    onError: (e) => toast.error('Yeniden aktif etme başarısız', e.message),
  });

  const isPending = approve.isPending || reject.isPending || suspend.isPending || reinstate.isPending;

  const seller = initialSeller;
  const verifiedCerts = seller.certifications.filter((c) => c.status === 'VERIFIED');
  const pendingCerts = seller.certifications.filter((c) => c.status === 'PENDING_REVIEW');
  const activeAreas = seller.serviceAreas.filter((a) => a.isActive);

  const blockers = computeBlockers(seller);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-border/70 bg-card/80 shadow-sm">
        <CardContent className="p-0">
          <div className="flex flex-col gap-6 px-6 py-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-base font-semibold text-primary ring-1 ring-primary/20">
                {seller.displayName.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-2xl font-semibold tracking-tight">
                    {seller.displayName}
                  </h2>
                  <StatusPill tone={sellerStatusTone[seller.status] ?? 'neutral'}>
                    {sellerStatusTr[seller.status] ?? seller.status}
                  </StatusPill>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {sellerKindTr[seller.kind] ?? seller.kind} · /uretici/{seller.slug}
                </p>
                {seller.tagline ? (
                  <p className="mt-1 max-w-xl text-sm italic text-muted-foreground">
                    “{seller.tagline}”
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {seller.status === 'APPROVED' ? (
                <Button
                  variant="outline"
                  className="rounded-xl border-amber-300/60 text-amber-700 hover:bg-amber-50"
                  onClick={() => setSuspendOpen(true)}
                  disabled={isPending}
                >
                  Askıya al
                </Button>
              ) : null}
              {(seller.status === 'SUSPENDED' || seller.status === 'REJECTED') ? (
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => reinstate.mutate({ id: seller.id })}
                  loading={reinstate.isPending}
                  disabled={isPending}
                >
                  Yeniden aktifleştir
                </Button>
              ) : null}
              {(seller.status === 'PENDING_REVIEW' || seller.status === 'DRAFT') ? (
                <>
                  <Button
                    variant="outline"
                    className="rounded-xl border-red-300/60 text-red-700 hover:bg-red-50"
                    onClick={() => setRejectOpen(true)}
                    disabled={isPending}
                  >
                    <XCircle className="h-4 w-4" />
                    Reddet
                  </Button>
                  <Button
                    className="rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700"
                    onClick={() => approve.mutate({ id: seller.id })}
                    loading={approve.isPending}
                    disabled={isPending || blockers.length > 0}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Onayla
                  </Button>
                </>
              ) : null}
            </div>
          </div>

          {seller.status !== 'APPROVED' && blockers.length > 0 ? (
            <Alert tone="warning" className="mx-6 mb-6">
              <AlertTitle>Onay öncesi tamamlanması gerekenler</AlertTitle>
              <AlertDescription>
                <ul className="mt-2 space-y-1 text-sm">
                  {blockers.map((b) => (
                    <li key={b}>• {b}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          ) : null}

          {seller.suspendedReason ? (
            <Alert tone="destructive" className="mx-6 mb-6">
              <AlertTitle>Önceki ret/askı gerekçesi</AlertTitle>
              <AlertDescription>{seller.suspendedReason}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/70 shadow-sm lg:col-span-2">
          <CardContent className="p-0">
            <header className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <Briefcase className="h-4 w-4 text-primary" />
                Yasal & finansal
              </h3>
            </header>
            <dl className="grid grid-cols-1 gap-y-3 px-5 py-5 text-sm sm:grid-cols-2">
              <Field icon={User} label="Hesap sahibi">
                {seller.account.profile?.firstName} {seller.account.profile?.lastName}
              </Field>
              <Field icon={Phone} label="Telefon">
                <span className="font-mono text-xs">{seller.account.phone ?? '—'}</span>
              </Field>
              <Field icon={ExternalLink} label="E-posta">
                {seller.contactEmail ?? seller.account.email ?? '—'}
              </Field>
              <Field icon={Landmark} label="Vergi no / Vergi dairesi">
                {seller.taxNumber ? (
                  <>
                    <span className="font-mono text-xs">{seller.taxNumber}</span>
                    {seller.taxOffice ? (
                      <span className="text-muted-foreground"> · {seller.taxOffice}</span>
                    ) : null}
                  </>
                ) : (
                  <span className="text-muted-foreground">Eklenmedi</span>
                )}
              </Field>
              <Field icon={FileCheck} label="ÇKS no">
                <span className="font-mono text-xs">
                  {seller.ciftciKayitNumber ?? <span className="text-muted-foreground">—</span>}
                </span>
              </Field>
              <Field icon={Building2} label="MERSİS no">
                <span className="font-mono text-xs">
                  {seller.mersisNumber ?? <span className="text-muted-foreground">—</span>}
                </span>
              </Field>
              <Field icon={HandCoins} label="IBAN sahibi">
                {seller.ibanHolder ?? <span className="text-muted-foreground">Eklenmedi</span>}
              </Field>
              <Field icon={HandCoins} label="IBAN">
                <span className="font-mono text-xs">
                  {seller.iban ? maskIban(seller.iban) : <span className="text-muted-foreground">—</span>}
                </span>
              </Field>
              <Field icon={Sprout} label="Çiftlik">
                {seller.farmName ? (
                  <>
                    {seller.farmName}
                    {seller.farmSize ? (
                      <span className="text-muted-foreground"> · {String(seller.farmSize)} dönüm</span>
                    ) : null}
                  </>
                ) : (
                  <span className="text-muted-foreground">Eklenmedi</span>
                )}
              </Field>
              <Field icon={Calendar} label="Kuruluş yılı">
                {seller.foundedYear ?? <span className="text-muted-foreground">—</span>}
              </Field>
            </dl>
            {seller.story ? (
              <div className="border-t border-border/60 px-5 py-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Hikâye
                </p>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {seller.story}
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-0">
            <header className="border-b border-border/60 px-5 py-3.5">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Sertifikalar
              </h3>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {verifiedCerts.length} doğrulandı · {pendingCerts.length} sıra bekliyor
              </p>
            </header>
            {seller.certifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-5 py-10 text-center text-muted-foreground">
                <ShieldCheck className="h-8 w-8 opacity-30" />
                <p className="text-xs">Yüklenmiş sertifika yok.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border/50">
                {seller.certifications.map((c) => (
                  <li key={c.id} className="px-5 py-3.5">
                    <div className="flex items-start gap-3">
                      <FileCheck className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/sertifikalar/${c.id}`}
                          className="block truncate text-sm font-medium hover:text-primary"
                        >
                          {c.type.replaceAll('_', ' ')}
                        </Link>
                        <p className="font-mono text-[11px] text-muted-foreground">
                          {c.issuer} · {c.certificateNumber}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Geçerlilik: {new Date(c.expiresAt).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                      <CertBadge status={c.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm lg:col-span-2">
          <CardContent className="p-0">
            <header className="flex items-center justify-between border-b border-border/60 px-5 py-3.5">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <Truck className="h-4 w-4 text-primary" />
                Hizmet alanları
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {activeAreas.length} aktif · {seller.serviceAreas.length} toplam
              </p>
            </header>
            {seller.serviceAreas.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-5 py-10 text-center text-muted-foreground">
                <MapPin className="h-8 w-8 opacity-30" />
                <p className="text-xs">Hizmet alanı tanımlı değil.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border/50">
                {seller.serviceAreas.map((a) => (
                  <li key={a.id} className="flex items-start justify-between gap-4 px-5 py-3.5">
                    <div>
                      <p className="font-medium">{a.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {a.mode.replaceAll('_', ' ')} · {a.provinceCodes.length} il
                        {a.districtIds.length > 0 ? ` · ${a.districtIds.length} ilçe` : ''}
                      </p>
                    </div>
                    <div className="text-right text-xs">
                      {a.shippingFee > 0 ? (
                        <p className="font-semibold tabular-nums">
                          {formatTry(kurus(a.shippingFee))}
                        </p>
                      ) : (
                        <p className="font-semibold text-emerald-600">Ücretsiz</p>
                      )}
                      <Badge tone={a.isActive ? 'success' : 'neutral'} className="mt-1 rounded-md">
                        {a.isActive ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardContent className="p-0">
            <header className="border-b border-border/60 px-5 py-3.5">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <Package className="h-4 w-4 text-primary" />
                Ürün öncüleri
              </h3>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {seller.productCount} ürün · {seller.orderCount} sipariş
              </p>
            </header>
            {seller.products.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-5 py-10 text-center text-muted-foreground">
                <Package className="h-8 w-8 opacity-30" />
                <p className="text-xs">Henüz ürün eklenmedi.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border/50">
                {seller.products.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{p.nameTr}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {p.status.toLowerCase()} · {p.minPriceKurus
                          ? formatTry(kurus(p.minPriceKurus))
                          : '—'}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Başvuruyu reddet</DialogTitle>
            <DialogDescription>
              Üreticiye gerekçeyi gönderiyoruz; eksik belgeleri tamamlayıp tekrar başvurabilir.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reddedilme sebebi (zorunlu, en az 3 karakter)…"
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Vazgeç
            </Button>
            <Button
              variant="destructive"
              onClick={() => reject.mutate({ id: seller.id, reason })}
              loading={reject.isPending}
              disabled={reason.trim().length < 3}
            >
              Reddet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Üreticiyi askıya al</DialogTitle>
            <DialogDescription>
              Yeni siparişler durdurulur ve mağaza yayından kalkar. Reinstatement her zaman mümkündür.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Askıya alma sebebi (zorunlu)…"
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendOpen(false)}>
              Vazgeç
            </Button>
            <Button
              variant="destructive"
              onClick={() => suspend.mutate({ id: seller.id, reason })}
              loading={suspend.isPending}
              disabled={reason.trim().length < 3}
            >
              Askıya al
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

function CertBadge({ status }: { status: string }) {
  const tone =
    status === 'VERIFIED'
      ? 'success'
      : status === 'PENDING_REVIEW'
        ? 'warning'
        : status === 'REJECTED'
          ? 'destructive'
          : 'neutral';
  const label =
    status === 'VERIFIED'
      ? 'Doğrulandı'
      : status === 'PENDING_REVIEW'
        ? 'İncelemede'
        : status === 'REJECTED'
          ? 'Reddedildi'
          : status === 'EXPIRED'
            ? 'Süresi dolmuş'
            : status;
  return (
    <span
      className={cn(
        'shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
        tone === 'success' && 'bg-emerald-100 text-emerald-700',
        tone === 'warning' && 'bg-amber-100 text-amber-700',
        tone === 'destructive' && 'bg-red-100 text-red-700',
        tone === 'neutral' && 'bg-muted text-muted-foreground',
      )}
    >
      {label}
    </span>
  );
}

function maskIban(iban: string) {
  if (iban.length < 8) return iban;
  return `${iban.slice(0, 6)} •••• •••• ${iban.slice(-4)}`;
}

function computeBlockers(seller: Seller): string[] {
  const blockers: string[] = [];
  if (!seller.iban) blockers.push('IBAN bilgisi eklenmemiş.');
  if (!seller.farmName || !seller.farmDistrictId) blockers.push('Çiftlik / işletme profili eksik.');
  if (seller.serviceAreas.filter((a) => a.isActive).length === 0) {
    blockers.push('En az bir aktif hizmet alanı tanımlanmalı.');
  }
  if (
    (seller.kind === 'REGISTERED_FARMER' || seller.kind === 'INDIVIDUAL_FARMER') &&
    !seller.ciftciKayitNumber
  ) {
    blockers.push('Çiftçi türü için ÇKS no zorunlu.');
  }
  if (
    (seller.kind === 'COMPANY' || seller.kind === 'COOPERATIVE') &&
    !seller.mersisNumber &&
    !seller.tradeRegistryNumber
  ) {
    blockers.push('Şirket/kooperatif için MERSİS veya ticaret sicil no zorunlu.');
  }
  return blockers;
}
