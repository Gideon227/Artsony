'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { ArtCard } from '@/components/ui/art-card'
import { useOpenArtwork } from '@/hooks/use-artwork-viewer'
import { useTopPicks } from '@/hooks/use-artwork'

const TopPicks = () => {
    const { data: artworks = [], isLoading, isError } = useTopPicks('all', 8, 'MARKETPLACE')
    const error = isError ? 'Failed to load top picks.' : null

    // Overlay state
    const openArtwork = useOpenArtwork()

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
        if (!isLoading && artworks.length > 0) setTimeout(checkScrollPosition, 100)
    }, [isLoading, artworks.length, checkScrollPosition])

    useEffect(() => {
        window.addEventListener('resize', checkScrollPosition)
        return () => window.removeEventListener('resize', checkScrollPosition)
    }, [checkScrollPosition])

    // ── Overlay handlers ──────────────────────────────────────────────────────
    const handleOpenArtwork = (index: number) => {
        const target = artworks[index]
        if (target) openArtwork(target, { siblings: artworks, variant: 'shop' })
    }

    return (
        <div className='bg-secondary-100'>

            <div className="py-12 px-8 gap-y-14 flex flex-col relative w-full overflow-hidden">
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
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-500" />
                    </div>
                )}

                {error && !isLoading && (
                    <div className="text-center py-10 text-red-500 font-poppins">
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
                                    ? 'cursor-not-allowed border border-gray-300 backdrop-blur-sm' 
                                    : 'bg-primary-500 hover:bg-primary-600'}`}
                            aria-label="Scroll left"
                        >
                            {canScrollLeft ? 
                                <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0.164852 7.37041L6.79533 13.8001C7.20906 14.2013 8 13.9581 8 13.4297L8 0.570303C8 0.0418882 7.20906 -0.201306 6.79533 0.199896L0.164852 6.62959C-0.0549501 6.84274 -0.0549501 7.15726 0.164852 7.37041Z" fill="white"/>
                                </svg>
                                : 
                                <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0.164852 7.37041L6.79533 13.8001C7.20906 14.2013 8 13.9581 8 13.4297L8 0.570303C8 0.0418882 7.20906 -0.201306 6.79533 0.199896L0.164852 6.62959C-0.0549501 6.84274 -0.0549501 7.15726 0.164852 7.37041Z" fill="#788191"/>
                                </svg>
                            }
                        </button>

                        {/* Scrollable Track */}
                        <div 
                            ref={scrollContainerRef}
                            onScroll={checkScrollPosition}
                            className="flex overflow-x-auto hide-scrollbar gap-x-6 snap-x snap-mandatory py-4"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {artworks.map((artwork, index) => {
                                return (
                                    <div key={artwork.id} className="flex-none w-[320px] snap-start">
                                        <ArtCard
                                            artwork={artwork}
                                            variant="shop"
                                            onCardClick={() => handleOpenArtwork(index)}
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
                                    ? 'cursor-not-allowed border border-gray-300 backdrop-blur-sm' 
                                    : 'bg-primary-500 hover:bg-primary-600'}`}
                            aria-label="Scroll right"
                        >
                            {canScrollRight ?
                                <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7.83515 7.37041L1.20467 13.8001C0.790939 14.2013 5.852e-07 13.9581 5.62102e-07 13.4297L0 0.570304C-2.30978e-08 0.0418892 0.790938 -0.201306 1.20467 0.199897L7.83515 6.62959C8.05495 6.84274 8.05495 7.15726 7.83515 7.37041Z" fill="white"/>
                                </svg>
                                : 
                                <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7.83515 7.37041L1.20467 13.8001C0.790939 14.2013 5.852e-07 13.9581 5.62102e-07 13.4297L0 0.570304C-2.30978e-08 0.0418892 0.790938 -0.201306 1.20467 0.199897L7.83515 6.62959C8.05495 6.84274 8.05495 7.15726 7.83515 7.37041Z" fill="#525965"/>
                                </svg>
                            }
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TopPicks