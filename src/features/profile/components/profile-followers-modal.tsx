'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { X, Search, UserPlus, UserCheck } from 'lucide-react'
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
      className={`cursor-pointer absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-white transition-colors disabled:opacity-60 ${isFollowing ? 'bg-gray-400' : 'bg-primary-500'}`}
    >
      {isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
    </button>
  )
}

export function ProfileFollowersModal({ userId, type, totalCount, onClose, onSelectUser }: Props) {
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [accumulated, setAccumulated] = useState<FollowUser[]>([])
  const [showMobileSearch, setShowMobileSearch] = useState<boolean>(false)

  const followersQuery = useFollowers(type === 'followers' ? userId : '', page)
  const followingQuery = useFollowing(type === 'following' ? userId : '', page)
  const { data, isLoading } = type === 'followers' ? followersQuery : followingQuery

  useEffect(() => {
    if (!data?.data) return
    
    setAccumulated((prev) => {
      if (page === 1) return data.data;
      
      const newItems = data.data.filter(
        (newItem: FollowUser) => !prev.some((p) => p.id === newItem.id)
      );
      
      return [...prev, ...newItems];
    });
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
        className="flex h-screen lg:h-[calc(100vh-5rem)] w-full lg:w-[92vw] lg:max-w-[900px] flex-col overflow-hidden lg:rounded-t-2xl bg-white shadow-2xl"
      >
        <div className="flex shrink-0 flex-col gap-4 lg:gap-8 border-b border-gray-50 px-4 p-4 md:py-6 md:flex-row md:items-center md:px-8">
          
          <div className="flex items-center justify-between gap-4 md:contents">
            <div className='flex items-center gap-4'>
              <button onClick={onClose} aria-label="Close" className='lg:hidden cursor-pointer'>
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <mask id="path-1-inside-1_10770_249" fill="white">
                    <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z"/>
                  </mask>
                  <path d="M0 20M40 20M40 20M0 20M20 0M40 20M20 40M0 20M20 40V38C10.0589 38 2 29.9411 2 20H0H-2C-2 32.1503 7.84974 42 20 42V40ZM40 20H38C38 29.9411 29.9411 38 20 38V40V42C32.1503 42 42 32.1503 42 20H40ZM20 0V2C29.9411 2 38 10.0589 38 20H40H42C42 7.84974 32.1503 -2 20 -2V0ZM20 0V-2C7.84974 -2 -2 7.84974 -2 20H0H2C2 10.0589 10.0589 2 20 2V0Z" fill="#E6E8EB" mask="url(#path-1-inside-1_10770_249)"/>
                  <path d="M30 20C30 25.5228 25.5228 30 20 30C14.4772 30 10 25.5228 10 20C10 14.4772 14.4772 10 20 10C25.5228 10 30 14.4772 30 20ZM16.9696 16.9696C17.2625 16.6768 17.7374 16.6768 18.0303 16.9696L20 18.9393L21.9696 16.9697C22.2625 16.6768 22.7374 16.6768 23.0303 16.9697C23.3232 17.2626 23.3232 17.7374 23.0303 18.0303L21.0606 20L23.0303 21.9696C23.3232 22.2625 23.3232 22.7374 23.0303 23.0303C22.7374 23.3232 22.2625 23.3232 21.9696 23.0303L20 21.0607L18.0303 23.0303C17.7374 23.3232 17.2625 23.3232 16.9696 23.0303C16.6768 22.7374 16.6768 22.2625 16.9696 21.9697L18.9393 20L16.9696 18.0303C16.6767 17.7374 16.6767 17.2625 16.9696 16.9696Z" fill-rule="evenodd" clip-rule="evenodd" fill="#525965"/>
                </svg>
              </button>

              <h2 className="shrink-0 font-raleway text-h6 font-semibold text-heading">
                {type === 'followers' ? 'Followers' : 'Following'} <span className="text-primary-500">({totalCount.toLocaleString()})</span>
              </h2>
            </div>

            <button onClick={() => setShowMobileSearch((prev) => !prev)} className='cursor-pointer lg:hidden'>
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <mask id="path-1-inside-1_10770_253" fill="white">
                  <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z"/>
                </mask>
                <path d="M0 20M40 20M40 20M0 20M20 0M40 20M20 40M0 20M20 40V38C10.0589 38 2 29.9411 2 20H0H-2C-2 32.1503 7.84974 42 20 42V40ZM40 20H38C38 29.9411 29.9411 38 20 38V40V42C32.1503 42 42 32.1503 42 20H40ZM20 0V2C29.9411 2 38 10.0589 38 20H40H42C42 7.84974 32.1503 -2 20 -2V0ZM20 0V-2C7.84974 -2 -2 7.84974 -2 20H0H2C2 10.0589 10.0589 2 20 2V0Z" fill="#E6E8EB" mask="url(#path-1-inside-1_10770_253)"/>
                <path d="M19.5 10.75C14.6675 10.75 10.75 14.6675 10.75 19.5C10.75 24.3325 14.6675 28.25 19.5 28.25C24.3325 28.25 28.25 24.3325 28.25 19.5C28.25 14.6675 24.3325 10.75 19.5 10.75ZM9.25 19.5C9.25 13.8391 13.8391 9.25 19.5 9.25C25.1609 9.25 29.75 13.8391 29.75 19.5C29.75 22.0605 28.8111 24.4017 27.2589 26.1982L30.5303 29.4697C30.8232 29.7626 30.8232 30.2374 30.5303 30.5303C30.2374 30.8232 29.7626 30.8232 29.4697 30.5303L26.1982 27.2589C24.4017 28.8111 22.0605 29.75 19.5 29.75C13.8391 29.75 9.25 25.1609 9.25 19.5Z" fill-rule="evenodd" clip-rule="evenodd" fill="#525965"/>
              </svg>
            </button>
          </div>

          {/* Desktop Wrapper (Hidden on mobile) */}
          <div className='relative max-lg:hidden flex items-center gap-4 flex-1 max-md:mt-4'>
            <SearchInput value={query} onChange={setQuery} leftIconPath={'home/magnifier.svg'} rightIconPath={'/icons/cancel.svg'} placeholder="Search Username" />
            
            <button onClick={onClose} aria-label="Close" className="cursor-pointer hidden lg:flex hover:bg-gray-50">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <mask id="path-1-inside-1_10780_25468" fill="white">
                  <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z"/>
                </mask>
                <path d="M0 20M40 20M40 20M0 20M20 0M40 20M20 40M0 20M20 40V38C10.0589 38 2 29.9411 2 20H0H-2C-2 32.1503 7.84974 42 20 42V40ZM40 20H38C38 29.9411 29.9411 38 20 38V40V42C32.1503 42 42 32.1503 42 20H40ZM20 0V2C29.9411 2 38 10.0589 38 20H40H42C42 7.84974 32.1503 -2 20 -2V0ZM20 0V-2C7.84974 -2 -2 7.84974 -2 20H0H2C2 10.0589 10.0589 2 20 2V0Z" fill="#E6E8EB" mask="url(#path-1-inside-1_10780_25468)"/>
                <path d="M30 20C30 25.5228 25.5228 30 20 30C14.4772 30 10 25.5228 10 20C10 14.4772 14.4772 10 20 10C25.5228 10 30 14.4772 30 20ZM16.9696 16.9696C17.2625 16.6768 17.7374 16.6768 18.0303 16.9696L20 18.9393L21.9696 16.9697C22.2625 16.6768 22.7374 16.6768 23.0303 16.9697C23.3232 17.2626 23.3232 17.7374 23.0303 18.0303L21.0606 20L23.0303 21.9696C23.3232 22.2625 23.3232 22.7374 23.0303 23.0303C22.7374 23.3232 22.2625 23.3232 21.9696 23.0303L20 21.0607L18.0303 23.0303C17.7374 23.3232 17.2625 23.3232 16.9696 23.0303C16.6768 22.7374 16.6768 22.2625 16.9696 21.9697L18.9393 20L16.9696 18.0303C16.6767 17.7374 16.6767 17.2625 16.9696 16.9696Z" fill-rule="evenodd" clip-rule="evenodd" fill="#525965"/>
              </svg>
            </button>
          </div>

          {/* Mobile Wrapper (Renders below header when toggled) */}
          {showMobileSearch && (
            <div className="lg:hidden w-full">
              <SearchInput value={query} onChange={setQuery} leftIconPath={'home/magnifier.svg'} rightIconPath={'/icons/cancel.svg'} placeholder="Search Username" />
            </div>
          )}

          {/* <div className="relative flex-1">
            <Search size={18} className="max-lg:hidden pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
            {showMobileSearch && 
              <Search size={18} className="lg:hidden pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-body" />
            }
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Username"
              className="w-full rounded-full border border-gray-100 py-2.5 pl-11 pr-4 font-poppins text-body-s outline-none focus:border-primary-500"
            />
          </div> */}

          {/* <button onClick={onClose} aria-label="Close" className="cursor-pointer hidden h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-100 text-gray-500 transition-colors hover:bg-gray-50 md:flex">
            <X size={18} />
          </button> */}
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
                  className="cursor-pointer group relative flex flex-col overflow-hidden rounded-2xl border border-gray-50 text-left transition-shadow hover:shadow-md"
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
              <button onClick={() => setPage((p) => p + 1)} className="cursor-pointer rounded-full border border-primary-500 px-6 py-2 font-poppins text-body-s font-medium text-primary-500 hover:bg-primary-50">
                Load more
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
