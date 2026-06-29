'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { artworkService } from '@/services'
import { Artwork } from '@/types/artwork'
import { ArtCard } from '@/components/ui/art-card'
import ArtworkViewOverlay from '@/features/artwork/components/artwork-view-overlay'

const TopPicks = () => {
    const [artworks, setArtworks] = useState<Artwork[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    // Overlay state
    const [activeArtwork, setActiveArtwork] = useState<Artwork | null>(null)
    const [activeIndex, setActiveIndex] = useState<number | null>(null)

    // Carousel state & refs
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(true)

    const checkScrollPosition = useCallback(() => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
            setCanScrollLeft(scrollLeft > 2)
            setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2)
        }
    }, [])

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = direction === 'left' ? -340 : 340
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
        }
    }

    useEffect(() => {
        const fetchMarketplaceArtworks = async () => {
            try {
                setIsLoading(true)
                setError(null)

                const response = await artworkService.list({
                    listing_type: 'MARKETPLACE',
                    status: 'PUBLISHED',
                    visibility: 'PUBLIC',
                    limit: 8
                })

                if (response.success) {
                    setArtworks(response.data)
                    setTimeout(checkScrollPosition, 100)
                } else {
                    setError('Failed to load top picks.')
                }
            } catch (err: any) {
                console.error('[TOP_PICKS_FETCH_ERROR]:', err)
                setError('An unexpected error occurred while fetching artworks.')
            } finally {
                setIsLoading(false)
            }
        }

        fetchMarketplaceArtworks()
    }, [checkScrollPosition])

    useEffect(() => {
        window.addEventListener('resize', checkScrollPosition)
        return () => window.removeEventListener('resize', checkScrollPosition)
    }, [checkScrollPosition])

    // ── Overlay handlers ──────────────────────────────────────────────────────
    const handleCloseOverlay = () => {
        setActiveArtwork(null)
        setActiveIndex(null)
    }

    const handleOpenArtwork = (index: number) => {
        const target = artworks[index]
        if (!target) return
        setActiveIndex(index)
        setActiveArtwork(target)
    }

    const handleNavigate = (direction: 'prev' | 'next') => {
        if (activeIndex === null) return
        const nextIndex = direction === 'next'
            ? Math.min(activeIndex + 1, artworks.length - 1)
            : Math.max(activeIndex - 1, 0)

        if (nextIndex === activeIndex) return

        const target = artworks[nextIndex]
        if (!target) return

        setActiveIndex(nextIndex)
        setActiveArtwork(target)
    }

    return (
        <div className="py-12 px-8 bg-secondary-100 gap-y-14 flex flex-col relative w-full overflow-hidden">
            {/* Header Area */}
            <div className="flex flex-col gap-y-6">
                <h2 className="font-raleway font-semibold text-h4 leading-10 text-primary-500 tracking-wide">
                    Top Picks by Artsony
                </h2>
                <p className="font-poppins text-body-m leading-6 text-body tracking-wide max-w-[564px] text-wrap text-gray-600">
                    A glimpse into what our artists are creating — discover original works waiting to find a home.
                </p>
            </div>

            {/* Loading / Error / Empty States */}
            {isLoading && (
                <div className="flex justify-center items-center py-20 min-h-[400px]">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
                </div>
            )}

            {error && !isLoading && (
                <div className="text-center py-10 text-red-500 font-poppins min-h-[400px]">
                    {error}
                </div>
            )}

            {!isLoading && !error && artworks.length === 0 && (
                <div className="text-center py-10 text-gray-500 font-poppins min-h-[400px]">
                    No marketplace artworks available right now.
                </div>
            )}

            {/* Carousel Container */}
            {!isLoading && !error && artworks.length > 0 && (
                <div className="relative w-full">
                    {/* Left Navigation Arrow */}
                    <button
                        onClick={() => scroll('left')}
                        disabled={!canScrollLeft}
                        className={`absolute left-4 top-[40%] -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                            ${!canScrollLeft 
                                ? 'bg-black/10 text-gray-400 cursor-not-allowed border border-gray-300 backdrop-blur-sm' 
                                : 'bg-white text-gray-800 shadow-lg hover:bg-gray-50'}`}
                        aria-label="Scroll left"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>

                    {/* Scrollable Track */}
                    <div 
                        ref={scrollContainerRef}
                        onScroll={checkScrollPosition}
                        className="flex overflow-x-auto hide-scrollbar gap-x-6 snap-x snap-mandatory py-4"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {artworks.map((artwork, index) => {
                            const primaryAsset = artwork.assets?.[0]
                            const imageUrl = primaryAsset?.optimized_url || primaryAsset?.original_url || '/placeholder.png'

                            return (
                                <div key={artwork.id} className="flex-none w-[320px] snap-start">
                                    <ArtCard
                                        image={imageUrl}
                                        title={artwork.title}
                                        variant="shop"
                                        onCardClick={() => handleOpenArtwork(index)}
                                        showCart={true}
                                        showHeart={true}
                                        stats={{
                                            likes: artwork.like_count.toString(),
                                            views: artwork.view_count.toString()
                                        }}
                                        artist={[
                                            {
                                                id: artwork.creator_id,
                                                name: artwork.creator?.profile?.display_name || artwork.creator?.username || 'Unknown Artist',
                                                avatarUrl: artwork.creator?.profile?.avatar_url || '/default-avatar.png',
                                                role: 'Artist',
                                                stats: {
                                                    followers: artwork.creator?.profile?.followers_count?.toString() ?? '0',
                                                    likes: artwork.like_count.toString(),
                                                    following: artwork.creator?.profile?.following_count?.toString() ?? '0',
                                                }
                                            }
                                        ]}
                                    />
                                </div>
                            )
                        })}
                    </div>

                    {/* Right Navigation Arrow */}
                    <button
                        onClick={() => scroll('right')}
                        disabled={!canScrollRight}
                        className={`absolute right-4 top-[40%] -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                            ${!canScrollRight 
                                ? 'bg-black/10 text-gray-400 cursor-not-allowed border border-gray-300 backdrop-blur-sm' 
                                : 'bg-[#FF6A3D] text-white shadow-lg hover:bg-[#E55A2D]'}`}
                        aria-label="Scroll right"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Artwork View Overlay */}
            {activeArtwork && (
                <ArtworkViewOverlay
                    artwork={activeArtwork}
                    onClose={handleCloseOverlay}
                    onNavigate={handleNavigate}
                />
            )}
        </div>
    )
}

export default TopPicks