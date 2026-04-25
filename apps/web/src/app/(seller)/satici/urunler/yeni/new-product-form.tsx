'use client';

import { ProductionMethod } from '@sanda/db/types';
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  cn,
  FormField,
  Input,
  Select,
  Switch,
  Textarea,
} from '@sanda/ui-web';
import { createProductInput } from '@sanda/validation';
import { Sparkles } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useWatch } from 'react-hook-form';

import { TrpcError } from '@/components/forms/trpc-error';
import { useZodForm } from '@/components/forms/use-zod-form';
import { productionMethodLabelTr } from '@/lib/production-method';
import { slugifyTr } from '@/lib/slugify';
import { trpc } from '@/trpc/shared';

interface CategoryOption {
  id: string;
  label: string;
}

export function NewProductForm({
  sellerId,
  categories,
}: {
  sellerId: string;
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const [slugTouched, setSlugTouched] = useState(false);

  const create = trpc.catalog.create.useMutation({
    onSuccess: (product) => {
      router.push(`/satici/urunler/${product.id}` as Route);
    },
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useZodForm(createProductInput, {
    defaultValues: {
      sellerId,
      categoryId: categories[0]?.id ?? '',
      slug: '',
      nameTr: '',
      summary: '',
      description: '',
      productionMethod: ProductionMethod.NATURAL_TRADITIONAL,
      isSeasonal: false,
      minOrderQty: 1,
      stepQty: 1,
      tags: [],
      allergens: [],
    },
  });

  const nameTr = useWatch({ control, name: 'nameTr' });
  useEffect(() => {
    if (!slugTouched) {
      setValue('slug', slugifyTr(nameTr ?? ''), { shouldValidate: true });
    }
  }, [nameTr, slugTouched, setValue]);

  const isSeasonal = useWatch({ control, name: 'isSeasonal' });

  const onSubmit = handleSubmit((values) => {
    create.mutate({
      ...values,
      summary: values.summary && values.summary.trim() ? values.summary : undefined,
      description:
        values.description && values.description.trim() ? values.description : undefined,
    } as Parameters<typeof create.mutate>[0]);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <nav className="text-xs text-muted-foreground">
          <Link href={'/satici/urunler' as Route} className="hover:text-foreground">
            Ürünler
          </Link>{' '}
          / Yeni ürün
        </nav>
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">Yeni ürün</h1>
        <p className="max-w-xl text-sm text-muted-foreground">
          Önce taslak oluşturacağız. Varyant ekledikten ve stok tanımladıktan sonra “yayına al”
          diyerek vitrine çıkarabilirsin.
        </p>
      </div>

      <Card className="border-border/70 shadow-md">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={onSubmit} noValidate className="space-y-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 ring-1 ring-primary/20">
                <Sparkles className="h-5 w-5 text-primary" aria-hidden />
              </span>
              <div>
                <h2 className="font-display text-xl font-semibold">Temel bilgiler</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Alıcının ilk göreceği başlık, kategori ve üretim yöntemi.
                </p>
              </div>
            </div>

            <FormField
              label="Ürün adı"
              htmlFor="nameTr"
              required
              error={errors.nameTr?.message}
            >
              <Input id="nameTr" {...register('nameTr')} invalid={Boolean(errors.nameTr)} />
            </FormField>

            <FormField
              label="Slug"
              htmlFor="slug"
              required
              hint="URL parçası. Ürün adı değiştikçe otomatik türetilir; istersen özelleştir."
              error={errors.slug?.message}
            >
              <Input
                id="slug"
                className="font-mono"
                {...register('slug', { onChange: () => setSlugTouched(true) })}
                invalid={Boolean(errors.slug)}
              />
            </FormField>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                label="Kategori"
                htmlFor="categoryId"
                required
                error={errors.categoryId?.message}
              >
                <Select id="categoryId" {...register('categoryId')} invalid={Boolean(errors.categoryId)}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField
                label="Üretim yöntemi"
                htmlFor="productionMethod"
                required
                hint="“Organik sertifikalı” olması için sertifika onayı gerekir."
                error={errors.productionMethod?.message}
              >
                <Select
                  id="productionMethod"
                  {...register('productionMethod')}
                  invalid={Boolean(errors.productionMethod)}
                >
                  {Object.values(ProductionMethod).map((m) => (
                    <option key={m} value={m}>
                      {productionMethodLabelTr[m]}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>

            <FormField
              label="Kısa özet"
              htmlFor="summary"
              hint="Liste kartında görünen tek cümlelik açıklama (240 karakter)."
              error={errors.summary?.message}
            >
              <Textarea id="summary" rows={2} maxLength={240} {...register('summary')} />
            </FormField>

            <FormField
              label="Detaylı açıklama"
              htmlFor="description"
              hint="Hikâye, hasat, tat profili, pişirme önerileri…"
              error={errors.description?.message}
            >
              <Textarea id="description" rows={7} {...register('description')} />
            </FormField>

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                label="Min. sipariş miktarı"
                htmlFor="minOrderQty"
                required
                error={errors.minOrderQty?.message}
              >
                <Input
                  id="minOrderQty"
                  type="number"
                  step="0.001"
                  min={0.001}
                  {...register('minOrderQty', { valueAsNumber: true })}
                />
              </FormField>
              <FormField
                label="Artış adımı"
                htmlFor="stepQty"
                required
                hint="Sepette miktar artırma/azaltma birimi."
                error={errors.stepQty?.message}
              >
                <Input
                  id="stepQty"
                  type="number"
                  step="0.001"
                  min={0.001}
                  {...register('stepQty', { valueAsNumber: true })}
                />
              </FormField>
              <FormField
                label="Maks. sipariş miktarı"
                htmlFor="maxOrderQty"
                hint="Opsiyonel"
                error={errors.maxOrderQty?.message}
              >
                <Input
                  id="maxOrderQty"
                  type="number"
                  step="0.001"
                  min={0.001}
                  {...register('maxOrderQty', {
                    setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)),
                  })}
                />
              </FormField>
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-display text-lg font-semibold">Mevsimlik ürün</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Hasat aylarını belirtirsen vitrin “mevsiminde” rozetini otomatik gösterir.
                  </p>
                </div>
                <Controller
                  control={control}
                  name="isSeasonal"
                  render={({ field }) => (
                    <Switch
                      checked={Boolean(field.value)}
                      onCheckedChange={field.onChange}
                      aria-label="Mevsimlik"
                    />
                  )}
                />
              </div>
              <div
                className={cn(
                  'mt-4 grid gap-4 md:grid-cols-2',
                  !isSeasonal && 'pointer-events-none opacity-50',
                )}
              >
                <FormField
                  label="Başlangıç ayı (1–12)"
                  htmlFor="seasonStartMonth"
                  error={errors.seasonStartMonth?.message}
                >
                  <Input
                    id="seasonStartMonth"
                    type="number"
                    min={1}
                    max={12}
                    {...register('seasonStartMonth', {
                      setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)),
                    })}
                  />
                </FormField>
                <FormField
                  label="Bitiş ayı (1–12)"
                  htmlFor="seasonEndMonth"
                  error={errors.seasonEndMonth?.message}
                >
                  <Input
                    id="seasonEndMonth"
                    type="number"
                    min={1}
                    max={12}
                    {...register('seasonEndMonth', {
                      setValueAs: (v) => (v === '' || v == null ? undefined : Number(v)),
                    })}
                  />
                </FormField>
              </div>
            </div>

            <FormField
              label="Hasat / üretim notu"
              htmlFor="harvestNotes"
              error={errors.harvestNotes?.message}
            >
              <Input id="harvestNotes" placeholder="Örn: 2026 ilkbahar hasadı" {...register('harvestNotes')} />
            </FormField>

            <FormField
              label="Saklama koşulları"
              htmlFor="storageNotes"
              error={errors.storageNotes?.message}
            >
              <Input id="storageNotes" placeholder="Örn: serin ve kuru yerde…" {...register('storageNotes')} />
            </FormField>

            <Alert tone="info">
              <AlertDescription>
                Ürün taslak olarak kaydedilir. Varyant eklediğinde vitrine alma seçeneği açılır.
              </AlertDescription>
            </Alert>

            <TrpcError error={create.error} title="Ürün oluşturulamadı" />

            <div className="flex flex-wrap items-center justify-end gap-3">
              <Link
                href={'/satici/urunler' as Route}
                className="text-sm font-semibold text-muted-foreground hover:text-foreground"
              >
                Vazgeç
              </Link>
              <Button
                type="submit"
                size="lg"
                loading={isSubmitting || create.isPending}
                className="rounded-xl"
              >
                Taslak olarak oluştur
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
