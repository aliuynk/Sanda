'use client';

import { Select } from '@sanda/ui-web';
import * as React from 'react';

import { trpc } from '@/trpc/shared';

type Props = Omit<React.ComponentProps<typeof Select>, 'children' | 'value' | 'onChange'> & {
  value?: string;
  onChange: (code: string) => void;
  includeEmpty?: boolean;
  emptyLabel?: string;
};

/**
 * Province selector backed by `geo.provinces`. Value is the 2-digit plate code.
 */
export function ProvinceSelect({
  value,
  onChange,
  includeEmpty = true,
  emptyLabel = 'İl seçin',
  ...rest
}: Props) {
  const { data, isLoading } = trpc.geo.provinces.useQuery();

  return (
    <Select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={isLoading}
      {...rest}
    >
      {includeEmpty ? <option value="">{emptyLabel}</option> : null}
      {(data ?? []).map((p) => (
        <option key={p.id} value={p.code}>
          {p.code} · {p.nameTr}
        </option>
      ))}
    </Select>
  );
}
