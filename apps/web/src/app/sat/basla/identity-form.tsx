'use client';

import { normaliseTurkishPhone } from '@sanda/core';
import { SellerKind } from '@sanda/db/types';
import {
  Button,
  Card,
  CardContent,
  cn,
  FormField,
  Input,
  Select,
  Spinner,
} from '@sanda/ui-web';
import { startSellerOnboardingInput } from '@sanda/validation';
import type { Route } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { TrpcError } from '@/components/forms/trpc-error';
import { useZodForm } from '@/components/forms/use-zod-form';
import { sellerKindDescriptionTr, sellerKindLabelTr } from '@/lib/seller-kind';
import { slugifyTr } from '@/lib/slugify';
import { trpc } from '@/trpc/shared';

// Local schema mirrors the API but accepts any non-empty string for phone so we
// can normalise client-side before handing it to the server.
const identitySchema = startSellerOnboardingInput.extend({
  contactPhone: z.string().trim().min(1, 'Telefon gerekli'),
});

export function IdentityForm({ defaultDisplayName }: { defaultDisplayName?: string }) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const [slugTouched, setSlugTouched] = useState(false);

  const start = trpc.sellers.startOnboarding.useMutation({
    onSuccess: () => {
      void utils.auth.me.invalidate();
      router.push('/satici/onboarding' as Route);
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useZodForm(identitySchema, {
    defaultValues: {
      displayName: defaultDisplayName ?? '',
      slug: defaultDisplayName ? slugifyTr(defaultDisplayName) : '',
      kind: SellerKind.INDIVIDUAL_FARMER,
      contactPhone: '',
      contactEmail: '',
    },
  });

  const displayName = useWatch({ control, name: 'displayName' });
  const kind = useWatch({ control, name: 'kind' });

  useEffect(() => {
    if (!slugTouched) {
      setValue('slug', slugifyTr(displayName ?? ''), { shouldValidate: true });
    }
  }, [displayName, slugTouched, setValue]);

  const onSubmit = handleSubmit((values) => {
    const phone = normaliseTurkishPhone(values.contactPhone);
    if (!phone) {
      return;
    }
    start.mutate({
      ...values,
      contactPhone: phone,
      contactEmail: values.contactEmail?.trim() ? values.contactEmail : undefined,
    });
  });

  return (
    <Card className="border-border/70 shadow-xl shadow-black/[0.05]">
      <CardContent className="p-6 md:p-8">
        <form onSubmit={onSubmit} className="space-y-6" noValidate>
          <FormField
            label="Mağaza adı"
            htmlFor="displayName"
            required
            hint="Kooperatif, çiftlik, bahçe ya da marka adı. Alıcılar bunu vitrinde görür."
            error={errors.displayName?.message}
          >
            <Input
              id="displayName"
              placeholder="Örn: Muğla Zeytin Kooperatifi"
              {...register('displayName')}
              invalid={Boolean(errors.displayName)}
            />
          </FormField>

          <FormField
            label="Kullanıcı adı (slug)"
            htmlFor="slug"
            required
            hint="Profil adresi sanda.com/uretici/…. Küçük harf, rakam ve tire."
            error={errors.slug?.message}
          >
            <Input
              id="slug"
              placeholder="mugla-zeytin-kooperatifi"
              {...register('slug', { onChange: () => setSlugTouched(true) })}
              invalid={Boolean(errors.slug)}
              className="font-mono"
            />
          </FormField>

          <FormField label="Üretici tipi" htmlFor="kind" required error={errors.kind?.message}>
            <Select id="kind" {...register('kind')} invalid={Boolean(errors.kind)}>
              {Object.values(SellerKind).map((k) => (
                <option key={k} value={k}>
                  {sellerKindLabelTr[k]}
                </option>
              ))}
            </Select>
            <p className="mt-2 rounded-md bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
              {sellerKindDescriptionTr[kind as SellerKind]}
            </p>
          </FormField>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="İletişim telefonu"
              htmlFor="contactPhone"
              required
              hint="Müşteri ve operasyon bildirimleri için."
              error={errors.contactPhone?.message}
            >
              <Controller
                control={control}
                name="contactPhone"
                render={({ field }) => (
                  <Input
                    id="contactPhone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="0555 111 22 33"
                    value={field.value}
                    onChange={field.onChange}
                    invalid={Boolean(errors.contactPhone)}
                  />
                )}
              />
            </FormField>

            <FormField
              label="İletişim e-postası (isteğe bağlı)"
              htmlFor="contactEmail"
              error={errors.contactEmail?.message}
            >
              <Input
                id="contactEmail"
                type="email"
                autoComplete="email"
                placeholder="uretici@ornek.com"
                {...register('contactEmail')}
                invalid={Boolean(errors.contactEmail)}
              />
            </FormField>
          </div>

          <TrpcError error={start.error} title="Mağaza oluşturulamadı" />

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button type="submit" size="lg" loading={isSubmitting || start.isPending} className="rounded-xl px-8">
              Kimliği oluştur
            </Button>
            <Link
              href={'/yardim/uretici' as Route}
              className={cn('text-sm font-semibold text-muted-foreground hover:text-foreground')}
            >
              Akış nasıl işliyor?
            </Link>
            {start.isPending ? <Spinner className="h-4 w-4" /> : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
