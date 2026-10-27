import { Skeleton } from "@/components/ui/skeleton";

export function PairingGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-soft"
        >
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
      ))}
    </div>
  );
}

export function HarmonizerSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-80" />
        </div>
        <Skeleton className="h-10 w-64" />
      </div>
      <PairingGridSkeleton count={4} />
    </div>
  );
}
