import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div
      className="space-y-6 xl:space-y-0 xl:grid xl:grid-cols-12 xl:gap-6"
      role="status"
      aria-label="Loading dashboard"
    >
      <span className="sr-only">Loading dashboard</span>

      <div className="pt-2 flex items-start justify-between xl:col-span-12">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-7 w-28 rounded-full" />
      </div>

      <div className="xl:col-span-12">
        <Skeleton className="h-[330px] w-full rounded-2xl" />
      </div>

      <div className="xl:col-span-7 space-y-6">

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Skeleton className="h-24 xl:h-28 rounded-xl" />
          <Skeleton className="h-24 xl:h-28 rounded-xl" />
          <Skeleton className="h-24 xl:h-28 rounded-xl" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-32 mb-3" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      </div>

      <div className="xl:col-span-5 xl:row-span-2">
        <Skeleton className="h-32 xl:h-full rounded-xl" />
      </div>
    </div>
  );
}
