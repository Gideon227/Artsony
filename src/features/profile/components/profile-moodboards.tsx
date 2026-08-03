'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Plus } from 'lucide-react'
import { useMoodboards } from '@/hooks/use-moodboards'
import { CreateMoodboardDialog } from '@/features/moodboards/components/create-moodboard-dialog'
import { ProfileMoodboardDetail } from './profile-moodboard-detail'
import type { Artwork } from '@/types/artwork'

interface Props {
  isOwnProfile: boolean
  onArtworkClick: (artwork: Artwork, list: Artwork[]) => void
}

export function ProfileMoodboards({ isOwnProfile, onArtworkClick }: Props) {
  const { data: moodboards, isLoading } = useMoodboards()
  const [showCreate, setShowCreate] = useState(false)
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null)

  if (!isOwnProfile) {
    // `moodboardService.list()` is scoped to the signed-in user — there's no
    // documented endpoint for fetching *another* user's moodboards yet, so
    // this stays an honest placeholder rather than silently showing the
    // viewer's own boards on someone else's profile.
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <h3 className="font-poppins text-body-l font-semibold text-heading">Moodboards aren&apos;t viewable yet</h3>
        <p className="max-w-sm font-poppins text-body-s text-gray-400">
          Viewing another artist&apos;s moodboards is coming soon.
        </p>
      </div>
    )
  }

  if (activeBoardId) {
    return (
      <ProfileMoodboardDetail
        moodboardId={activeBoardId}
        onBack={() => setActiveBoardId(null)}
        onSelectArtwork={onArtworkClick}
      />
    )
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-8 md:px-8">
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-2xl bg-gray-50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {moodboards?.map((board) => {
            // MoodboardSummary (the list endpoint's shape) only carries
            // id/title/artwork_count — no thumbnail. Fetching each board's
            // full detail just to render a cover image would be an N+1 query
            // for a grid; flagging this as a backend enhancement (a
            // `cover_thumbnail_url` on the list response) rather than faking it.
            return (
              <button
                key={board.id}
                onClick={() => setActiveBoardId(board.id)}
                className="group relative flex aspect-square flex-col justify-end overflow-hidden rounded-2xl bg-gray-50 text-left"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image src="/icons/moodboard-grey.svg" width={32} height={32} alt="" className="opacity-40" />
                </div>
                <div className="relative flex items-center justify-between bg-gradient-to-t from-black/70 via-black/10 to-transparent px-4 py-3 text-white">
                  <span className="truncate font-poppins text-[14px] font-medium">{board.title}</span>
                  <span className="shrink-0 font-poppins text-[13px]">{board.artwork_count}</span>
                </div>
              </button>
            )
          })}

          <button
            onClick={() => setShowCreate(true)}
            className="flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary-500 text-center transition-colors hover:bg-primary-50"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-500 text-white">
              <Plus size={22} />
            </span>
            <span className="font-poppins text-body-s font-medium text-gray-500">Add New Collection</span>
          </button>
        </div>
      )}

      <CreateMoodboardDialog open={showCreate} onOpenChange={setShowCreate} onCreated={(id) => setActiveBoardId(id)} />
    </div>
  )
}
