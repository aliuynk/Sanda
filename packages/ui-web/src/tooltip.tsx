'use client';

import * as React from 'react';

import { cn } from './utils';

/* ---------------------------------------------------------------------------
 * Tooltip — hover/focus informational overlay.
 * -------------------------------------------------------------------------- */

export function Tooltip({
  content,
  children,
  side = 'top',
  className,
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'bottom';
  className?: string;
}) {
  const [visible, setVisible] = React.useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible ? (
        <span
          role="tooltip"
          className={cn(
            'pointer-events-none absolute z-50 max-w-xs whitespace-normal rounded-lg border border-border/70 bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95',
            side === 'top' && 'bottom-full left-1/2 mb-2 -translate-x-1/2',
            side === 'bottom' && 'left-1/2 top-full mt-2 -translate-x-1/2',
            className,
          )}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
