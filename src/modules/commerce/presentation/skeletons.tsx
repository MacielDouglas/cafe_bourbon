import { Skeleton } from "@/components/ui/skeleton";

export function CartSkeleton() {
  return (
    <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
      <div className="flex flex-col gap-5">
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex gap-4 py-5">
            <Skeleton className="size-24 shrink-0 rounded-lg" />
            <div className="flex flex-1 flex-col gap-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}

export function SubscriptionSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-5">
          <Skeleton className="h-7 w-48" />
          <div className="grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((card) => (
              <Skeleton key={card} className="h-64 w-full rounded-2xl" />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <Skeleton className="h-7 w-56" />
          <div className="grid gap-6 sm:grid-cols-2">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-5 rounded-3xl border border-border bg-card p-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-6 w-28" />
        <div className="flex flex-col gap-3 border-y border-border py-5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}
