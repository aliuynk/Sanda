'use client';

import type { SellerKind} from '@sanda/db/types';
import { SellerStatus } from '@sanda/db/types';
import { Badge, Button, Card, CardContent, cn } from '@sanda/ui-web';
import { Check, ChevronLeft, ChevronRight, LockKeyhole } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { TrpcError } from '@/components/forms/trpc-error';
import { trpc } from '@/trpc/shared';

import { FarmProfileStep } from './steps/farm-profile-step';
import { LegalInfoStep } from './steps/legal-info-step';
import { ServiceAreasStep } from './steps/service-areas-step';

export type OnboardingSeller = {
  id: string;
  slug: string;
  kind: SellerKind;
  status: SellerStatus;
  displayName: string;
  tagline: string | null;
  story: string | null;
  farmName: string | null;
  farmSize: number | null;
  foundedYear: number | null;
  allowsFarmVisits: boolean;
  farmVisitNotes: string | null;
  farmAddressLine: string | null;
  farmDistrictId: number | null;
  websiteUrl: string | null;
  instagramHandle: string | null;
  iban: string | null;
  taxNumber: string | null;
  nationalId: string | null;
};

const STEPS = [
  { key: 'legal', label: 'Yasal & IBAN' },
  { key: 'farm', label: 'Çiftlik profili' },
  { key: 'areas', label: 'Hizmet alanları' },
  { key: 'submit', label: 'İnceleme' },
] as const;

type StepKey = (typeof STEPS)[number]['key'];

function initialStep(seller: OnboardingSeller, areaCount: number): StepKey {
  if (seller.status === SellerStatus.PENDING_REVIEW || seller.status === SellerStatus.APPROVED) {
    return 'submit';
  }
  if (!seller.iban) return 'legal';
  if (!seller.farmName || !seller.farmDistrictId) return 'farm';
  if (areaCount === 0) return 'areas';
  return 'submit';
}

export function OnboardingWizard({
  seller,
  serviceAreaCount,
}: {
  seller: OnboardingSeller;
  serviceAreaCount: number;
}) {
  const [step, setStep] = useState<StepKey>(initialStep(seller, serviceAreaCount));
  const idx = STEPS.findIndex((s) => s.key === step);
  const router = useRouter();
  const utils = trpc.useUtils();

  const submit = trpc.sellers.submitForReview.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      router.push('/satici' as Route);
      router.refresh();
    },
  });

  const completed: Record<StepKey, boolean> = {
    legal: Boolean(seller.iban),
    farm: Boolean(seller.farmName && seller.farmDistrictId),
    areas: serviceAreaCount > 0,
    submit:
      seller.status === SellerStatus.PENDING_REVIEW ||
      seller.status === SellerStatus.APPROVED,
  };

  const canSubmit = completed.legal && completed.farm && completed.areas;
  const alreadySubmitted =
    seller.status === SellerStatus.PENDING_REVIEW || seller.status === SellerStatus.APPROVED;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Onboarding</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Mağaza altyapını dört adımda tamamla; inceleme sonrası vitrinde görünürsün.
          </p>
        </div>
        <Badge tone={alreadySubmitted ? 'success' : 'outline'} className="w-fit rounded-lg">
          Durum: {seller.status}
        </Badge>
      </div>

      <ol className="grid gap-2 text-xs font-medium md:grid-cols-4">
        {STEPS.map((s, i) => {
          const active = s.key === step;
          const done = completed[s.key];
          return (
            <li key={s.key}>
              <button
                type="button"
                onClick={() => setStep(s.key)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
                  active
                    ? 'border-primary/40 bg-primary/[0.08] text-primary'
                    : done
                      ? 'border-leaf-200 bg-leaf-50/60 text-leaf-800 dark:border-leaf-900 dark:bg-leaf-900/40 dark:text-leaf-100'
                      : 'border-border/80 bg-card/60 text-muted-foreground hover:border-primary/25 hover:text-foreground',
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold',
                    done
                      ? 'bg-leaf-500 text-white'
                      : active
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground',
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className="flex-1">{s.label}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <Card className="border-border/70 shadow-md">
        <CardContent className="p-6 md:p-8">
          {alreadySubmitted ? (
            <div className="space-y-4 text-center">
              <LockKeyhole className="mx-auto h-10 w-10 text-primary" aria-hidden />
              <h2 className="font-display text-2xl font-semibold">
                {seller.status === SellerStatus.APPROVED
                  ? 'Mağazan onaylı. Vitrinde görünüyorsun.'
                  : 'Başvurun inceleme sürecinde.'}
              </h2>
              <p className="mx-auto max-w-md text-sm text-muted-foreground">
                Durumu buradan takip edebilir, bu arada ürün ve hizmet alanlarını düzenleyebilirsin.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href={'/satici' as Route}>
                  <Button>Panele dön</Button>
                </Link>
                <Link href={`/uretici/${seller.slug}` as Route}>
                  <Button variant="outline">Vitrini önizle</Button>
                </Link>
              </div>
            </div>
          ) : step === 'legal' ? (
            <LegalInfoStep seller={seller} onDone={() => setStep('farm')} />
          ) : step === 'farm' ? (
            <FarmProfileStep seller={seller} onDone={() => setStep('areas')} />
          ) : step === 'areas' ? (
            <ServiceAreasStep sellerId={seller.id} count={serviceAreaCount} onDone={() => setStep('submit')} />
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl font-semibold">İncelemeye gönder</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Başvurun admin kuyruğuna düşer; onay sonrası mağazan vitrine çıkar.
                </p>
              </div>
              <ul className="space-y-2 text-sm">
                {(Object.keys(completed) as StepKey[])
                  .filter((k) => k !== 'submit')
                  .map((k) => (
                    <li key={k} className="flex items-center gap-3">
                      <span
                        className={cn(
                          'flex h-5 w-5 items-center justify-center rounded-full',
                          completed[k] ? 'bg-leaf-500 text-white' : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {completed[k] ? <Check className="h-3 w-3" /> : '·'}
                      </span>
                      <span className={cn(completed[k] ? 'text-foreground' : 'text-muted-foreground')}>
                        {STEPS.find((s) => s.key === k)?.label}
                      </span>
                    </li>
                  ))}
              </ul>
              <TrpcError error={submit.error} title="İncelemeye gönderilemedi" />
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  size="lg"
                  disabled={!canSubmit}
                  loading={submit.isPending}
                  onClick={() => submit.mutate({ sellerId: seller.id })}
                  className="rounded-xl"
                >
                  Başvuruyu gönder
                </Button>
                {!canSubmit ? (
                  <span className="text-xs text-muted-foreground">
                    Tüm adımları tamamla, sonra gönderebilirsin.
                  </span>
                ) : null}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {!alreadySubmitted ? (
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={() => idx > 0 && setStep(STEPS[idx - 1]!.key)}
            disabled={idx <= 0}
            className="gap-1 rounded-xl"
          >
            <ChevronLeft className="h-4 w-4" /> Geri
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => idx < STEPS.length - 1 && setStep(STEPS[idx + 1]!.key)}
            disabled={idx >= STEPS.length - 1}
            className="gap-1 rounded-xl"
          >
            İleri <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
