'use client';

import type { Route } from 'next';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { ServiceAreaForm, type ServiceAreaFormProps } from '@/components/forms/service-area-form';

interface Props {
  sellerId: string;
  provinces: Array<{ code: string; nameTr: string }>;
  submitLabel: string;
  redirectOnSave: string;
  initial?: ServiceAreaFormProps['initial'];
}

export function ServiceAreaPageClient({
  sellerId,
  provinces,
  submitLabel,
  redirectOnSave,
  initial,
}: Props) {
  const router = useRouter();

  const { allCodes, nameByCode } = useMemo(() => {
    const codes: string[] = [];
    const map: Record<string, string> = {};
    for (const p of provinces) {
      codes.push(p.code);
      map[p.code] = p.nameTr;
    }
    codes.sort();
    return { allCodes: codes, nameByCode: map };
  }, [provinces]);

  return (
    <ServiceAreaForm
      sellerId={sellerId}
      initial={initial}
      allProvinceCodes={allCodes}
      provinceNameByCode={nameByCode}
      submitLabel={submitLabel}
      onSaved={() => {
        router.push(redirectOnSave as Route);
        router.refresh();
      }}
    />
  );
}
