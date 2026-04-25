'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { type DefaultValues, type Resolver, useForm,type UseFormProps } from 'react-hook-form';
import type { z } from 'zod';

/**
 * Ergonomic wrapper around `useForm` + `zodResolver`. Uses the schema's
 * **input** type as the form state (so Zod `.default(...)` fields remain
 * optional in `defaultValues`) while the submit handler still receives the
 * parsed output.
 */
export function useZodForm<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  options: Omit<UseFormProps<z.input<TSchema>>, 'resolver'> & {
    defaultValues?: DefaultValues<z.input<TSchema>>;
  } = {},
) {
  return useForm<z.input<TSchema>>({
    ...options,
    resolver: zodResolver(schema) as unknown as Resolver<z.input<TSchema>>,
  });
}
