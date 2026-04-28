import * as React from 'react';

import { cn } from './utils';

/* ---------------------------------------------------------------------------
 * Pagination — page navigation with previous/next and page numbers.
 * -------------------------------------------------------------------------- */

export function Pagination({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      role="navigation"
      aria-label="Sayfa navigasyonu"
      className={cn('flex justify-center', className)}
      {...props}
    />
  );
}

export function PaginationContent({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn('flex items-center gap-1', className)} {...props} />;
}

export function PaginationItem({ className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) {
  return <li className={cn('', className)} {...props} />;
}

interface PaginationLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  isActive?: boolean;
  disabled?: boolean;
}

export function PaginationLink({
  isActive,
  disabled,
  className,
  ...props
}: PaginationLinkProps) {
  return (
    <a
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors',
        isActive
          ? 'border border-primary/30 bg-primary/12 text-primary shadow-sm'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        disabled && 'pointer-events-none opacity-40',
        className,
      )}
      {...props}
    />
  );
}

export function PaginationPrevious({ className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <PaginationLink
      aria-label="Önceki sayfa"
      className={cn('gap-1 pl-2.5', className)}
      {...props}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 12L6 8l4-4" />
      </svg>
      Önceki
    </PaginationLink>
  );
}

export function PaginationNext({ className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <PaginationLink
      aria-label="Sonraki sayfa"
      className={cn('gap-1 pr-2.5', className)}
      {...props}
    >
      Sonraki
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 12l4-4-4-4" />
      </svg>
    </PaginationLink>
  );
}

export function PaginationEllipsis({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-hidden
      className={cn('flex h-9 w-9 items-center justify-center text-muted-foreground', className)}
      {...props}
    >
      ···
    </span>
  );
}
