import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from './utils';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg+*]:pl-7',
  {
    variants: {
      tone: {
        info: 'bg-earth-50 border-earth-200 text-earth-900 dark:bg-earth-900 dark:text-earth-50',
        success:
          'bg-leaf-50 border-leaf-200 text-leaf-900 dark:bg-leaf-900 dark:text-leaf-50',
        warning: 'bg-clay-50 border-clay-200 text-clay-900',
        destructive:
          'border-destructive/30 bg-destructive/10 text-destructive [&>svg]:text-destructive',
      },
    },
    defaultVariants: { tone: 'info' },
  },
);

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

export function Alert({ className, tone, ...props }: AlertProps) {
  return (
    <div role="alert" className={cn(alertVariants({ tone }), className)} {...props} />
  );
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h5 className={cn('mb-1 font-medium leading-none', className)} {...props} />;
}

export function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <div className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />;
}
