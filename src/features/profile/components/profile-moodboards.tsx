'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Menu, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMoodboards, useUserMoodboards } from '@/hooks/use-moodboards'
import { CreateMoodboardDialog } from '@/features/moodboards/components/create-moodboard-dialog'
import type { MoodboardSummary } from '@/features/moodboards/types'
import { ProfileMoodboardDetail } from './profile-moodboard-detail'
import type { Artwork } from '@/types/artwork'

interface Props {
  isOwnProfile: boolean
  /** Whose boards to show when `isOwnProfile` is false. */
  userId?: string
  onArtworkClick: (artwork: Artwork, list: Artwork[]) => void
}

// ─── Empty moodboard artwork (orange / dark / teal diagonal stripes) ────────
function EmptyMoodboardPattern() {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <rect width="100" height="100" fill="#F15A2B" />
      <polygon points="30,0 75.3,0 46.7,100 2.6,100" fill="#04282F" />
      <polygon points="75.3,0 98.2,0 69.3,100 46.7,100" fill="#8DC6C8" />
    </svg>
  )
}

// Closed-eye icon (shown on private boards)
function ClosedEyeIcon() {
  return (
    <svg
      width="26"
      height="18"
      viewBox="0 0 24 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-label="Private moodboard"
      role="img"
    >
      <path d="M2 5c3 5 17 5 20 0" />
      <path d="M12 11v3M6.5 9.5 5 12M17.5 9.5 19 12M3 7l-1.5 2M21 7l1.5 2" />
    </svg>
  )
}

// ─── One moodboard card ─────────────────────────────────────────────────────
function MoodboardCard({
  board,
  onOpen,
  onMenu,
  readOnly = false,
}: {
  board: MoodboardSummary & { is_private?: boolean }
  onOpen: () => void
  onMenu?: (board: MoodboardSummary) => void
  readOnly?: boolean
}) {
  const isEmpty = board.artwork_count === 0

  return (
    <div className="group relative pt-4 ">
      {/* Stacked layers peeking out behind the card */}
      <span
        aria-hidden="true"
        className="absolute inset-x-[10%] top-0 h-10 rounded-t-3xl bg-[#CFE5E8] transition-transform duration-300 group-hover:-translate-y-0.5"
      />
      <span
        aria-hidden="true"
        className="absolute inset-x-[4%] top-2 h-10 rounded-t-3xl bg-[#8DC6C8] transition-transform duration-300 group-hover:-translate-y-0.5"
      />

      {/* Front card */}
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-gray-50">
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Open moodboard: ${board.title}`}
          className="absolute inset-0 cursor-pointer text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          {board.cover_thumbnail_url ? (
            // First artwork of the moodboard (image / video poster / 3D preview)
            <Image
              src={board.cover_thumbnail_url}
              alt=""
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : isEmpty ? (
            <EmptyMoodboardPattern />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Image src="/icons/moodboard-grey.svg" width={32} height={32} alt="" className="opacity-40" />
            </div>
          )}

          {/* Hover state: dim overlay + title (bottom-left) + count (bottom-right) */}
          <div className="absolute inset-0 flex items-end justify-between gap-4 bg-black/40 px-6 pb-6 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">
            <span className="truncate font-poppins text-[16px] font-medium tracking-wide">{board.title}</span>
            <span className="shrink-0 font-poppins text-[16px] font-medium">{board.artwork_count}</span>
          </div>
        </button>

        {/* Hover state: menu button + private indicator (top-left) */}
        <div className="pointer-events-none absolute left-6 top-6 flex items-center gap-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 [@media(hover:none)]:opacity-100">
          {!readOnly && (
            <button
              type="button"
              aria-label="Moodboard options"
              onClick={() => onMenu?.(board)}
              className="pointer-events-auto flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-white/90 backdrop-blur-sm transition-transform hover:scale-110 active:scale-95"
            >
              <Menu size={20} strokeWidth={2} />
            </button>
          )}
          {board.is_private && <ClosedEyeIcon />}
        </div>
      </div>
    </div>
  )
}

export function ProfileMoodboards({ isOwnProfile, userId, onArtworkClick }: Props) {
  // Only the relevant query is enabled; the other stays idle.
  const ownBoards = useMoodboards({ enabled: isOwnProfile })
  const otherBoards = useUserMoodboards(isOwnProfile ? undefined : userId)
  const { data: moodboards, isLoading, isError, refetch, isRefetching } = isOwnProfile ? ownBoards : otherBoards
  const [showCreate, setShowCreate] = useState(false)
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null)

  if (activeBoardId) {
    return (
      <ProfileMoodboardDetail
        moodboardId={activeBoardId}
        onBack={() => setActiveBoardId(null)}
        onSelectArtwork={onArtworkClick}
        isOwnProfile={isOwnProfile}
      />
    )
  }

  if (!isOwnProfile && !isLoading && !isError && moodboards?.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center pb-24">
        <h3 className="font-poppins text-body-l font-semibold text-heading">No moodboards yet</h3>
        <p className="max-w-sm font-poppins text-body-s text-gray-400">
          This artist hasn&apos;t created any moodboards.
        </p>
      </div>
    )
  }

  if (moodboards?.length === 0) {
    return (
      <div className='flex flex-col w-full items-center justify-center pt-12 pb-26 gap-y-12'>
        <div className='relative flex m-auto items-center justify-center w-[317px] h-[186px] lg:w-[500px] lg:h-[293px]'>
          <Image src='/illustrations/empty-moodboard.svg' fill alt='empty moodboard' />
        </div>

        <div className='flex flex-col gap-y-6 items-center justify-center w-full lg:w-[500px]'>
          <div className='flex flex-col gap-y-4 items-center justify-center'>
            <h6 className='font-poppins font-medium text-[16px] lg:text-[20px] text-center text-heading'>Create Your First Moodboard</h6>
            <p className='font-poppins font-light text-[12px] lg:text-[16px] text-body text-center'>Save and organize artwork you love into moodboards made for your ideas, inspiration, and creative projects.</p>
          </div>

          <Button onClick={() => setShowCreate(true)} leftIcon='/icons/plus-white-bg.svg' className='px-6 py-3 w-[206px]'>New Moodboards</Button>
        </div>
      </div>
    )
  }


  const gridClass = 'grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 lg:grid-cols-4'

  return (
    <div className="flex flex-col gap-6 px-4 py-8 md:px-8 max-lg:pb-26">
      {isLoading ? (
        <div className={gridClass}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="pt-4">
              <div className="aspect-square animate-pulse rounded-3xl bg-gray-50" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div role="alert" className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="font-poppins text-body-s text-gray-400">{isOwnProfile ? 'We couldn\u2019t load your moodboards.' : 'We couldn\u2019t load these moodboards.'}</p>
          <Button variant="outline" onClick={() => void refetch()} isLoading={isRefetching}>
            Retry
          </Button>
        </div>
      ) : (
        <div className={gridClass}>
          {moodboards?.map((board: any) => (
            <MoodboardCard
              key={board.id}
              board={board}
              onOpen={() => setActiveBoardId(board.id)}
              readOnly={!isOwnProfile}
            />
          ))}

          {/* Add new — owner only. Same pt-4 so it lines up with the stacked cards */}
          {isOwnProfile && (
          <div className="pt-4">
            <button
              onClick={() => setShowCreate(true)}
              className="flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-primary-500 text-center transition-colors hover:bg-primary-50"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-500 text-white">
                <Plus size={22} />
              </span>
              <span className="font-poppins text-body-s font-medium text-gray-500">Add New Collection</span>
            </button>
          </div>
          )}
        </div>
      )}

      {isOwnProfile && (
        <CreateMoodboardDialog open={showCreate} onOpenChange={setShowCreate} onCreated={(id) => setActiveBoardId(id)} />
      )}
    </div>
  )
}