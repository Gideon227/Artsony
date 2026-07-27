'use client'

import { useAuthStore } from '@/store/auth.store'
import { useIsFollowing, useToggleFollow } from '@/hooks/use-follow'
import { cn } from '@/lib/utils'

interface FollowButtonProps {
  userId: string
  className?: string
}

export function FollowButton({ userId, className }: FollowButtonProps) {
  const currentUserId = useAuthStore((s) => s.user?.id)
  const { data: isFollowing, isLoading } = useIsFollowing(userId)
  const { mutate: toggle, isPending } = useToggleFollow(userId)

  // Can't follow yourself, and don't render anything while we don't know
  // who's logged in yet (avoids a flash of the wrong state).
  if (!currentUserId || currentUserId === userId) return null

  return (
    <button
      type="button"
      onClick={() => toggle()}
      disabled={isLoading || isPending}
      aria-pressed={Boolean(isFollowing)}
      className={cn(
        'h-9 px-5 rounded-full text-sm font-medium transition-colors disabled:opacity-60 disabled:pointer-events-none',
        isFollowing
          ? 'bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50'
          : 'bg-primary-500 text-white hover:bg-primary-600',
        className
      )}
    >
      {isLoading
        ? '···'
        : isFollowing ? 'Following' : 'Follow'
      }
    </button>
  )
}