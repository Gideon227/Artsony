'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { X, Search, UserPlus, UserCheck } from 'lucide-react'
import { useFollowers, useFollowing, useIsFollowing, useToggleFollow } from '@/hooks/use-follow'
import { useAuthStore } from '@/store'
import type { FollowUser } from '@/types/social'

interface Props {
  userId: string
  type: 'followers' | 'following'
  totalCount: number
  onClose: () => void
  onSelectUser: (userId: string) => void
}

// A single row's own follow/unfollow toggle — the viewer's relationship to
// *this listed person*, independent of whatever list they're looking at.
function FollowToggleBadge({ userId }: { userId: string }) {
  const { user: currentUser } = useAuthStore()
  const { data: isFollowing } = useIsFollowing(userId)
  const { mutate: toggle, isPending } = useToggleFollow(userId)

  if (currentUser?.id === userId) return null

  return (
    <button
      onClick={(e) => { e.stopPropagation(); toggle() }}
      disabled={isPending}
      aria-label={isFollowing ? 'Unfollow' : 'Follow'}
      className={`absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-white transition-colors disabled:opacity-60 ${isFollowing ? 'bg-gray-400' : 'bg-primary-500'}`}
    >
      {isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
    </button>
  )
}

export function ProfileFollowersModal({ userId, type, totalCount, onClose, onSelectUser }: Props) {
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [accumulated, setAccumulated] = useState<FollowUser[]>([])

  const followersQuery = useFollowers(type === 'followers' ? userId : '', page)
  const followingQuery = useFollowing(type === 'following' ? userId : '', page)
  const { data, isLoading } = type === 'followers' ? followersQuery : followingQuery

  useEffect(() => {
    if (!data?.data) return
    setAccumulated((prev) => (page === 1 ? data.data : [...prev, ...data.data]))
  }, [data, page])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  // No search param exists on listFollowers/listFollowing — this filters
  // whatever pages have already loaded rather than guessing at a backend
  // `?search=` contract that isn't confirmed.
  const visible = useMemo(() => {
    if (!query.trim()) return accumulated
    const q = query.trim().toLowerCase()
    return accumulated.filter((u) => u.username.toLowerCase().includes(q) || u.display_name?.toLowerCase().includes(q))
  }, [accumulated, query])

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40" onClick={onClose}>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className="flex h-[calc(100vh-5rem)] w-[92vw] max-w-[900px] flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl"
      >
        <div className="flex shrink-0 flex-col gap-4 border-b border-gray-50 px-4 py-4 md:flex-row md:items-center md:px-8 md:py-6">
          <div className="flex items-center justify-between gap-4 md:contents">
            <h2 className="shrink-0 font-poppins text-body-l font-semibold text-heading">
              {type === 'followers' ? 'Followers' : 'Following'} <span className="text-primary-500">({totalCount.toLocaleString()})</span>
            </h2>
            <button onClick={onClose} aria-label="Close" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-100 text-gray-500 transition-colors hover:bg-gray-50 md:hidden">
              <X size={18} />
            </button>
          </div>

          <div className="relative flex-1">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Username"
              className="w-full rounded-full border border-gray-100 py-2.5 pl-11 pr-4 font-poppins text-body-s outline-none focus:border-primary-500"
            />
          </div>

          <button onClick={onClose} aria-label="Close" className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-100 text-gray-500 transition-colors hover:bg-gray-50 md:flex">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {isLoading && page === 1 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-2xl bg-gray-50" />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <p className="py-12 text-center font-poppins text-body-s text-gray-400">
              {query ? 'No one matches that search.' : type === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {visible.map((person) => (
                <button
                  key={person.id}
                  onClick={() => { onSelectUser(person.id); onClose() }}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-50 text-left transition-shadow hover:shadow-md"
                >
                  <FollowToggleBadge userId={person.id} />
                  <div className="flex flex-col items-center gap-3 px-4 py-6">
                    <div className="relative h-16 w-16 overflow-hidden rounded-full bg-gray-100">
                      <Image src={person.avatar_url || '/images/image-avatar.svg'} alt="" fill className="object-cover" />
                    </div>
                    <div className="flex flex-col items-center gap-0.5 text-center">
                      <span className="font-poppins text-body-s font-semibold text-primary-500">{person.display_name || person.username}</span>
                      <span className="font-poppins text-[12px] text-gray-400">{person.followers_count.toLocaleString()} followers</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!isLoading && data?.has_next && !query && (
            <div className="flex justify-center pt-6">
              <button onClick={() => setPage((p) => p + 1)} className="rounded-full border border-primary-500 px-6 py-2 font-poppins text-body-s font-medium text-primary-500 hover:bg-primary-50">
                Load more
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
