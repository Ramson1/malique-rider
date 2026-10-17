type SkeletonProps = { className?: string };

/** Base pulsing block used for all data-loading states. */
export function Skeleton({ className = "h-4 w-full" }: SkeletonProps) {
  return <div aria-hidden className={`animate-pulse rounded-lg bg-slate-200/70 ${className}`} />;
}

export function SkeletonCircle({ className = "h-9 w-9" }: SkeletonProps) {
  return <div aria-hidden className={`animate-pulse rounded-full bg-slate-200/70 ${className}`} />;
}

export function SkeletonText({ lines = 1, className = "" }: { lines?: number; className?: string }) {
  return (
    <div aria-hidden className={`space-y-1.5 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}

/** Placeholder matching the 3-up StatBar on the rider home. */
export function SkeletonStats() {
  return (
    <div aria-hidden className="grid grid-cols-3 gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="card flex flex-col items-center p-3 text-center">
          <Skeleton className="mb-2 h-9 w-9 rounded-lg" />
          <Skeleton className="h-5 w-12" />
          <Skeleton className="mt-1.5 h-2.5 w-14" />
        </div>
      ))}
    </div>
  );
}

/** Placeholder matching DeliveryCard while deliveries load. */
export function SkeletonDeliveryCard() {
  return (
    <div
      aria-hidden
      className="card space-y-3 p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <SkeletonText lines={3} />
      <div className="flex gap-3 pt-1">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 flex-1 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonDeliveryList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonDeliveryCard key={i} />
      ))}
    </div>
  );
}
