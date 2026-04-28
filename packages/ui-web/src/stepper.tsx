import * as React from 'react';

import { cn } from './utils';

/* ---------------------------------------------------------------------------
 * Stepper — multi-step progress indicator for onboarding and checkout.
 * -------------------------------------------------------------------------- */

export interface StepperStep {
  id: string;
  label: string;
  description?: string;
}

export function Stepper({
  steps,
  currentStep,
  className,
}: {
  steps: StepperStep[];
  currentStep: string;
  className?: string;
}) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <nav aria-label="İlerleme" className={className}>
      <ol className="flex items-center gap-2">
        {steps.map((step, i) => {
          const status = i < currentIndex ? 'complete' : i === currentIndex ? 'current' : 'upcoming';
          return (
            <li
              key={step.id}
              className={cn('flex items-center gap-2', i < steps.length - 1 && 'flex-1')}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all',
                    status === 'complete' &&
                      'bg-primary text-primary-foreground shadow-sm shadow-primary/25',
                    status === 'current' &&
                      'border-2 border-primary bg-primary/12 text-primary shadow-sm shadow-primary/15',
                    status === 'upcoming' &&
                      'border border-border/80 bg-muted/40 text-muted-foreground',
                  )}
                >
                  {status === 'complete' ? (
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 8.5l3 3 5-6" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                <div className="hidden min-w-0 sm:block">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      status === 'current' ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description ? (
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  ) : null}
                </div>
              </div>
              {i < steps.length - 1 ? (
                <div
                  className={cn(
                    'mx-2 hidden h-px flex-1 sm:block',
                    status === 'complete' ? 'bg-primary/40' : 'bg-border/80',
                  )}
                  aria-hidden
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
