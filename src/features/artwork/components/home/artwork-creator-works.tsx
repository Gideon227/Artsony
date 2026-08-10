'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { ArtCard } from '@/components/ui/art-card'
import { artworkService } from '@/services/artwork.service'
import { useQuickAddToCart } from '@/hooks/use-cart-actions'
import type { Artwork, ListingType } from '@/types/artwork'

interface ArtworkCreatorWorksProps {
  title: string
  creatorId: string
  creatorName: string
  excludeArtworkId: string
  /** 'all' → "Also by" (every listing type). 'marketplace' → "For sale by" (priced pieces only). */
  scope: 'all' | 'marketplace'
  onSelectArtwork: (artwork: Artwork) => void
}

export function ArtworkCreatorWorks({
  title,
  creatorId,
  creatorName,
  excludeArtworkId,
  scope,
  onSelectArtwork,
}: ArtworkCreatorWorksProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const { quickAdd } = useQuickAddToCart()

  const filters = {
    creator_id: creatorId,
    status: 'PUBLISHED' as const,
    visibility: 'PUBLIC' as const,
    limit: 10,
    ...(scope === 'marketplace' ? { listing_type: 'MARKETPLACE' as ListingType } : {}),
  }

  const { data, isLoading } = useQuery({
    queryKey: ['artworks', 'by-creator', creatorId, scope, excludeArtworkId],
    queryFn: () => artworkService.list(filters),
    enabled: Boolean(creatorId),
  })

  const works = (data?.data ?? []).filter((a) => a.id !== excludeArtworkId)

  const scroll = (direction: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: direction === 'left' ? -300 : 300, behavior: 'smooth' })
  }

  if (!isLoading && works.length === 0) return null

  return (
    <div className="py-6">
      <h3 className="mb-4 font-poppins text-[15px] text-gray-800">
        {title}{' '}
        <Link href={`/profile/${creatorId}`} className="font-semibold text-primary-500 hover:underline">
          {creatorName}
        </Link>
      </h3>

      <div className="relative">
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-[280px] w-[220px] shrink-0 animate-pulse rounded-[24px] bg-gray-50" />
              ))
            : works.map((work) => {
                const asset = work.assets?.[0]
                const img = asset?.thumbnail_url || asset?.optimized_url || asset?.original_url || '/placeholder.png'
                const artistName = work.creator?.profile?.display_name || work.creator?.username || 'Unknown artist'

                return (
                  <div key={work.id} className="w-[220px] shrink-0">
                    <ArtCard
                      image={img}
                      title={work.title}
                      onCardClick={() => onSelectArtwork(work)}
                      showVideo={asset?.media_type === 'VIDEO'}
                      showCart={scope === 'marketplace'}
                      onAction={(action) => {
                        if (action === 'cart') quickAdd(work)
                      }}
                      price={scope === 'marketplace' ? `$${work.price?.toLocaleString('en-US') ?? '—'}` : undefined}
                      stats={{ likes: String(work.like_count), views: String(work.view_count) }}
                      artist={[
                        {
                          id: work.creator_id,
                          name: artistName,
                          avatarUrl: work.creator?.profile?.avatar_url || '/images/image-avatar.svg',
                        },
                      ]}
                      variant="standard"
                    />
                  </div>
                )
              })}
        </div>

        {!isLoading && works.length > 2 && (
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll for more"
            className="absolute right-2 top-[90px] flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-white shadow-md transition-transform hover:scale-105"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
