import { Skeleton } from "@/components/ui/skeleton";
import { HarmonizerSkeleton } from "@/modules/pairing/presentation/pairing-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex max-w-2xl flex-col gap-3">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-12 w-80" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <div className="mt-12">
        <HarmonizerSkeleton />
      </div>
    </div>
  );
}
