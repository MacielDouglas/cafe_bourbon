import { CatalogGridSkeleton } from "@/modules/catalog/presentation/catalog-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex max-w-2xl flex-col gap-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-12 w-80" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <div className="mt-10">
        <CatalogGridSkeleton />
      </div>
    </div>
  );
}
