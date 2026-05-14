import { Skeleton, SkeletonAvatar } from '@/components/ui/skeleton'

export function NotificationSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-neutral-100 bg-white"
          aria-hidden="true"
        >
          {/* Unread dot placeholder */}
          <Skeleton className="shrink-0 w-2 h-2 rounded-full" />

          {/* Avatar */}
          <SkeletonAvatar size="md" />

          {/* Text */}
          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
            <Skeleton className="h-3 w-3/4 rounded-full" />
            <Skeleton className="h-2.5 w-16 rounded-full" />
          </div>

          {/* Thumbnail placeholder (every other row) */}
          {i % 2 === 0 && (
            <Skeleton className="shrink-0 w-[52px] h-[52px] rounded-xl" />
          )}
        </div>
      ))}
    </div>
  )
}