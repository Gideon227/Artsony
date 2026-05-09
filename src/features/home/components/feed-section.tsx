'use client'

import React, { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/utils'
import { ArtCard } from '@/components/ui/art-card'
import { useFeed } from '@/hooks/use-artwork'
import { SectionHeader } from './section-header'
import { ArtworkGridSkeleton } from './artwork-grid-skeleton'
import { FEED_TABS } from '../types'
import type { FeedSort } from '../types'
import type { Artwork } from '@/types'

// ─── FeedSection ──────────────────────────────────────────────────────────────

export function FeedSection() {
  const [activeTab, setActiveTab] = useState<'all' | FeedSort>('all')

  const sort = activeTab === 'all' ? undefined : activeTab

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useFeed({ sort })

  const artworks: Artwork[] = data?.pages.flatMap((p) => p.data) ?? []

  // ── Intersection observer for infinite scroll ────────────────────────────
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const sentinelCallback = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect()
      if (!node) return

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
          }
        },
        { rootMargin: '200px' }
      )
      observerRef.current.observe(node)
      sentinelRef.current = node
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  )

  return (
    <section className="w-full py-10 md:py-14">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">

        {/* ── Header + Filter Tabs ──────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <SectionHeader
            title="Discover Art"
            subtitle="Explore original works from creators worldwide"
            viewAllHref="/discover"
          />

          {/* Filter pills */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {FEED_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={cn(
                  'relative h-9 px-4 rounded-full font-poppins text-[13px] font-medium',
                  'transition-all duration-200 focus-visible:outline-2 focus-visible:outline-primary-500',
                  activeTab === tab.value
                    ? 'text-white'
                    : 'text-neutral-500 hover:text-neutral-700 border border-neutral-200 bg-white hover:bg-neutral-50'
                )}
              >
                {/* Animated active bg */}
                {activeTab === tab.value && (
                  <motion.span
                    layoutId="feed-tab-pill"
                    className="absolute inset-0 rounded-full bg-primary-500"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Grid ─────────────────────────────────────────────────────── */}
        {isLoading ? (
          <ArtworkGridSkeleton count={8} />
        ) : artworks.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-0 gap-y-10">
              {artworks.map((artwork, i) => (
                <motion.div
                  key={artwork.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.4 }}
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

            {/* ── Infinite scroll sentinel ──────────────────────────── */}
            <div ref={sentinelCallback} className="h-4" />

            {isFetchingNextPage && (
              <div className="flex justify-center pt-6">
                <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
              </div>
            )}

            {!hasNextPage && artworks.length > 0 && (
              <p className="text-center font-poppins text-[13px] text-neutral-400 pt-8">
                You&apos;ve seen it all — for now.
              </p>
            )}
          </>
        )}
      </div>
    </section>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M4 20L10 14L14 18L20 10L24 15" stroke="#5DAFB1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="2" y="2" width="24" height="24" rx="6" stroke="#5DAFB1" strokeWidth="2"/>
        </svg>
      </div>
      <p className="font-poppins text-[15px] font-medium text-neutral-600">No artworks yet</p>
      <p className="font-poppins text-[13px] text-neutral-400 max-w-xs">
        Be the first to share your work with the community.
      </p>
    </div>
  )
}