'use client';

import { Button, FormField, Input, Switch, Textarea } from '@sanda/ui-web';
import { sellerFarmProfileInput } from '@sanda/validation';
import { Flower2 } from 'lucide-react';
import { useState } from 'react';
import { Controller } from 'react-hook-form';

import { DistrictSelect } from '@/components/forms/district-select';
import { TrpcError } from '@/components/forms/trpc-error';
import { useZodForm } from '@/components/forms/use-zod-form';
import { trpc } from '@/trpc/shared';

import type { OnboardingSeller } from '../onboarding-wizard';

export function FarmProfileStep({
  seller,
  onDone,
}: {
  seller: OnboardingSeller;
  onDone: () => void;
}) {
  const utils = trpc.useUtils();
  const save = trpc.sellers.saveFarmProfile.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      onDone();
    },
  });

  const { data: provinces } = trpc.geo.provinces.useQuery();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useZodForm(sellerFarmProfileInput, {
    defaultValues: {
      farmName: seller.farmName ?? seller.displayName,
      tagline: seller.tagline ?? '',
      story: seller.story ?? '',
      farmSize: seller.farmSize ?? undefined,
      foundedYear: seller.foundedYear ?? undefined,
      allowsFarmVisits: seller.allowsFarmVisits,
      farmVisitNotes: seller.farmVisitNotes ?? '',
      farmAddressLine: seller.farmAddressLine ?? '',
      farmDistrictId: seller.farmDistrictId ?? undefined,
      websiteUrl: seller.websiteUrl ?? undefined,
      instagramHandle: seller.instagramHandle ?? undefined,
    },
  });

  // Derive the province (by id) that contains the currently selected district,
  // so the DistrictSelect can preload properly after first mount.
  const [provinceId, setProvinceId] = useState<number | undefined>(undefined);
  // We cannot resolve province -> district without a roundtrip; leave it to
  // the user to pick the province explicitly.

  const onSubmit = handleSubmit((values) =>
    save.mutate(values as Parameters<typeof save.mutate>[0]),
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 ring-1 ring-primary/20">
          <Flower2 className="h-5 w-5 text-primary" aria-hidden />
        </span>
        <div>
          <h2 className="font-display text-2xl font-semibold">Çiftlik profili</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Alıcıların vitrinde göreceği hikâye, konum ve ziyaret kuralları.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label="Çiftlik / atölye adı"
          htmlFor="farmName"
          required
          error={errors.farmName?.message}
        >
          <Input id="farmName" {...register('farmName')} invalid={Boolean(errors.farmName)} />
        </FormField>
        <FormField
          label="Kuruluş yılı"
          htmlFor="foundedYear"
          hint="Opsiyonel"
          error={errors.foundedYear?.message}
        >
          <Input
            id="foundedYear"
            type="number"
            inputMode="numeric"
            min={1800}
            max={new Date().getFullYear()}
            {...register('foundedYear', { valueAsNumber: true })}
          />
        </FormField>
      </div>

      <FormField
        label="Vitrin özeti"
        htmlFor="tagline"
        hint="160 karakter ile 1 cümlelik özet."
        error={errors.tagline?.message}
      >
        <Input id="tagline" maxLength={160} {...register('tagline')} />
      </FormField>

      <FormField
        label="Hikâyen"
        htmlFor="story"
        hint="Üretim yöntemin, bahçen ve tarihçen. Alıcılar bununla tanışacak."
        error={errors.story?.message}
      >
        <Textarea id="story" rows={6} {...register('story')} />
      </FormField>

      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          label="Çiftlik büyüklüğü (dönüm)"
          htmlFor="farmSize"
          error={errors.farmSize?.message}
        >
          <Input
            id="farmSize"
            type="number"
            step="0.1"
            {...register('farmSize', { valueAsNumber: true, setValueAs: (v) => (Number.isNaN(v) ? undefined : v) })}
          />
        </FormField>
        <FormField
          label="İnstagram kullanıcı adı"
          htmlFor="instagramHandle"
          hint="@ işareti olmadan"
          error={errors.instagramHandle?.message}
        >
          <Input id="instagramHandle" placeholder="sandaciftligi" {...register('instagramHandle')} />
        </FormField>
      </div>

      <FormField
        label="Web sitesi"
        htmlFor="websiteUrl"
        hint="Opsiyonel"
        error={errors.websiteUrl?.message}
      >
        <Input id="websiteUrl" type="url" placeholder="https://…" {...register('websiteUrl')} />
      </FormField>

      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <FormField label="İl" required>
          <select
            className="flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={provinceId ?? ''}
            onChange={(e) => setProvinceId(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">İl seçin</option>
            {(provinces ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} · {p.nameTr}
              </option>
            ))}
          </select>
        </FormField>
        <FormField
          label="İlçe"
          required
          error={errors.farmDistrictId?.message}
        >
          <Controller
            control={control}
            name="farmDistrictId"
            render={({ field }) => (
              <DistrictSelect
                provinceId={provinceId}
                value={field.value ?? null}
                onChange={(id) => field.onChange(id ?? undefined)}
                invalid={Boolean(errors.farmDistrictId)}
              />
            )}
          />
        </FormField>
      </div>

      <FormField
        label="Adres satırı"
        htmlFor="farmAddressLine"
        required
        error={errors.farmAddressLine?.message}
      >
        <Input
          id="farmAddressLine"
          placeholder="Mahalle, sokak, no…"
          {...register('farmAddressLine')}
        />
      </FormField>

      <div className="rounded-2xl border border-border/70 bg-muted/20 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-lg font-semibold">Ziyarete açık mıyım?</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Randevuyla bahçeni gezmek isteyen alıcıların listede görebilmesi için.
            </p>
          </div>
          <Controller
            control={control}
            name="allowsFarmVisits"
            render={({ field }) => (
              <Switch
                checked={Boolean(field.value)}
                onCheckedChange={field.onChange}
                aria-label="Ziyarete açık"
              />
            )}
          />
        </div>
        <FormField
          className="mt-4"
          label="Ziyaret notu (isteğe bağlı)"
          htmlFor="farmVisitNotes"
          error={errors.farmVisitNotes?.message}
        >
          <Textarea
            id="farmVisitNotes"
            rows={3}
            placeholder="Hangi günler, kaç kişi, ne kadar süre…"
            {...register('farmVisitNotes')}
          />
        </FormField>
      </div>

      <TrpcError error={save.error} title="Profil kaydedilemedi" />

      <div className="flex justify-end">
        <Button type="submit" size="lg" loading={isSubmitting || save.isPending} className="rounded-xl">
          Kaydet ve devam et
        </Button>
      </div>
    </form>
  );
}
