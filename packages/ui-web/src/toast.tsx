'use client';

import * as React from 'react';

import { cn } from './utils';

/* ---------------------------------------------------------------------------
 * Toast — lightweight notification system.
 *
 * Usage:
 *   import { useToast, Toaster } from '@sanda/ui-web';
 *
 *   // In layout:
 *   <Toaster />
 *
 *   // In component:
 *   const toast = useToast();
 *   toast.success('Başarılı!');
 *   toast.error('Bir hata oluştu.');
 *   toast.info('Bilgi mesajı');
 * -------------------------------------------------------------------------- */

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    // Return a no-op version if no provider exists (server-side, tests, etc.)
    return {
      toasts: [],
      addToast: () => {},
      removeToast: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
      warning: () => {},
    };
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = React.useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { ...toast, id }]);

      // Auto-dismiss
      const duration = toast.duration ?? (toast.type === 'error' ? 6000 : 4000);
      setTimeout(() => removeToast(id), duration);
    },
    [removeToast],
  );

  const success = React.useCallback(
    (title: string, description?: string) => addToast({ type: 'success', title, description }),
    [addToast],
  );

  const error = React.useCallback(
    (title: string, description?: string) => addToast({ type: 'error', title, description, duration: 6000 }),
    [addToast],
  );

  const info = React.useCallback(
    (title: string, description?: string) => addToast({ type: 'info', title, description }),
    [addToast],
  );

  const warning = React.useCallback(
    (title: string, description?: string) => addToast({ type: 'warning', title, description }),
    [addToast],
  );

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, success, error, info, warning }}
    >
      {children}
    </ToastContext.Provider>
  );
}

const typeStyles: Record<ToastType, { container: string; icon: string }> = {
  success: {
    container: 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950',
    icon: 'text-emerald-600 dark:text-emerald-400',
  },
  error: {
    container: 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950',
    icon: 'text-red-600 dark:text-red-400',
  },
  info: {
    container: 'border-sky-200 bg-sky-50 dark:border-sky-800 dark:bg-sky-950',
    icon: 'text-sky-600 dark:text-sky-400',
  },
  warning: {
    container: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950',
    icon: 'text-amber-600 dark:text-amber-400',
  },
};

const typeIcons: Record<ToastType, React.ReactNode> = {
  success: (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M5.5 8l2 2 3-3.5" />
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M10 6L6 10M6 6l4 4" />
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 7v4" />
      <circle cx="8" cy="5" r="0.5" fill="currentColor" />
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.13 2.5a1 1 0 0 1 1.74 0l5.08 8.83A1 1 0 0 1 13.08 13H2.92a1 1 0 0 1-.87-1.5z" />
      <path d="M8 6v3" />
      <circle cx="8" cy="11" r="0.5" fill="currentColor" />
    </svg>
  ),
};

export function Toaster() {
  const ctx = React.useContext(ToastContext);
  const toasts = ctx?.toasts ?? [];

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Bildirimler"
      className="pointer-events-none fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col gap-2 p-4 sm:max-w-md"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg shadow-black/[0.06] animate-in fade-in-0 slide-in-from-bottom-3',
            typeStyles[toast.type].container,
          )}
        >
          <span className={cn('mt-0.5 shrink-0', typeStyles[toast.type].icon)}>
            {typeIcons[toast.type]}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">{toast.title}</p>
            {toast.description && (
              <p className="mt-0.5 text-xs text-muted-foreground">{toast.description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => ctx?.removeToast(toast.id)}
            className="shrink-0 rounded-md p-1 text-muted-foreground/60 transition-colors hover:text-foreground"
            aria-label="Kapat"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
