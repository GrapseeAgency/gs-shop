import { Skeleton } from '@/components/ui/skeleton'

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header skeleton */}
      <div className="sticky top-0 z-30 border-b border-border/50 bg-background/90 px-4 py-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <Skeleton className="h-5 flex-1 max-w-[140px] rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-xl ml-auto" />
          <Skeleton className="h-9 w-9 rounded-xl" />
        </div>
      </div>

      {/* Hero banner skeleton */}
      <div className="px-4 mt-3">
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>

      {/* Category pill skeletons */}
      <div className="flex gap-2 px-4 mt-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 flex-shrink-0 rounded-full" />
        ))}
      </div>

      {/* Section header skeleton */}
      <div className="px-4 mt-5 flex items-center justify-between">
        <Skeleton className="h-5 w-28 rounded-lg" />
        <Skeleton className="h-4 w-14 rounded-lg" />
      </div>

      {/* Product grid skeletons */}
      <div className="grid grid-cols-2 gap-3 px-4 mt-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card">
            <Skeleton className="aspect-[4/3] w-full" />
            <div className="flex flex-col gap-2 p-3">
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
              <div className="flex items-center justify-between mt-1">
                <Skeleton className="h-5 w-16 rounded" />
                <Skeleton className="h-7 w-14 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
