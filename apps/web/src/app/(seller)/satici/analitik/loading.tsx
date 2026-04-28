import { Skeleton } from '@sanda/ui-web';

/** Analytics loading skeleton */
export default function AnalyticsLoading() {
  return (
    <div className="space-y-8">
      <div>
        <Skeleton className="h-10 w-40 rounded-lg" />
        <Skeleton className="mt-2 h-4 w-64 rounded-md" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/60 p-5">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="mt-3 h-8 w-20 rounded-lg" />
            <Skeleton className="mt-2 h-3 w-28 rounded-md" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 p-6">
          <Skeleton className="h-5 w-44 rounded-md" />
          <div className="mt-6 flex items-end gap-1.5" style={{ height: 140 }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton
                key={i}
                className="flex-1 rounded-t-md"
                style={{ height: `${10 + Math.random() * 90}%` }}
              />
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 p-6 space-y-3">
          <Skeleton className="h-5 w-40 rounded-md" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl bg-muted/20 p-3">
              <Skeleton className="h-7 w-7 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
