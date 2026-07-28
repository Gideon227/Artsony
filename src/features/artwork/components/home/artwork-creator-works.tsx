'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, Eye } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { artworkService } from '@/services/artwork.service'
import type { Artwork, ListingType } from '@/types/artwork'

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 10_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  return n.toLocaleString('en-US')
}

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
                <div key={i} className="h-[220px] w-[280px] shrink-0 animate-pulse rounded-[24px] bg-gray-50" />
              ))
            : works.map((work) => {
                const asset = work.assets?.[0]
                const img = asset?.optimized_url || asset?.original_url || '/placeholder.png'

                return (
                  <button
                    key={work.id}
                    onClick={() => onSelectArtwork(work)}
                    className="group flex shrink-0 flex-col gap-3 text-left"
                  >
                    <div className="relative h-[220px] w-[280px] overflow-hidden rounded-[24px] bg-secondary-100">
                      <Image
                        src={img}
                        alt={work.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {asset?.media_type === 'VIDEO' && (
                        <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm">
                          <Image src="/icons/play-icon.svg" width={14} height={14} alt="Video" />
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between rounded-full border border-gray-50 px-3 py-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-gray-100">
                          <Image
                            src={work.creator?.profile?.avatar_url || '/images/image-avatar.svg'}
                            alt={work.creator?.username ?? ''}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="truncate font-poppins text-[13px] text-gray-700">
                          {work.creator?.profile?.display_name || work.creator?.username}
                        </span>
                      </div>

                      {scope === 'marketplace' ? (
                        <span className="shrink-0 font-poppins text-[13px] font-semibold text-primary-500">
                          ${work.price?.toLocaleString() ?? '—'}
                        </span>
                      ) : (
                        <div className="flex shrink-0 items-center gap-3 text-gray-400">
                          <span className="flex items-center gap-1 font-poppins text-[12px]">
                            <Heart size={13} /> {formatCount(work.like_count)}
                          </span>
                          <span className="flex items-center gap-1 font-poppins text-[12px]">
                            <Eye size={13} /> {formatCount(work.view_count)}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
        </div>

        {!isLoading && works.length > 2 && (
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll for more"
            className="absolute right-2 top-[90px] flex h-9 w-9 items-center justify-center rounded-full bg-primary-500 text-white shadow-md transition-transform hover:scale-105"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          </button>
        )}
      </div>
    </div>
  )
}
