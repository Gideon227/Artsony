'use client'

import { useCallback, useEffect, useRef } from 'react'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useBlockedUsers, useUnblockUser } from '@/hooks/use-blocks'
import type { BlockedUser } from '@/types/social'

type BlockedUsersProps = {
  onBack: () => void
}

const SKELETON_ROWS = 4

function BlockedUserRow({ user }: { user: BlockedUser }) {
  const { mutate: unblock, isPending } = useUnblockUser()
  const name = user.display_name || user.username

  return (
    <li className='flex w-full flex-1 items-center justify-between gap-x-4 py-2'>
      <div className='flex min-w-0 items-center gap-x-2'>
        <Avatar
          src={user.avatar_url}
          name={name}
          size='lg'
          className='border border-gray-50 bg-[#DAD0FC]'
        />
        <p className='truncate font-poppins text-body-xs font-medium text-body' title={name}>
          {name}
        </p>
      </div>

      <Button
        type='button'
        variant='outline'
        size='lg'
        className='shrink-0 rounded-full'
        leftIcon='/icons/user-minus.svg'
        isLoading={isPending}
        disabled={isPending}
        onClick={() => unblock(user.id)}
        aria-label={`Unblock ${name}`}
      >
        Unblock
      </Button>
    </li>
  )
}

function BlockedUserSkeleton() {
  return (
    <li className='flex w-full flex-1 animate-pulse items-center justify-between py-2' aria-hidden='true'>
      <div className='flex items-center gap-x-2'>
        <div className='h-14 w-14 rounded-full bg-gray-50' />
        <div className='h-4 w-32 rounded-full bg-gray-50' />
      </div>
      <div className='h-12 w-[142px] rounded-full bg-gray-50' />
    </li>
  )
}

export default function BlockedUsers({ onBack }: BlockedUsersProps) {
  const {
    data,
    isLoading,
    isError,
    refetch,
    isRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useBlockedUsers()

  const scrollRef = useRef<HTMLDivElement>(null)
  const sentinelRef = useRef<HTMLLIElement>(null)

  const users = data?.pages.flatMap((page) => page.data) ?? []
  const canLoadMore = Boolean(hasNextPage) && !isFetchingNextPage && !isFetchNextPageError

  const loadMore = useCallback(() => {
    if (canLoadMore) void fetchNextPage()
  }, [canLoadMore, fetchNextPage])

  useEffect(() => {
    const sentinel = sentinelRef.current
    const root = scrollRef.current
    if (!sentinel || !root) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMore()
      },
      { root, rootMargin: '0px 0px 120px 0px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore, users.length])

  return (
    <div className='flex w-full flex-col gap-y-6'>
      <div className='flex items-center gap-4'>
        <button
          type='button'
          onClick={onBack}
          aria-label='Back to Privacy & Safety'
          className='flex cursor-pointer h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-50 transition-colors hover:bg-secondary-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 active:scale-[0.98]'
        >
          <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' aria-hidden='true'>
            <path d='M20 12H4M10 18L4 12L10 6' stroke='#525965' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
        </button>

        <h2 className='flex-1 font-poppins text-body-m font-semibold tracking-wide text-primary-500'>Blocked Users</h2>
      </div>

      <div
        ref={scrollRef}
        className='max-h-96 overflow-y-auto rounded-xl bg-secondary-50 p-6 [scrollbar-color:#D2D5DA_transparent] [scrollbar-width:thin]'
      >
        {isLoading ? (
          <ul className='flex flex-col gap-y-4' aria-busy='true' aria-label='Loading blocked users'>
            {Array.from({ length: SKELETON_ROWS }, (_, i) => (
              <BlockedUserSkeleton key={i} />
            ))}
          </ul>
        ) : isError && users.length === 0 ? (
          <div role='alert' className='flex flex-col items-center gap-y-4 py-8 text-center'>
            <p className='font-poppins text-body-s text-body'>We couldn&apos;t load your blocked users.</p>
            <Button type='button' variant='outline' size='lg' className='rounded-full' isLoading={isRefetching} onClick={() => void refetch()}>
              Retry
            </Button>
          </div>
        ) : users.length === 0 ? (
          <div className='flex flex-col items-center gap-y-2 py-8 text-center'>
            <p className='font-poppins text-body-s font-medium text-heading'>You haven&apos;t blocked anyone</p>
            <p className='font-poppins text-body-xs text-body'>People you block will show up here.</p>
          </div>
        ) : (
          <ul className='flex flex-col gap-y-4'>
            {users.map((user) => (
              <BlockedUserRow key={user.id} user={user} />
            ))}

            {hasNextPage && <li ref={sentinelRef} aria-hidden='true' className='h-px' />}

            {isFetchingNextPage && <BlockedUserSkeleton />}

            {isFetchNextPageError && (
              <li className='flex justify-center py-2'>
                <Button type='button' variant='outline' size='lg' className='rounded-full' onClick={() => void fetchNextPage()}>
                  Try again
                </Button>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
