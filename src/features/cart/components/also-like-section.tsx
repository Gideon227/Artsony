'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/utils'
import { useMarketplaceArtworks } from '@/hooks/use-artwork'
import { useOpenArtwork } from '@/hooks/use-artwork-viewer'
import type { Artwork } from '@/types/artwork'
import { ArtCard } from '@/components/ui/art-card'
import { getDisplayThumbnail } from '@/utils'

const DESKTOP_CARD_WIDTH = 280 // px — target width for desktop
const GAP = 16 // px — space between cards

export function AlsoLikeSection() {
  const [pos, setPos] = useState(0)

  const { data, isLoading } = useMarketplaceArtworks(10)
  const artworks = data?.data ?? []
  const openArtwork = useOpenArtwork()

  const handleArtworkClick = (artwork: Artwork) =>
    openArtwork(artwork, { siblings: artworks, variant: 'home' })

  // ── Carousel Dimension Tracking ───────────────────────────────────────────
  const [viewportEl, setViewportEl] = useState<HTMLDivElement | null>(null)
  const [width, setWidth] = useState(0)

  useEffect(() => {
    if (!viewportEl) return
    const update = () => setWidth(viewportEl.clientWidth)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(viewportEl)
    return () => ro.disconnect()
  }, [viewportEl])

  // ── Carousel Math & Bounds ────────────────────────────────────────────────
  const n = artworks.length
  
  // Responsive check: If under 768px (mobile), fill the container width. 
  // Otherwise, cap to the desktop card width.
  const isMobile = width > 0 && width < 768
  const cardW = isMobile ? width : Math.min(DESKTOP_CARD_WIDTH, width)
  const step = cardW + GAP
  
  // Calculate how many cards fit cleanly in the visible area
  const visible = width > 0 ? Math.max(1, Math.floor((width + GAP) / step)) : 1
  
  // maxPos prevents the carousel from scrolling past the last artwork
  const maxPos = Math.max(0, n - visible)
  const isCarousel = width > 0 && n > visible

  // Ensure pos stays within bounds if the user resizes the window
  useEffect(() => {
    if (pos > maxPos) setPos(maxPos)
  }, [maxPos, pos])

  if (!isLoading && artworks.length === 0) return null

  // ── Navigation ────────────────────────────────────────────────────────────
  const nextStep = () => setPos((p) => Math.min(maxPos, p + 1))
  const prevStep = () => setPos((p) => Math.max(0, p - 1))

  const isAtStart = pos === 0
  const isAtEnd = pos >= maxPos

  const renderCard = (artwork: Artwork) => (
    <ArtCard
      image={getDisplayThumbnail(artwork.assets)}
      title={artwork.title}
      onCardClick={() => handleArtworkClick(artwork)}
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
  )

  return (
    <section className="py-12 bg-secondary-100 flex flex-col gap-6 px-4 lg:px-8 max-lg:mb-6 overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="lg:font-raleway max-lgfont-poppins text-body-m lg:text-h5 max-lg:font-medium lg:font-semibold text-body tracking-wide">
          You may also like
        </h2>

        <Link
          href="/shop"
          className="hidden lg:block rounded-full border border-primary-500 px-6 py-3 font-poppins text-body-s font-medium text-primary-500 transition-colors hover:bg-primary-50"
        >
          See more
        </Link>
      </div>

      {/* Carousel Container - Using named group `group/carousel` to prevent interfering with ArtCard */}
      <div className="relative w-full h-[420px] min-w-0 group/carousel">
        <div ref={setViewportEl} className="relative w-full h-full overflow-hidden">
          
          {isLoading ? (
            // Skeleton Loader Track
            <div className="flex h-full" style={{ gap: GAP }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div 
                  key={i} 
                  className="h-[380px] shrink-0 animate-pulse rounded-2xl bg-gray-50" 
                  style={{ width: cardW }} 
                />
              ))}
            </div>
          ) : (
            // Bounded Slide Track
            <motion.div
              className="absolute inset-y-0 left-0 flex"
              style={{ gap: GAP }}
              initial={false}
              animate={{ x: -pos * step }}
              transition={{ type: 'spring', stiffness: 100, damping: 30 }}
            >
              {artworks.map((artwork) => (
                <div
                  key={artwork.id}
                  className="relative h-full shrink-0"
                  style={{ width: cardW }}
                >
                  {renderCard(artwork)}
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Navigation Arrows */}
        {!isLoading && isCarousel && (
          <>
            <button
              onClick={prevStep}
              disabled={isAtStart}
              className={cn(
                "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 lg:-translate-x-5 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all z-20 shadow-lg",
                // Notice the `group-hover/carousel:` here instead of just `group-hover:`
                "lg:opacity-0 lg:group-hover/carousel:opacity-100",
                isAtStart
                  ? "bg-gray-400 cursor-not-allowed opacity-50 lg:group-hover/carousel:opacity-50"
                  : "bg-primary-500 cursor-pointer hover:scale-110 active:scale-95"
              )}
              aria-label="Previous"
            >
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.164852 6.62959L6.79533 0.199898C7.20906 -0.201305 8 0.0418882 8 0.570304L8 13.4297C8 13.9581 7.20906 14.2013 6.79533 13.8001L0.164852 7.37041C-0.0549501 7.15726 -0.0549501 6.84274 0.164852 6.62959Z" fill="white" />
              </svg>
            </button>

            <button
              onClick={nextStep}
              disabled={isAtEnd}
              className={cn(
                "absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 lg:translate-x-5 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all z-20 shadow-lg",
                // Notice the `group-hover/carousel:` here as well
                "lg:opacity-0 lg:group-hover/carousel:opacity-100",
                isAtEnd
                  ? "bg-gray-400 cursor-not-allowed opacity-50 lg:group-hover/carousel:opacity-50"
                  : "bg-primary-500 cursor-pointer hover:scale-110 active:scale-95"
              )}
              aria-label="Next"
            >
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.83515 6.62959L1.20467 0.199897C0.790939 -0.201306 5.852e-07 0.0418875 5.62102e-07 0.570303L0 13.4297C-2.30978e-08 13.9581 0.790938 14.2013 1.20467 13.8001L7.83515 7.37041C8.05495 7.15726 8.05495 6.84274 7.83515 6.62959Z" fill="white" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Pagination Indicators */}
      {!isLoading && isCarousel && (
        <div className="flex items-center justify-center gap-2 mt-2">
          {Array.from({ length: maxPos + 1 }).map((_, i) => (
            <div
              key={i}
              onClick={() => setPos(i)}
              className={cn(
                'h-2 rounded-full transition-all duration-500 cursor-pointer',
                i === pos ? 'w-4 bg-primary-500 rounded-[11px]' : 'w-2 bg-gray-200 hover:bg-gray-300'
              )}
            />
          ))}
        </div>
      )}

      {/* Mobile Footer Link */}
      <Link
        href="/shop"
        className="hidden max-lg:flex mx-auto mt-2 rounded-full border border-primary-500 px-6 py-3 font-poppins text-body-s font-medium text-primary-500 transition-colors hover:bg-primary-50"
      >
        See more
      </Link>
      
    </section>
  )
}