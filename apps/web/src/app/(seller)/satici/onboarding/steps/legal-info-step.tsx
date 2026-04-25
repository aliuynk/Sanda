'use client';

import { SellerKind } from '@sanda/db/types';
import { Alert, AlertDescription, Button, FormField, Input, Select } from '@sanda/ui-web';
import { sellerLegalInfoInput } from '@sanda/validation';
import { ShieldCheck } from 'lucide-react';
import { useWatch } from 'react-hook-form';

import { TrpcError } from '@/components/forms/trpc-error';
import { useZodForm } from '@/components/forms/use-zod-form';
import { sellerKindLabelTr } from '@/lib/seller-kind';
import { trpc } from '@/trpc/shared';

import type { OnboardingSeller } from '../onboarding-wizard';

export function LegalInfoStep({
  seller,
  onDone,
}: {
  seller: OnboardingSeller;
  onDone: () => void;
}) {
  const utils = trpc.useUtils();
  const save = trpc.sellers.saveLegalInfo.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      onDone();
    },
  });

  // Discriminated union defaults conflict with RHF's partial DefaultValues; a
  // narrow cast is the cleanest escape hatch.
  const initialLegal = {
    kind: seller.kind,
    ibanHolder: seller.displayName,
  } as Record<string, unknown>;
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useZodForm(sellerLegalInfoInput, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultValues: initialLegal as any,
  });

  const kind = useWatch({ control, name: 'kind' }) as SellerKind;

  const onSubmit = handleSubmit((values) =>
    save.mutate(values as Parameters<typeof save.mutate>[0]),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 ring-1 ring-primary/20">
          <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-2xl font-semibold">Yasal bilgiler ve IBAN</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Hassas veriler uygulama katmanında şifrelenir; sadece onay sürecine dâhil personel
            erişir.
          </p>
        </div>
      </div>

      <FormField label="Üretici tipi" htmlFor="kind" required error={errors.kind?.message}>
        <Select id="kind" {...register('kind')} invalid={Boolean(errors.kind)}>
          {Object.values(SellerKind).map((k) => (
            <option key={k} value={k}>
              {sellerKindLabelTr[k]}
            </option>
          ))}
        </Select>
      </FormField>

      {(kind === SellerKind.INDIVIDUAL_FARMER || kind === SellerKind.REGISTERED_FARMER) && (
        <FormField
          label="T.C. Kimlik No"
          htmlFor="nationalId"
          required
          hint="Uygulama katmanında şifrelenerek saklanır."
          error={(errors as { nationalId?: { message?: string } }).nationalId?.message}
        >
          <Input
            id="nationalId"
            inputMode="numeric"
            maxLength={11}
            placeholder="11 haneli"
            {...register('nationalId' as never)}
          />
        </FormField>
      )}

      {(kind === SellerKind.INDIVIDUAL_FARMER || kind === SellerKind.REGISTERED_FARMER) && (
        <FormField
          label={`ÇKS kayıt no${kind === SellerKind.REGISTERED_FARMER ? '' : ' (isteğe bağlı)'}`}
          htmlFor="ciftciKayitNumber"
          hint="Çiftçi Kayıt Sistemi numarası. Tarım İl Müdürlüğü’nden alınır."
          error={(errors as { ciftciKayitNumber?: { message?: string } }).ciftciKayitNumber?.message}
        >
          <Input
            id="ciftciKayitNumber"
            inputMode="numeric"
            placeholder="ÇKS no"
            {...register('ciftciKayitNumber' as never)}
          />
        </FormField>
      )}

      {kind !== SellerKind.INDIVIDUAL_FARMER && (
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="Vergi No"
            htmlFor="taxNumber"
            required
            error={(errors as { taxNumber?: { message?: string } }).taxNumber?.message}
          >
            <Input
              id="taxNumber"
              inputMode="numeric"
              maxLength={10}
              placeholder="10 haneli"
              {...register('taxNumber' as never)}
            />
          </FormField>
          <FormField
            label="Vergi dairesi"
            htmlFor="taxOffice"
            required
            error={(errors as { taxOffice?: { message?: string } }).taxOffice?.message}
          >
            <Input id="taxOffice" placeholder="Örn: Kadıköy" {...register('taxOffice' as never)} />
          </FormField>
        </div>
      )}

      {kind === SellerKind.COOPERATIVE && (
        <FormField
          label="Ticaret sicil no (isteğe bağlı)"
          htmlFor="tradeRegistryNumber"
          error={(errors as { tradeRegistryNumber?: { message?: string } }).tradeRegistryNumber?.message}
        >
          <Input id="tradeRegistryNumber" {...register('tradeRegistryNumber' as never)} />
        </FormField>
      )}

      {kind === SellerKind.COMPANY && (
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="Ticaret sicil no"
            htmlFor="tradeRegistryNumber"
            required
            error={(errors as { tradeRegistryNumber?: { message?: string } }).tradeRegistryNumber?.message}
          >
            <Input id="tradeRegistryNumber" {...register('tradeRegistryNumber' as never)} />
          </FormField>
          <FormField
            label="MERSİS no (isteğe bağlı)"
            htmlFor="mersisNumber"
            hint="16 haneli"
            error={(errors as { mersisNumber?: { message?: string } }).mersisNumber?.message}
          >
            <Input
              id="mersisNumber"
              inputMode="numeric"
              maxLength={16}
              placeholder="16 haneli"
              {...register('mersisNumber' as never)}
            />
          </FormField>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label="IBAN"
          htmlFor="iban"
          required
          hint="TR ile başlayan, 26 karakter."
          error={(errors as { iban?: { message?: string } }).iban?.message}
        >
          <Input
            id="iban"
            placeholder="TR.. .... .... .... .... .... ...."
            className="font-mono"
            {...register('iban' as never)}
          />
        </FormField>
        <FormField
          label="IBAN sahibi"
          htmlFor="ibanHolder"
          required
          error={(errors as { ibanHolder?: { message?: string } }).ibanHolder?.message}
        >
          <Input id="ibanHolder" {...register('ibanHolder' as never)} />
        </FormField>
      </div>

      <Alert tone="info">
        <AlertDescription>
          Ödemeler iyzico altyapısı üzerinden emanet hesapta tutulur; teslimat sonrası IBAN’ına
          aktarılır.
        </AlertDescription>
      </Alert>

      <TrpcError error={save.error} title="Yasal bilgiler kaydedilemedi" />

      <div className="flex justify-end">
        <Button type="submit" size="lg" loading={isSubmitting || save.isPending} className="rounded-xl">
          Kaydet ve devam et
        </Button>
      </div>
    </form>
  );
}
