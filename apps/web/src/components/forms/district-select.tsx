'use client';

import { Select } from '@sanda/ui-web';
import * as React from 'react';

import { trpc } from '@/trpc/shared';

type Props = Omit<React.ComponentProps<typeof Select>, 'children' | 'value' | 'onChange'> & {
  provinceId?: number;
  value?: number | null;
  onChange: (districtId: number | null) => void;
  emptyLabel?: string;
};

export function DistrictSelect({
  provinceId,
  value,
  onChange,
  emptyLabel = 'İlçe seçin',
  ...rest
}: Props) {
  const { data, isLoading } = trpc.geo.districts.useQuery(
    { provinceId: provinceId ?? 0 },
    { enabled: Boolean(provinceId) },
  );

  return (
    <Select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      disabled={isLoading || !provinceId}
      {...rest}
    >
      <option value="">{emptyLabel}</option>
      {(data ?? []).map((d) => (
        <option key={d.id} value={d.id}>
          {d.nameTr}
        </option>
      ))}
    </Select>
  );
}
