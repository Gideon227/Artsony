'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { UserPlus, UserCheck } from 'lucide-react'
import { useFollowers, useFollowing, useIsFollowing, useToggleFollow } from '@/hooks/use-follow'
import { useAuthStore } from '@/store'
import type { FollowUser } from '@/types/social'
import { SearchInput } from '@/components/ui/search-input'

interface Props {
  userId: string
  type: 'followers' | 'following'
  totalCount: number
  onClose: () => void
  onSelectUser: (userId: string) => void
}

// The design needs a cover photo, a profession line, a country and three recent
// works per person. Your FollowUser type may not have these yet, so they're
// declared here as optional. Rename them to match what your API actually returns
// (see the mapping notes in `PersonCard`).
type FollowUserCardData = FollowUser & {
  cover_url?: string | null
  profession?: string | null
  country?: string | null
  recent_artworks?: { id: string; thumbnail_url?: string | null }[]
}

// ── Icons (no <mask> ids, so rendering the same icon twice in the DOM is safe) ──
function CircleIconButton({
  label,
  onClick,
  children,
  className = '',
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={` flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-gray-50 transition-colors hover:bg-gray-50 ${className}`}
    >
      {children}
    </button>
  )
}

const CloseGlyph = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M30 20C30 25.5228 25.5228 30 20 30C14.4772 30 10 25.5228 10 20C10 14.4772 14.4772 10 20 10C25.5228 10 30 14.4772 30 20ZM16.9696 16.9696C17.2625 16.6768 17.7374 16.6768 18.0303 16.9696L20 18.9393L21.9696 16.9697C22.2625 16.6768 22.7374 16.6768 23.0303 16.9697C23.3232 17.2626 23.3232 17.7374 23.0303 18.0303L21.0606 20L23.0303 21.9696C23.3232 22.2625 23.3232 22.7374 23.0303 23.0303C22.7374 23.3232 22.2625 23.3232 21.9696 23.0303L20 21.0607L18.0303 23.0303C17.7374 23.3232 17.2625 23.3232 16.9696 23.0303C16.6768 22.7374 16.6768 22.2625 16.9696 21.9697L18.9393 20L16.9696 18.0303C16.6767 17.7374 16.6767 17.2625 16.9696 16.9696Z"
      fill="#525965"
    />
  </svg>
)

const SearchGlyph = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M19.5 10.75C14.6675 10.75 10.75 14.6675 10.75 19.5C10.75 24.3325 14.6675 28.25 19.5 28.25C24.3325 28.25 28.25 24.3325 28.25 19.5C28.25 14.6675 24.3325 10.75 19.5 10.75ZM9.25 19.5C9.25 13.8391 13.8391 9.25 19.5 9.25C25.1609 9.25 29.75 13.8391 29.75 19.5C29.75 22.0605 28.8111 24.4017 27.2589 26.1982L30.5303 29.4697C30.8232 29.7626 30.8232 30.2374 30.5303 30.5303C30.2374 30.8232 29.7626 30.8232 29.4697 30.5303L26.1982 27.2589C24.4017 28.8111 22.0605 29.75 19.5 29.75C13.8391 29.75 9.25 25.1609 9.25 19.5Z"
      fill="#525965"
    />
  </svg>
)

// The viewer's own follow/unfollow state for *this listed person*.
// variant "card": floats over the cover photo (desktop). variant "row": sits at the end of a list row (mobile).
function FollowToggleBadge({ userId, variant }: { userId: string; variant: 'card' | 'row' }) {
  const { user: currentUser } = useAuthStore()
  const { data: isFollowing } = useIsFollowing(userId)
  const { mutate: toggle, isPending } = useToggleFollow(userId)

  if (currentUser?.id === userId) return null

  const base =
    'flex shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors disabled:opacity-60'

  const styles =
    variant === 'card'
      ? `absolute left-4 top-4 z-10 h-10 w-10 ${
          isFollowing
            ? 'bg-primary-500 text-white'
            : 'border-2 border-white/90 bg-black/10 text-white backdrop-blur-sm hover:bg-black/25'
        }`
      : `h-9 w-9 ${
          isFollowing
            ? 'bg-primary-500 text-white'
            : 'border-2 border-gray-50 bg-white text-gray-500 hover:bg-gray-50'
        }`

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        toggle()
      }}
      disabled={isPending}
      aria-label={isFollowing ? 'Unfollow' : 'Follow'}
      className={`${base} ${styles}`}
    >
      {isFollowing ? <UserCheck size={18} /> : <UserPlus size={18} />}
    </button>
  )
}

// ── Desktop: profile card ─────────────────────────────────────────────────────
// A div with role="button" (not a <button>) because the follow badge inside it is
// a real <button>, and nesting buttons is invalid HTML.
function PersonCard({ person, onOpen }: { person: FollowUserCardData; onOpen: () => void }) {
  const thumbs = (person.recent_artworks ?? []).filter((a) => a.thumbnail_url).slice(0, 3)
  const subtitle = person.profession ?? `${person.followers_count.toLocaleString()} followers`

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-gray-50 bg-white text-left transition-shadow hover:shadow-md"
    >
      {/* Cover */}
      <div className="relative h-[72px] w-full bg-gradient-to-br from-gray-100 to-gray-50">
        {person.cover_url && (
          <Image src={person.cover_url} alt="" fill sizes="280px" className="object-cover" />
        )}
      </div>

      <FollowToggleBadge userId={person.id} variant="card" />

      {/* Avatar straddles the bottom edge of the cover */}
      <div className="relative z-[1] -mt-9 flex justify-center">
        <div className="relative h-[72px] w-[72px] overflow-hidden rounded-full border-[3px] border-white bg-gray-100">
          <Image src={person.avatar_url || '/images/image-avatar.svg'} alt="" fill sizes="72px" className="object-cover" />
        </div>
      </div>

      {/* Text */}
      <div className="flex flex-col items-center gap-1 px-4 pb-5 pt-3 text-center">
        <span className="max-w-full truncate font-raleway text-body-m font-medium text-primary-500">
          {person.display_name || person.username}
        </span>
        <span className="max-w-full truncate font-poppins text-body-xs text-heading">{subtitle}</span>
        {person.country && (
          <span className="max-w-full truncate font-poppins text-body-xs text-text-disabled">{person.country}</span>
        )}
      </div>

      {/* Recent works strip (hidden if the API sends none) */}
      {thumbs.length > 0 && (
        <div className="mt-auto grid h-[70px] grid-cols-3">
          {thumbs.map((art) => (
            <div key={art.id} className="relative h-full w-full bg-gray-50">
              <Image src={art.thumbnail_url!} alt="" fill sizes="100px" className="object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Mobile: list row ──────────────────────────────────────────────────────────
function PersonRow({ person, onOpen }: { person: FollowUserCardData; onOpen: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
      className="flex cursor-pointer items-center gap-3 py-2"
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-gray-50 bg-gray-100">
        <Image src={person.avatar_url || '/images/image-avatar.svg'} alt="" fill sizes="48px" className="object-cover" />
      </div>
      <span className="min-w-0 flex-1 truncate font-poppins text-body-s font-medium text-body">
        {person.display_name || person.username}
      </span>
      <FollowToggleBadge userId={person.id} variant="row" />
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function ProfileFollowersModal({ userId, type, totalCount, onClose, onSelectUser }: Props) {
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [accumulated, setAccumulated] = useState<FollowUser[]>([])
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  const followersQuery = useFollowers(type === 'followers' ? userId : '', page)
  const followingQuery = useFollowing(type === 'following' ? userId : '', page)
  const { data, isLoading } = type === 'followers' ? followersQuery : followingQuery

  useEffect(() => {
    if (!data?.data) return

    setAccumulated((prev) => {
      if (page === 1) return data.data

      const newItems = data.data.filter((newItem: FollowUser) => !prev.some((p) => p.id === newItem.id))
      return [...prev, ...newItems]
    })
  }, [data, page])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  // No search param exists on listFollowers/listFollowing, so this filters
  // whatever pages have already loaded.
  const visible = useMemo(() => {
    if (!query.trim()) return accumulated
    const q = query.trim().toLowerCase()
    return accumulated.filter(
      (u) => u.username.toLowerCase().includes(q) || u.display_name?.toLowerCase().includes(q)
    )
  }, [accumulated, query])

  const label = type === 'followers' ? 'Followers' : 'Following'
  const countLabel = `(${totalCount.toLocaleString()})`

  const openPerson = (id: string) => {
    onSelectUser(id)
    onClose()
  }

  const emptyText = query
    ? 'No one matches that search.'
    : type === 'followers'
      ? 'No followers yet.'
      : 'Not following anyone yet.'

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/40" onClick={onClose}>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 320 }}
        onClick={(e) => e.stopPropagation()}
        className="flex h-dvh w-full flex-col overflow-hidden bg-white shadow-2xl lg:h-[calc(100dvh-5rem)] lg:w-[92vw] lg:max-w-[1200px] lg:rounded-t-[40px]"
      >
        {/* ── Mobile header: close · title · search toggle ── */}
        <div className="shrink-0 border-b border-gray-50 bg-white px-4 py-4 lg:hidden">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <CircleIconButton label="Close" onClick={onClose}>
                <CloseGlyph />
              </CircleIconButton>
              <h2 className="font-raleway text-h6 font-medium text-body">{label}</h2>
            </div>

            <CircleIconButton
              label="Search"
              onClick={() => setShowMobileSearch((prev) => !prev)}
            >
              <SearchGlyph />
            </CircleIconButton>
          </div>

          {showMobileSearch && (
            <div className="mt-4 w-full">
              <SearchInput
                value={query}
                onChange={setQuery}
                leftIconPath="/home/magnifier.svg"
                rightIconPath="/icons/cancel.svg"
                placeholder="Search Username"
              />
            </div>
          )}
        </div>

        {/* ── Desktop header: title · search · close ── */}
        <div className="hidden shrink-0 items-center gap-8 border-b border-gray-50 bg-white px-8 py-6 lg:flex">
          <h2 className="shrink-0 font-raleway text-h5 font-medium text-heading">
            {label} <span className="ml-2 text-primary-500">{countLabel}</span>
          </h2>

          <div className="flex-1">
            <SearchInput
              value={query}
              onChange={setQuery}
              leftIconPath="/home/magnifier.svg"
              rightIconPath="/icons/cancel.svg"
              placeholder="Search Username"
            />
          </div>

          <CircleIconButton label="Close" onClick={onClose}>
            <CloseGlyph />
          </CircleIconButton>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-4 pb-8 lg:bg-[#E8F3F3] lg:p-8">
          {/* Mobile section heading */}
          <h3 className="pb-4 pt-6 font-raleway text-h6 font-medium text-heading lg:hidden">
            {label} <span className="ml-1 text-primary-500">{countLabel}</span>
          </h3>

          {isLoading && page === 1 ? (
            <>
              {/* mobile skeleton */}
              <div className="flex flex-col gap-4 lg:hidden">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-12 w-12 animate-pulse rounded-full bg-gray-50" />
                    <div className="h-4 flex-1 animate-pulse rounded bg-gray-50" />
                    <div className="h-9 w-9 animate-pulse rounded-full bg-gray-50" />
                  </div>
                ))}
              </div>
              {/* desktop skeleton */}
              <div className="hidden grid-cols-4 gap-6 lg:grid">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-[280px] animate-pulse rounded-3xl bg-white/70" />
                ))}
              </div>
            </>
          ) : visible.length === 0 ? (
            <p className="py-12 text-center font-poppins text-body-s text-gray-400">{emptyText}</p>
          ) : (
            <>
              {/* Mobile list */}
              <div className="flex flex-col lg:hidden">
                {visible.map((person) => (
                  <PersonRow
                    key={person.id}
                    person={person as FollowUserCardData}
                    onOpen={() => openPerson(person.id)}
                  />
                ))}
              </div>

              {/* Desktop card grid */}
              <div className="hidden grid-cols-4 gap-6 lg:grid">
                {visible.map((person) => (
                  <PersonCard
                    key={person.id}
                    person={person as FollowUserCardData}
                    onOpen={() => openPerson(person.id)}
                  />
                ))}
              </div>
            </>
          )}

          {!isLoading && data?.has_next && !query && (
            <div className="flex justify-center pt-6">
              <button
                onClick={() => setPage((p) => p + 1)}
                className="cursor-pointer rounded-full border border-primary-500 bg-white px-6 py-2 font-poppins text-body-s font-medium text-primary-500 hover:bg-primary-50"
              >
                Load more
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}