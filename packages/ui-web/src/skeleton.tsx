import * as React from 'react';

import { cn } from './utils';

/* ---------------------------------------------------------------------------
 * Skeleton — animated loading placeholder.
 * -------------------------------------------------------------------------- */

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl bg-muted/60',
        className,
      )}
      {...props}
    />
  );
}
