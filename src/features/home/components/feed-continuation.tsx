'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArtCard } from '@/components/ui/art-card'
import { ArtworkGridSkeleton } from './artwork-grid-skeleton'
import type { Artwork } from '@/types/artwork'

interface FeedContinuationProps {
  artworks: Artwork[]
  isLoading: boolean
  hasNextPage?: boolean
  isFetchingNextPage: boolean
  onLoadMore: () => void
  onArtworkClick: (artwork: Artwork) => void
}

export function FeedContinuation({ artworks, isLoading, hasNextPage, isFetchingNextPage, onLoadMore, onArtworkClick }: FeedContinuationProps) {
  if (!isLoading && artworks.length === 0) return null

  return (
    <section className="w-full py-6 md:py-10">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        {isLoading ? (
          <ArtworkGridSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
            {artworks.map((artwork, i) => (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.4 }}
                className="flex justify-center"
              >
                <ArtCard
                  image={artwork.assets[0]?.thumbnail_url ?? artwork.assets[0]?.optimized_url ?? artwork.assets[0]?.original_url ?? ''}
                  title={artwork.title}
                  artworkId={artwork.id}
                  onCardClick={() => onArtworkClick(artwork)}
                  showVideo={artwork.assets[0]?.media_type === 'VIDEO'}
                  artist={[{
                    id: artwork.creator?.id || artwork.creator_id,
                    name: artwork.creator?.profile?.display_name || artwork.creator?.username || 'Artist',
                    avatarUrl: artwork.creator?.profile?.avatar_url ?? '/images/image-avatar.svg',
                    role: artwork.creator?.role || 'Artist',
                    stats: {
                      followers: String(artwork.creator?.profile?.followers_count ?? 0),
                      likes: String(artwork.like_count ?? 0),
                      following: String(artwork.creator?.profile?.following_count ?? 0),
                    },
                  }]}
                  stats={{ likes: String(artwork.like_count), views: String(artwork.view_count) }}
                  variant="standard"
                />
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && hasNextPage && (
          <div className="flex justify-center pt-10">
            <Button variant="outline" onClick={onLoadMore} isLoading={isFetchingNextPage} loadingText="Loading more…">
              Load More
            </Button>
          </div>
        )}

        {!isLoading && !hasNextPage && artworks.length > 0 && (
          <p className="text-center font-poppins text-[13px] text-neutral-400 pt-8">
            You&apos;ve seen it all — for now.
          </p>
        )}
      </div>
    </section>
  )
}