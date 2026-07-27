import { Skeleton } from "@/components/ui/skeleton";

export default function AdminAnalyticsLoading() {
  return (
    <div className="space-y-6" aria-label="Loading site analytics" role="status">
      <div className="border-b border-warm-100 pb-6">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-4 h-10 w-64" />
        <Skeleton className="mt-3 h-4 w-full max-w-xl" />
      </div>
      <div className="grid gap-px overflow-hidden rounded-2xl border border-warm-100 bg-warm-100 shadow-warm-sm sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="bg-warm-white p-6">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-4 h-9 w-20" />
            <Skeleton className="mt-3 h-3 w-36" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">
        <Skeleton className="h-[520px] rounded-2xl" />
        <Skeleton className="h-[420px] rounded-2xl" />
      </div>
      <Skeleton className="h-[420px] rounded-2xl" />
    </div>
  );
}
