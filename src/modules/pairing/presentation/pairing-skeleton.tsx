import { Skeleton } from "@/components/ui/skeleton";

function PairingCardSkeleton() {
  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-5 w-32 rounded-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-14 flex-1 rounded-lg" />
        <Skeleton className="h-14 flex-1 rounded-lg" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

export function PairingGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {Array.from({ length: count }).map((_, index) => (
        <PairingCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function HarmonizerSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[19rem_minmax(0,1fr)] lg:items-start">
      <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-soft">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="flex flex-col gap-5 border-t border-border pt-5">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((row) => (
              <div key={row} className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-1 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between gap-4 border-b border-border pb-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          {[0, 1, 2, 3].map((card) => (
            <PairingCardSkeleton key={card} />
          ))}
        </div>
      </div>
    </div>
  );
}
