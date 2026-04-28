'use client';

import * as React from 'react';

import { Button } from './button';
import { cn } from './utils';

/* ---------------------------------------------------------------------------
 * Sheet — slide-over drawer from edge of screen.
 *
 * Used for mobile filters, quick-edit panels, and secondary navigation.
 * -------------------------------------------------------------------------- */

export function Sheet({
  open,
  onOpenChange,
  children,
  side = 'right',
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  side?: 'left' | 'right' | 'bottom';
  className?: string;
}) {
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onOpenChange]);

  if (!open) return null;

  const sideClasses = {
    right: 'inset-y-0 right-0 w-[min(100%,420px)] border-l animate-in slide-in-from-right',
    left: 'inset-y-0 left-0 w-[min(100%,420px)] border-r animate-in slide-in-from-left',
    bottom: 'inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl border-t animate-in slide-in-from-bottom',
  };

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-background/75 backdrop-blur-sm animate-in fade-in-0"
        aria-label="Kapat"
        onClick={() => onOpenChange(false)}
      />
      <div
        className={cn(
          'absolute overflow-hidden border-border/80 bg-card shadow-2xl',
          sideClasses[side],
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-between border-b border-border/60 px-5 py-4', className)} {...props} />
  );
}

export function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn('font-display text-lg font-semibold', className)} {...props} />;
}

export function SheetClose({ onClose, className }: { onClose: () => void; className?: string }) {
  return (
    <Button type="button" variant="ghost" size="icon" aria-label="Kapat" onClick={onClose} className={className}>
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M4 4l8 8M12 4l-8 8" />
      </svg>
    </Button>
  );
}

export function SheetContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex-1 overflow-y-auto p-5', className)} {...props} />;
}

export function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex gap-2 border-t border-border/60 p-5', className)} {...props} />;
}
