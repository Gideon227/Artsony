'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArtCard } from '@/components/ui/art-card'
import { useMarketplaceArtworks } from '@/hooks/use-artwork'
import { formatNumber } from '@/utils'
import { cn } from '@/utils'
import { Artwork } from '@/types'
import ArtworkViewOverlay from '@/features/artwork/components/shop/artwork-view-overlay'

export function CreatorCTASection() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [activeArtwork, setActiveArtwork] = useState<Artwork | null>(null)
  

  const { data, isLoading } = useMarketplaceArtworks(10)
  const artworks = data?.data ?? []

  const activeArtworkIndex = activeArtwork
    ? artworks.findIndex((a) => a.id === activeArtwork.id)
    : -1

  const handleNavigateArtwork = (direction: 'prev' | 'next') => {
    if (activeArtworkIndex === -1) return
    const nextIndex = direction === 'next'
      ? Math.min(activeArtworkIndex + 1, artworks.length - 1)
      : Math.max(activeArtworkIndex - 1, 0)
    if (nextIndex === activeArtworkIndex) return
    setActiveArtwork(artworks[nextIndex] as Artwork)
  }

  if (!isLoading && artworks.length === 0) return null

  const nextSlide = () => setCurrentIndex((prev) => Math.min(prev + 1, artworks.length - 1))
  const prevSlide = () => setCurrentIndex((prev) => Math.max(prev - 1, 0))

  return (
    <section className="w-full bg-secondary-100 py-12 px-4 md:px-8 overflow-hidden flex flex-col gap-y-14">
      <div className="flex flex-col md:flex-row items-center justify-center gap-x-12 w-full">
        <div className="flex flex-col gap-6 flex-1 w-full">
          <div className="flex gap-2 items-center">
            <h2 className="font-raleway font-semibold text-h6 md:text-h4 leading-none text-primary-500">
              Artsony Shop
            </h2>
            <span className="relative shrink-0 w-8 h-8 md:w-12 md:h-12">
              <Image src="/icons/shop.svg" fill alt="shop icon" className="object-contain" />
            </span>
          </div>
          <p className="font-poppins font-medium text-body-m text-gray-400 leading-6 tracking-wide max-w-141">
            A glimpse into what our artists are creating — discover original works waiting to find a home.
          </p>
        </div>

        <div className="self-end items-end justify-end hidden md:flex">
          <Button variant="outline" onClick={() => router.push('/shop')}>
            Visit Shop
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-y-8">
        <div className="relative w-full overflow-visible">
          <div className="w-full class-carousel-viewport">
            {isLoading ? (
              <div className="flex gap-6 w-max">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-[332px] aspect-square rounded-2xl bg-white/40 animate-pulse" />
                ))}
              </div>
            ) : (
              <motion.div
                className="flex gap-6 w-max"
                animate={{ x: -(currentIndex * 356) }}
                transition={{ type: 'spring', stiffness: 45, damping: 15, mass: 1.2 }}
              >
                {artworks.map((artwork) => (
                  <div key={artwork.id} className="w-[332px]">
                    <ArtCard
                      image={artwork.assets[0]?.thumbnail_url ?? artwork.assets[0]?.optimized_url ?? artwork.assets[0]?.original_url ?? ''}
                      title={artwork.title}
                      artworkId={artwork.id}
                      onCardClick={() => setActiveArtwork(artwork)}
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
                      stats={{ likes: formatNumber(artwork.like_count), views: formatNumber(artwork.view_count) }}
                      variant="standard"
                    />
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          {!isLoading && currentIndex > 0 && (
            <button
              onClick={prevSlide}
              className="absolute left-6 top-[166px] -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white transition-all z-20 bg-primary-500 shadow-lg hover:scale-105"
              aria-label="Previous artworks"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          {!isLoading && currentIndex < artworks.length - 1 && (
            <button
              onClick={nextSlide}
              className="absolute right-6 top-[166px] -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white transition-all z-20 bg-primary-500 shadow-lg hover:scale-105"
              aria-label="Next artworks"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>

        {!isLoading && artworks.length > 1 && (
          <div className="flex items-center gap-2 justify-center">
            {artworks.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                aria-label={`Go to artwork ${i + 1}`}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  i === currentIndex ? 'w-4 bg-primary-500' : 'w-2 bg-neutral-300 hover:bg-neutral-400'
                )}
              />
            ))}
          </div>
        )}

        <div className="flex md:hidden justify-center">
          <Button variant="outline" fullWidth onClick={() => router.push('/shop')}>
            Visit Shop
          </Button>
        </div>
      </div>

      {activeArtwork && (
        <ArtworkViewOverlay
          artwork={activeArtwork}
          onClose={() => setActiveArtwork(null)}
          onNavigate={handleNavigateArtwork}
        />
      )}
    </section>
  )
}