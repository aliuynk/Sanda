import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from './utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      tone: {
        neutral: 'border-transparent bg-muted text-foreground',
        success: 'border-transparent bg-leaf-100 text-leaf-800 dark:bg-leaf-900 dark:text-leaf-100',
        warning: 'border-transparent bg-clay-100 text-clay-800',
        destructive: 'border-transparent bg-destructive/15 text-destructive',
        info: 'border-transparent bg-earth-100 text-earth-800',
        outline: 'border-border bg-transparent text-foreground',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
