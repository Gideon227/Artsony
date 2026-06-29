'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, MapPinOff } from 'lucide-react'
import { ArtCard, Artist } from '@/components/ui/art-card'
import { artworkService } from '@/services'
import { Artwork } from '@/types'
import { cn } from '@/utils'

const POPULAR_CITIES = [
    { id: 'berlin', name: 'Berlin', queryParams: { city: 'Berlin', country: 'Germany' } },
    { id: 'tokyo', name: 'Tokyo', queryParams: { city: 'Tokyo', country: 'Japan' } },
    { id: 'new-york', name: 'New York', queryParams: { city: 'New York', country: 'USA' } },
    { id: 'london', name: 'London', queryParams: { city: 'London', country: 'UK' } },
    { id: 'paris', name: 'Paris', queryParams: { city: 'Paris', country: 'France' } },
    { id: 'seoul', name: 'Seoul', queryParams: { city: 'Seoul', country: 'South Korea' } },
    { id: 'lagos', name: 'Lagos', queryParams: { city: 'Lagos', country: 'Nigeria' } },
    { id: 'sao-paulo', name: 'São Paulo', queryParams: { city: 'São Paulo', country: 'Brazil' } },
]

export default function AroundTheWorld() {
    // --- State ---
    const [cityIndex, setCityIndex] = useState(0)
    const [artworks, setArtworks] = useState<Artwork[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    
    const carouselRef = useRef<HTMLDivElement>(null)
    const currentCity = POPULAR_CITIES[cityIndex]

    // --- City Cycler Logic ---
    const handleNextCity = () => setCityIndex((prev) => (prev + 1) % POPULAR_CITIES.length)
    const handlePrevCity = () => setCityIndex((prev) => (prev - 1 + POPULAR_CITIES.length) % POPULAR_CITIES.length)

    // --- Carousel Scroll Logic (2 items at a time) ---
    const handleScroll = (direction: 'left' | 'right') => {
        if (!carouselRef.current) return

        // Assuming ArtCard max-w is ~332px + gap of 24px (gap-6)
        const cardWidthWithGap = 332 + 24 
        const scrollAmount = cardWidthWithGap * 2

        carouselRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        })
    }

    // --- Data Fetching ---
    useEffect(() => {
        const fetchCityArtworks = async () => {
            try {
                setIsLoading(true)
                setError(null)
                
                // Reset scroll position when city changes
                if (carouselRef.current) carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' })

                // Assuming artworkService can accept location-based params
                const response = await artworkService.list({
                    listing_type: 'MARKETPLACE',
                    status: 'PUBLISHED',
                    visibility: 'PUBLIC',
                    // Pass the city name to your backend filter
                    search: currentCity?.queryParams.city, 
                    limit: 12 
                })

                if (response.success) {
                    setArtworks(response.data)
                } else {
                    setError('Failed to load global picks.')
                }
            } catch (err) {
                console.error('[AROUND_THE_WORLD_FETCH_ERROR]:', err)
                setError('An unexpected error occurred.')
            } finally {
                setIsLoading(false)
            }
        }

        fetchCityArtworks()
    }, [currentCity?.id])

    return (
        <section className="w-full bg-[#ECF3F4] py-12 px-8 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-[116px]">
                
                {/* --- Left Column: Context & City Selector --- */}
                <div className="lg:col-span-3 flex flex-col gap-y-4 justify-center">
                    <h2 className="font-raleway font-semibold text-body text-h5 leading-8 tracking-wide">
                        Around the World
                    </h2>
                    <p className="text-body font-poppins text-body-m leading-6 tracking-wide">
                        A global spotlight on creators making waves, one city at a time.
                    </p>

                    {/* Interactive City Selector */}
                    <div className="flex items-center gap-4">
                        <div className="relative h-14 overflow-hidden min-w-60">
                            <AnimatePresence mode="popLayout">
                                <motion.div
                                    key={currentCity?.id}
                                    initial={{ y: 40, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -40, opacity: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    className="absolute inset-0 flex items-center"
                                >
                                    <h3 className="text-primary-500 font-raleway font-semibold text-h2 tracking-wide">
                                        {currentCity?.name}
                                    </h3>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-col gap-1">
                            <button 
                                onClick={handlePrevCity}
                                className="text-[#F15A2B] hover:bg-[#F15A2B]/10 rounded-md p-0.5 transition-colors"
                            >
                                <ChevronUp size={20} strokeWidth={3} />
                            </button>
                            <button 
                                onClick={handleNextCity}
                                className="text-[#F15A2B] hover:bg-[#F15A2B]/10 rounded-md p-0.5 transition-colors"
                            >
                                <ChevronDown size={20} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- Right Column: Carousel & Empty States --- */}
                <div className="lg:col-span-9 relative">
                    
                    {/* Navigation Overlays (Visible only if there are items) */}
                    {!isLoading && artworks.length > 0 && (
                        <>
                            <button 
                                onClick={() => handleScroll('left')}
                                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-white/80 backdrop-blur-md shadow-lg flex items-center justify-center text-slate-700 hover:scale-105 active:scale-95 transition-all hidden md:flex"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button 
                                onClick={() => handleScroll('right')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-[#F15A2B] shadow-lg flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all hidden md:flex"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </>
                    )}

                    {/* Content Area */}
                    <div className="min-h-[400px] w-full rounded-[40px]">
                        {isLoading ? (
                            // Skeleton Loader State
                            <div className="flex gap-6 overflow-hidden">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="shrink-0 w-[332px] aspect-square rounded-[40px] bg-white/40 animate-pulse" />
                                ))}
                            </div>
                        ) : error ? (
                            // Error State
                            <div className="w-full h-[400px] flex flex-col items-center justify-center bg-white/40 rounded-[40px] backdrop-blur-sm">
                                <p className="text-red-500 font-medium">{error}</p>
                            </div>
                        ) : artworks.length === 0 ? (
                            // Production-Ready Empty State
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                className="w-full h-[400px] flex flex-col items-center justify-center"
                            >
                                <div className="h-16 w-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                                    <MapPinOff className="text-slate-300" size={28} />
                                </div>
                                <h4 className="text-lg font-semibold text-slate-700 mb-2">No marketplace listings yet</h4>
                                <p className="text-slate-500 text-sm max-w-[300px] text-center">
                                    Creators in {currentCity?.name} haven't published any public marketplace artworks yet. Check back later!
                                </p>
                            </motion.div>
                        ) : (
                            // Active Carousel
                            <div 
                                ref={carouselRef}
                                className="flex gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 pt-4 px-4 -mx-4"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                {artworks.map((art, index) => {
                                    // Map backend data to ArtCard requirements safely
                                    const mappedArtists: Artist[] = art.creator ? [{
                                        id: art.creator.id,
                                        name: art.creator.profile?.display_name || art.creator.username || 'Unknown',
                                        avatarUrl: art.creator.profile?.avatar_url || '/default-avatar.png',
                                    }] : [];

                                    return (
                                        <div key={art.id || index} className="shrink-0 snap-start">
                                            <ArtCard 
                                                variant="discover" // Using discover to match the overlay style in the image
                                                image={art.assets?.[0]?.optimized_url || art.assets?.[0]?.original_url || '/placeholder.png'} 
                                                title={art.title}
                                                artist={mappedArtists}
                                                showHeart={true}
                                                showCat={false}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}