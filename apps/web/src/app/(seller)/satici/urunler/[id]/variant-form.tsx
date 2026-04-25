'use client';

import { UnitOfMeasure } from '@sanda/db/types';
import {
  Button,
  FormField,
  Input,
  Select,
  Switch,
} from '@sanda/ui-web';
import { createVariantInput } from '@sanda/validation';
import { Controller } from 'react-hook-form';

import { TrpcError } from '@/components/forms/trpc-error';
import { useZodForm } from '@/components/forms/use-zod-form';
import { unitOfMeasureLabelTr } from '@/lib/unit-of-measure';
import { trpc } from '@/trpc/shared';

export function VariantForm({
  productId,
  defaultIsDefault,
  onSaved,
  onCancel,
}: {
  productId: string;
  defaultIsDefault?: boolean;
  onSaved?: () => void;
  onCancel?: () => void;
}) {
  const utils = trpc.useUtils();
  const create = trpc.catalog.createVariant.useMutation({
    onSuccess: async () => {
      await utils.catalog.mineById.invalidate({ productId });
      await utils.catalog.listMine.invalidate();
      onSaved?.();
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useZodForm(createVariantInput, {
    defaultValues: {
      productId,
      sku: '',
      nameTr: '',
      unit: UnitOfMeasure.PIECE,
      quantityPerUnit: 1,
      priceKurus: 0,
      stockQuantity: 0,
      isDefault: Boolean(defaultIsDefault),
    },
  });

  const onSubmit = handleSubmit((values) =>
    create.mutate({
      ...values,
      priceKurus: Number(values.priceKurus) || 0,
      compareAtPriceKurus: values.compareAtPriceKurus
        ? Number(values.compareAtPriceKurus)
        : undefined,
      quantityPerUnit: Number(values.quantityPerUnit),
      stockQuantity: Number(values.stockQuantity),
      lowStockThreshold: values.lowStockThreshold
        ? Number(values.lowStockThreshold)
        : undefined,
      weightGrams: values.weightGrams ? Number(values.weightGrams) : undefined,
    } as Parameters<typeof create.mutate>[0]),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div>
        <h3 className="font-display text-xl font-semibold">Yeni varyant</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Ürünün bir paket büyüklüğü ya da çeşidi. Örn: “500 gr cam kavanoz” veya “1 kg”.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="SKU" htmlFor="sku" required error={errors.sku?.message}>
          <Input
            id="sku"
            placeholder="bal-500gr"
            className="font-mono"
            {...register('sku')}
            invalid={Boolean(errors.sku)}
          />
        </FormField>
        <FormField label="Varyant adı" htmlFor="nameTr" required error={errors.nameTr?.message}>
          <Input
            id="nameTr"
            placeholder="500 gr cam kavanoz"
            {...register('nameTr')}
            invalid={Boolean(errors.nameTr)}
          />
        </FormField>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <FormField label="Birim" htmlFor="unit" required error={errors.unit?.message}>
          <Select id="unit" {...register('unit')} invalid={Boolean(errors.unit)}>
            {Object.values(UnitOfMeasure).map((u) => (
              <option key={u} value={u}>
                {unitOfMeasureLabelTr[u]}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField
          label="Birim başı miktar"
          htmlFor="quantityPerUnit"
          required
          hint="Örn: 0.5 kg"
          error={errors.quantityPerUnit?.message}
        >
          <Input
            id="quantityPerUnit"
            type="number"
            step="0.001"
            min={0.001}
            {...register('quantityPerUnit', { valueAsNumber: true })}
          />
        </FormField>
        <FormField
          label="Ağırlık (gram, opsiyonel)"
          htmlFor="weightGrams"
          hint="Kargo hesabı için."
          error={errors.weightGrams?.message}
        >
          <Input
            id="weightGrams"
            type="number"
            min={1}
            {...register('weightGrams', {
              setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)),
            })}
          />
        </FormField>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label="Fiyat (kuruş)"
          htmlFor="priceKurus"
          required
          hint="1 TL = 100 kuruş."
          error={errors.priceKurus?.message}
        >
          <Input
            id="priceKurus"
            type="number"
            min={0}
            step={1}
            {...register('priceKurus', { valueAsNumber: true })}
          />
        </FormField>
        <FormField
          label="Önceki fiyat (kuruş, opsiyonel)"
          htmlFor="compareAtPriceKurus"
          hint="Üzerinde çizgili gösterilir."
          error={errors.compareAtPriceKurus?.message}
        >
          <Input
            id="compareAtPriceKurus"
            type="number"
            min={0}
            step={1}
            {...register('compareAtPriceKurus', {
              setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)),
            })}
          />
        </FormField>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label="Stok"
          htmlFor="stockQuantity"
          required
          error={errors.stockQuantity?.message}
        >
          <Input
            id="stockQuantity"
            type="number"
            min={0}
            step="0.001"
            {...register('stockQuantity', { valueAsNumber: true })}
          />
        </FormField>
        <FormField
          label="Düşük stok eşiği"
          htmlFor="lowStockThreshold"
          hint="Opsiyonel"
          error={errors.lowStockThreshold?.message}
        >
          <Input
            id="lowStockThreshold"
            type="number"
            min={0}
            step="0.001"
            {...register('lowStockThreshold', {
              setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)),
            })}
          />
        </FormField>
      </div>

      <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-muted/15 p-4">
        <Controller
          control={control}
          name="isDefault"
          render={({ field }) => (
            <Switch
              checked={Boolean(field.value)}
              onCheckedChange={field.onChange}
              aria-label="Varsayılan varyant"
            />
          )}
        />
        <div>
          <p className="font-medium">Varsayılan varyant</p>
          <p className="text-xs text-muted-foreground">
            Ürün sayfasında ilk görünen varyant. Ekleyince diğerlerinde varsayılan işareti kalkar.
          </p>
        </div>
      </div>

      <TrpcError error={create.error} title="Varyant eklenemedi" />

      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel} className="rounded-xl">
            Vazgeç
          </Button>
        ) : null}
        <Button
          type="submit"
          size="lg"
          loading={isSubmitting || create.isPending}
          className="rounded-xl"
        >
          Varyantı ekle
        </Button>
      </div>
    </form>
  );
}
