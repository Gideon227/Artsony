'use client'

import { ChevronLeft } from 'lucide-react'
import { ArtCard } from '@/components/ui/art-card'
import { Button } from '@/components/ui/button'
import { useMoodboard } from '@/hooks/use-moodboards'
import type { Artwork } from '@/types/artwork'

interface Props {
  moodboardId: string
  onBack: () => void
  onSelectArtwork: (artwork: Artwork, list: Artwork[]) => void
}

const GRID_CLASSES = 'grid grid-cols-1 gap-x-4 gap-y-30 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'

export function ProfileMoodboardDetail({ moodboardId, onBack, onSelectArtwork }: Props) {
  const { data: moodboard, isLoading, isError, refetch, isRefetching } = useMoodboard(moodboardId)
  const artworks = (moodboard?.artworks ?? []) as unknown as Artwork[]

  return (
    <div className="flex flex-col gap-6 px-4 py-8 md:px-8">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 font-poppins text-body-m font-medium text-primary-500 transition-opacity hover:opacity-70"
        >
          <ChevronLeft size={20} /> {moodboard?.title ?? 'Back'}
        </button>
        {moodboard && (
          <span className="font-poppins text-body-s text-gray-400">{artworks.length} Artworks</span>
        )}
      </div>

      {isLoading ? (
        <div className={GRID_CLASSES} aria-busy="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-2xl bg-gray-50" />
          ))}
        </div>
      ) : isError ? (
        <div role="alert" className="flex flex-col items-center gap-3 py-16 text-center">
          <h3 className="font-poppins text-body-l font-semibold text-heading">Couldn&apos;t load this moodboard</h3>
          <Button variant="outline" onClick={() => void refetch()} isLoading={isRefetching}>
            Retry
          </Button>
        </div>
      ) : artworks.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <h3 className="font-poppins text-body-l font-semibold text-heading">No artworks here yet</h3>
          <p className="font-poppins text-body-s text-gray-400">Save artworks to this collection from the artwork view.</p>
        </div>
      ) : (
        <div className={GRID_CLASSES}>
          {artworks.map((art) => (
            <ArtCard
              key={art.id}
              image={art.assets?.[0]?.optimized_url || art.assets?.[0]?.original_url || '/placeholder.jpg'}
              title={art.title}
              onCardClick={() => onSelectArtwork(art, artworks)}
              showVideo={art.assets?.[0]?.media_type === 'VIDEO'}
              showCart={art.listing_type === 'MARKETPLACE'}
              artist={[
                {
                  id: art.creator?.id || art.creator_id,
                  name: art.creator?.profile?.display_name || art.creator?.username || 'Unknown Artist',
                  avatarUrl: art.creator?.profile?.avatar_url || '/images/image-avatar.svg',
                  role: art.creator?.role || 'Artist',
                  stats: {
                    followers: String(art.creator?.profile?.followers_count ?? 0),
                    likes: String(art.like_count ?? 0),
                    following: String(art.creator?.profile?.following_count ?? 0),
                  },
                },
              ]}
              stats={{
                likes: String(art.like_count || 0),
                views: String(art.view_count || 0),
              }}
              variant="standard"
            />
          ))}
        </div>
      )}
    </div>
  )
}
