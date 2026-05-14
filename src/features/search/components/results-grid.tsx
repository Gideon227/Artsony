'use client'

import { useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { ArtCard } from '@/components/ui/art-card'
import { Skeleton } from '@/components/ui/skeleton'
import type { Artwork } from '@/types'

// ─── ResultsGrid ──────────────────────────────────────────────────────────────

type ResultsGridProps = {
  artworks: Artwork[]
  isLoading: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  fetchNextPage: () => void
  query: string
  total?: number
}

export function ResultsGrid({
  artworks,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  query,
  total,
}: ResultsGridProps) {
  const observerRef = useRef<IntersectionObserver | null>(null)

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect()
      if (!node) return
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage()
        },
        { rootMargin: '200px' }
      )
      observerRef.current.observe(node)
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  )

  if (isLoading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8">
        <Skeleton className="h-5 w-48 mb-6 rounded-full" />
        <ResultsSkeleton />
      </div>
    )
  }

  if (artworks.length === 0) {
    return <EmptyState query={query} />
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8">
      {/* Result count */}
      {total !== undefined && (
        <p className="font-poppins text-[13px] text-neutral-400 mb-6">
          <span className="font-semibold text-neutral-600">{total.toLocaleString()}</span>{' '}
          result{total !== 1 ? 's' : ''} for{' '}
          <span className="font-semibold text-primary-500">"{query}"</span>
        </p>
      )}

      {/* 4-col grid — matches design exactly: 364px cards, 332px image, 55px pill */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-0 gap-y-10">
        {artworks.map((artwork, i) => (
          <motion.div
            key={artwork.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.04, 0.32), duration: 0.4 }}
            className="flex justify-center"
          >
            <ArtCard
              image={artwork.imageUrl}
              title={artwork.title}
              cardLink={`/artwork/${artwork.id}`}
              artist={[{
                id: artwork.artist.id,
                name: artwork.artist.displayName,
                avatarUrl: artwork.artist.avatarUrl ?? '/images/image-avatar.svg',
              }]}
              stats={{
                likes: String(artwork.likesCount),
                views: String(artwork.viewsCount),
              }}
              variant="standard"
            />
          </motion.div>
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-4 mt-4" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
        </div>
      )}

      {!hasNextPage && artworks.length > 0 && (
        <p className="text-center font-poppins text-[12px] text-neutral-300 pt-8">
          All results loaded
        </p>
      )}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ResultsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-0 gap-y-10">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-4 max-w-[332px] mx-auto w-full">
          <Skeleton className="w-full aspect-[364/332] rounded-[40px]" />
          <Skeleton className="w-full h-[55px] rounded-full" />
        </div>
      ))}
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center px-4">
      <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="12" cy="12" r="8" stroke="#D2D5DA" strokeWidth="2" />
          <path d="M18 18L24 24" stroke="#D2D5DA" strokeWidth="2" strokeLinecap="round" />
          <path d="M9 12h6M12 9v6" stroke="#D2D5DA" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <div>
        <p className="font-raleway font-semibold text-[18px] text-neutral-600">
          No results for "{query}"
        </p>
        <p className="font-poppins text-[13px] text-neutral-400 mt-1 max-w-xs mx-auto leading-5">
          Try different keywords or remove some filters.
        </p>
      </div>
      <Link
        href="/discover"
        className="font-poppins text-[13px] font-medium text-primary-500 hover:text-primary-600 underline underline-offset-2 transition-colors"
      >
        Browse all artwork instead
      </Link>
    </div>
  )
}