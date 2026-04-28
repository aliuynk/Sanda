import * as React from 'react';

import { cn } from './utils';

/* ---------------------------------------------------------------------------
 * StatusIndicator — colored status dots and pills for orders, certs, etc.
 * -------------------------------------------------------------------------- */

type StatusTone = 'success' | 'warning' | 'destructive' | 'info' | 'neutral' | 'primary';

const toneClasses: Record<StatusTone, { dot: string; pill: string }> = {
  success: {
    dot: 'bg-emerald-500',
    pill: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  },
  warning: {
    dot: 'bg-amber-500',
    pill: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300',
  },
  destructive: {
    dot: 'bg-red-500',
    pill: 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
  },
  info: {
    dot: 'bg-sky-500',
    pill: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300',
  },
  neutral: {
    dot: 'bg-muted-foreground/50',
    pill: 'border-border bg-muted text-muted-foreground',
  },
  primary: {
    dot: 'bg-primary',
    pill: 'border-primary/25 bg-primary/10 text-primary',
  },
};

export function StatusDot({
  tone,
  pulse,
  className,
}: {
  tone: StatusTone;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span className={cn('relative inline-flex', className)}>
      <span
        className={cn(
          'inline-block h-2 w-2 rounded-full',
          toneClasses[tone].dot,
          pulse && 'animate-pulse',
        )}
      />
      {pulse ? (
        <span
          className={cn(
            'absolute inline-flex h-full w-full animate-ping rounded-full opacity-50',
            toneClasses[tone].dot,
          )}
        />
      ) : null}
    </span>
  );
}

export function StatusPill({
  tone,
  children,
  className,
  ...props
}: {
  tone: StatusTone;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        toneClasses[tone].pill,
        className,
      )}
      {...props}
    >
      <StatusDot tone={tone} />
      {children}
    </span>
  );
}
