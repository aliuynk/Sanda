import * as React from 'react';

import { cn } from './utils';

export interface FormFieldProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Consistent label + input + hint + error stack. Pair with Input / Textarea /
 * Select or any custom control. `error` takes precedence over `hint`.
 */
export function FormField({
  label,
  hint,
  error,
  required,
  htmlFor,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label ? (
        <label
          htmlFor={htmlFor}
          className="flex items-center gap-1 text-sm font-medium leading-none text-foreground"
        >
          <span>{label}</span>
          {required ? (
            <span aria-hidden className="text-destructive">
              *
            </span>
          ) : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
