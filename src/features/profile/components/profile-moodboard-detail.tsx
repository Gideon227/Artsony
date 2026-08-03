'use client'

import Image from 'next/image'
import { ChevronLeft, Heart, Eye } from 'lucide-react'
import { useMoodboard } from '@/hooks/use-moodboards'
import { pickMoodboardThumbnail } from '@/features/moodboards/utils'
import type { MoodboardArtwork } from '@/features/moodboards/types'
import type { Artwork } from '@/types/artwork'

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 10_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  return n.toLocaleString('en-US')
}

// The backend embeds full artwork rows (`artworks(*)`) into a moodboard, but
// the moodboard feature's own type only declares the fields it needs
// (id/title/assets). Creator/price/engagement stats pass through as unknown —
// read defensively here rather than widening the shared type on a guess.
function readField<T>(artwork: MoodboardArtwork, key: string, fallback: T): T {
  const value = (artwork as unknown as Record<string, unknown>)[key]
  return (value as T) ?? fallback
}

interface Props {
  moodboardId: string
  onBack: () => void
  onSelectArtwork: (artwork: Artwork, list: Artwork[]) => void
}

export function ProfileMoodboardDetail({ moodboardId, onBack, onSelectArtwork }: Props) {
  const { data: moodboard, isLoading } = useMoodboard(moodboardId)

  return (
    <div className="flex flex-col gap-6 px-4 py-8 md:px-8">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 font-poppins text-body-m font-medium text-primary-500 transition-opacity hover:opacity-70">
          <ChevronLeft size={20} /> {moodboard?.title ?? 'Back'}
        </button>
        {moodboard && (
          <span className="font-poppins text-body-s text-gray-400">{moodboard.artworks.length} Artworks</span>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-2xl bg-gray-50" />
          ))}
        </div>
      ) : !moodboard || moodboard.artworks.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <h3 className="font-poppins text-body-l font-semibold text-heading">No artworks here yet</h3>
          <p className="font-poppins text-body-s text-gray-400">Save artworks to this collection from the artwork view.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {moodboard.artworks.map((artwork) => {
            const img = pickMoodboardThumbnail(artwork) || '/placeholder.jpg'
            const isForSale = readField(artwork, 'listing_type', '') === 'MARKETPLACE'
            const price = readField<number | null>(artwork, 'price', null)
            const likeCount = readField(artwork, 'like_count', 0)
            const viewCount = readField(artwork, 'view_count', 0)
            const creatorName = readField<string | null>(artwork, 'creator_username', null)
            const creatorAvatar = readField<string | null>(artwork, 'creator_avatar_url', null)

            return (
              <button
                key={artwork.id}
                onClick={() => onSelectArtwork(artwork as unknown as Artwork, moodboard.artworks as unknown as Artwork[])}
                className="group flex flex-col gap-3 text-left"
              >
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-secondary-100">
                  <Image src={img} alt={artwork.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>

                <div className="flex items-center justify-between rounded-full border border-gray-50 px-3 py-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-gray-100">
                      <Image src={creatorAvatar || '/images/image-avatar.svg'} alt="" fill className="object-cover" />
                    </div>
                    <span className="truncate font-poppins text-[13px] text-gray-700">{creatorName || 'Unknown Artist'}</span>
                  </div>

                  {isForSale ? (
                    <span className="shrink-0 font-poppins text-[13px] font-semibold text-primary-500">
                      {price != null ? `$${price.toLocaleString()}` : '—'}
                    </span>
                  ) : (
                    <div className="flex shrink-0 items-center gap-3 text-gray-400">
                      <span className="flex items-center gap-1 font-poppins text-[12px]"><Heart size={13} /> {formatCount(likeCount)}</span>
                      <span className="flex items-center gap-1 font-poppins text-[12px]"><Eye size={13} /> {formatCount(viewCount)}</span>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
