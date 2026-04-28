import { Skeleton } from '@sanda/ui-web';

/** Seller dashboard loading skeleton */
export default function SellerDashboardLoading() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Skeleton className="h-10 w-48 rounded-lg" />
        <Skeleton className="mt-2 h-4 w-72 rounded-md" />
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/60 p-5">
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="mt-3 h-8 w-28 rounded-lg" />
            <Skeleton className="mt-2 h-3 w-16 rounded-md" />
          </div>
        ))}
      </div>

      {/* Chart area */}
      <div className="rounded-2xl border border-border/60 p-6">
        <Skeleton className="h-5 w-36 rounded-md" />
        <div className="mt-6 flex items-end gap-2" style={{ height: 180 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              className="flex-1 rounded-t-md"
              style={{ height: `${30 + Math.random() * 70}%` }}
            />
          ))}
        </div>
      </div>

      {/* Table skeleton */}
      <div className="rounded-2xl border border-border/60">
        <div className="border-b border-border/60 p-4">
          <Skeleton className="h-4 w-32 rounded-md" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border/40 p-4 last:border-0">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48 rounded-md" />
              <Skeleton className="h-3 w-32 rounded-md" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
