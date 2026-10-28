import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <div
      className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-live="polite"
    >
      <Skeleton className="h-4 w-56" />
      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="flex flex-col gap-5">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-12 w-full max-w-sm" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}
