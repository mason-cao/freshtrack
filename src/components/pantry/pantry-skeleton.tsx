import { Skeleton } from "@/components/ui/skeleton";

export function PantrySkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading pantry">
      <span className="sr-only">Loading pantry</span>

      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>

      <Skeleton className="h-10 w-full rounded-xl" />

      <div className="flex gap-1.5">
        <Skeleton className="h-8 w-12 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-14 rounded-full" />
        <Skeleton className="h-8 w-18 rounded-full" />
      </div>

      <div className="space-y-2 md:hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>

      <div className="hidden md:block">
        <Skeleton className="h-10 w-full rounded-t-xl" />
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  );
}
