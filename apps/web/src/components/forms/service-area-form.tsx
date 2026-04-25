'use client';

import { FulfillmentMode, ShippingCarrier } from '@sanda/db/types';
import {
  Alert,
  AlertDescription,
  Button,
  Checkbox,
  cn,
  FormField,
  Input,
  Select,
  Switch,
  Textarea,
} from '@sanda/ui-web';
import { upsertServiceAreaInput } from '@sanda/validation';
import { Controller, useWatch } from 'react-hook-form';
import type { z } from 'zod';

import { TrpcError } from '@/components/forms/trpc-error';
import { useZodForm } from '@/components/forms/use-zod-form';
import { fulfillmentModeTr } from '@/lib/fulfillment-mode';
import { trpc } from '@/trpc/shared';

const carrierLabel: Record<ShippingCarrier, string> = {
  YURTICI: 'Yurtiçi Kargo',
  MNG: 'MNG Kargo',
  ARAS: 'Aras Kargo',
  PTT: 'PTT Kargo',
  SURAT: 'Sürat Kargo',
  HEPSIJET: 'HepsiJet',
  SENDEO: 'Sendeo',
  KOLAYGELSIN: 'Kolay Gelsin',
  CUSTOM: 'Diğer',
  SELLER_DELIVERY: 'Üretici kendisi teslim',
};

export interface ServiceAreaFormProps {
  sellerId: string;
  initial?: Partial<z.input<typeof upsertServiceAreaInput>> & { id?: string };
  onSaved?: () => void;
  submitLabel?: string;
  allProvinceCodes: string[];
  provinceNameByCode: Record<string, string>;
}

export function ServiceAreaForm({
  sellerId,
  initial,
  onSaved,
  submitLabel = 'Kaydet',
  allProvinceCodes,
  provinceNameByCode,
}: ServiceAreaFormProps) {
  const utils = trpc.useUtils();
  const save = trpc.sellers.upsertServiceArea.useMutation({
    onSuccess: async () => {
      await utils.sellers.listMyServiceAreas.invalidate();
      onSaved?.();
    },
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useZodForm(upsertServiceAreaInput, {
    defaultValues: {
      id: initial?.id,
      sellerId,
      name: initial?.name ?? '',
      mode: (initial?.mode as FulfillmentMode) ?? FulfillmentMode.SHIPPING,
      provinceCodes: (initial?.provinceCodes as string[] | undefined) ?? [],
      districtIds: (initial?.districtIds as number[] | undefined) ?? [],
      carrier: (initial?.carrier as ShippingCarrier | undefined) ?? undefined,
      shippingFee: initial?.shippingFee ?? 0,
      freeShippingOver: initial?.freeShippingOver ?? undefined,
      etaMinDays: initial?.etaMinDays ?? undefined,
      etaMaxDays: initial?.etaMaxDays ?? undefined,
      minOrderAmount: initial?.minOrderAmount ?? 0,
      notes: initial?.notes ?? '',
      isActive: initial?.isActive ?? true,
    },
  });

  const mode = useWatch({ control, name: 'mode' }) as FulfillmentMode;
  const provinceCodes = (useWatch({ control, name: 'provinceCodes' }) ?? []) as string[];

  const toggleProvince = (code: string) => {
    const next = provinceCodes.includes(code)
      ? provinceCodes.filter((c) => c !== code)
      : [...provinceCodes, code];
    setValue('provinceCodes', next, { shouldValidate: true });
  };

  const onSubmit = handleSubmit((values) => {
    save.mutate({
      ...values,
      shippingFee: Number(values.shippingFee ?? 0) || 0,
      freeShippingOver: values.freeShippingOver ? Number(values.freeShippingOver) : undefined,
      etaMinDays: values.etaMinDays != null ? Number(values.etaMinDays) : undefined,
      etaMaxDays: values.etaMaxDays != null ? Number(values.etaMaxDays) : undefined,
      minOrderAmount: Number(values.minOrderAmount ?? 0) || 0,
    } as Parameters<typeof save.mutate>[0]);
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label="Bölge adı"
          htmlFor="name"
          required
          hint="Örn: Marmara kargo, İzmir elden teslim."
          error={errors.name?.message}
        >
          <Input id="name" {...register('name')} invalid={Boolean(errors.name)} />
        </FormField>
        <FormField label="Teslimat modu" htmlFor="mode" required error={errors.mode?.message}>
          <Select id="mode" {...register('mode')} invalid={Boolean(errors.mode)}>
            {Object.values(FulfillmentMode).map((m) => (
              <option key={m} value={m}>
                {fulfillmentModeTr[m]}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      {mode === FulfillmentMode.SHIPPING && (
        <FormField
          label="Kargo taşıyıcı"
          htmlFor="carrier"
          required
          error={errors.carrier?.message}
        >
          <Select id="carrier" {...register('carrier')} invalid={Boolean(errors.carrier)}>
            <option value="">Taşıyıcı seç</option>
            {Object.values(ShippingCarrier).map((c) => (
              <option key={c} value={c}>
                {carrierLabel[c]}
              </option>
            ))}
          </Select>
        </FormField>
      )}

      <div>
        <FormField label="Kapsanan iller" required error={(errors.provinceCodes as { message?: string })?.message}>
          <div className="grid grid-cols-2 gap-1.5 rounded-2xl border border-border/60 bg-muted/15 p-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {allProvinceCodes.map((code) => {
              const checked = provinceCodes.includes(code);
              return (
                <label
                  key={code}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-lg border px-2 py-1.5 text-xs transition-colors',
                    checked
                      ? 'border-primary/40 bg-primary/[0.08] text-primary'
                      : 'border-transparent bg-card/70 text-muted-foreground hover:bg-card',
                  )}
                >
                  <Checkbox checked={checked} onChange={() => toggleProvince(code)} />
                  <span className="font-mono font-semibold">{code}</span>
                  <span className="truncate">{provinceNameByCode[code] ?? ''}</span>
                </label>
              );
            })}
          </div>
        </FormField>
      </div>

      {mode === FulfillmentMode.SHIPPING ? (
        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            label="Kargo ücreti (kuruş)"
            htmlFor="shippingFee"
            hint="0 = ücretsiz"
            error={errors.shippingFee?.message}
          >
            <Input
              id="shippingFee"
              type="number"
              min={0}
              step={1}
              {...register('shippingFee', { valueAsNumber: true })}
            />
          </FormField>
          <FormField
            label="Şu tutar üzeri ücretsiz (kuruş)"
            htmlFor="freeShippingOver"
            error={errors.freeShippingOver?.message}
          >
            <Input
              id="freeShippingOver"
              type="number"
              min={0}
              step={1}
              {...register('freeShippingOver', {
                setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)),
              })}
            />
          </FormField>
          <FormField
            label="Minimum sepet tutarı (kuruş)"
            htmlFor="minOrderAmount"
            error={errors.minOrderAmount?.message}
          >
            <Input
              id="minOrderAmount"
              type="number"
              min={0}
              step={1}
              {...register('minOrderAmount', { valueAsNumber: true })}
            />
          </FormField>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label="Tahmini min. süre (gün)"
          htmlFor="etaMinDays"
          error={errors.etaMinDays?.message}
        >
          <Input
            id="etaMinDays"
            type="number"
            min={0}
            max={30}
            {...register('etaMinDays', {
              setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)),
            })}
          />
        </FormField>
        <FormField
          label="Tahmini maks. süre (gün)"
          htmlFor="etaMaxDays"
          error={errors.etaMaxDays?.message}
        >
          <Input
            id="etaMaxDays"
            type="number"
            min={0}
            max={60}
            {...register('etaMaxDays', {
              setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)),
            })}
          />
        </FormField>
      </div>

      <FormField
        label="Not (alıcıya görünür)"
        htmlFor="notes"
        error={errors.notes?.message}
      >
        <Textarea id="notes" rows={3} {...register('notes')} />
      </FormField>

      <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-muted/20 p-4">
        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <Switch
              checked={Boolean(field.value)}
              onCheckedChange={field.onChange}
              aria-label="Aktif"
            />
          )}
        />
        <div>
          <p className="font-medium">Aktif</p>
          <p className="text-xs text-muted-foreground">Kapatırsan bu bölge checkout’ta sunulmaz.</p>
        </div>
      </div>

      {mode === FulfillmentMode.FARM_VISIT ? (
        <Alert tone="info">
          <AlertDescription>
            Bahçe ziyareti modunda kargo kuralları uygulanmaz. Randevu akışı profil ayarlarından
            yönetilir.
          </AlertDescription>
        </Alert>
      ) : null}

      <TrpcError error={save.error} title="Kaydedilemedi" />

      <div className="flex justify-end">
        <Button type="submit" size="lg" loading={isSubmitting || save.isPending} className="rounded-xl">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
