import { Skeleton } from '@sanda/ui-web';

/** Buyer orders loading skeleton */
export default function MyOrdersLoading() {
  return (
    <div className="container max-w-4xl py-10 md:py-14">
      <Skeleton className="h-10 w-44 rounded-lg" />
      <Skeleton className="mt-2 h-4 w-64 rounded-md" />

      <div className="mt-8 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-2xl border border-border/60 p-5">
            <Skeleton className="h-16 w-16 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-36 rounded-md" />
              <Skeleton className="h-3 w-52 rounded-md" />
              <Skeleton className="h-3 w-24 rounded-md" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
