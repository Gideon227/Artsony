import { Skeleton } from '@/components/ui/skeleton'

type ArtworkGridSkeletonProps = {
  count?: number
}

export function ArtworkGridSkeleton({ count = 8 }: ArtworkGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-0 gap-y-10">
      {Array.from({ length: count }).map((_, i) => (
        <ArtCardSkeleton key={i} />
      ))}
    </div>
  )
}

function ArtCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 max-w-[332px] mx-auto w-full">
      {/* Image placeholder — matches aspect-square rounded-[40px] */}
      <Skeleton className="w-full aspect-square rounded-[40px]" />

      {/* Pill footer — matches standard variant: h-[55px] rounded-full */}
      <div className="flex items-center justify-between px-3 pr-4 h-[55px] rounded-full border border-neutral-100 bg-neutral-50 gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Skeleton className="w-9 h-9 rounded-full shrink-0" />
          <Skeleton className="h-3 w-24 rounded-full" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-3 w-8 rounded-full" />
          <Skeleton className="h-3 w-8 rounded-full" />
        </div>
      </div>
    </div>
  )
}