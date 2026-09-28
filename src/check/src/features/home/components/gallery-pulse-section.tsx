'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { cn, getDisplayThumbnail } from '@/utils'
import { useTrendingArtworks } from '@/hooks/use-artwork'
import type { Artwork } from '@/types/artwork'

export function GalleryPulseSection() {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  // Gallery Pulse is "what's trending this week" regardless of when it was
  // uploaded — useTopPicks('week') was scoped to artworks *uploaded* in the
  // last 7 days instead, which is why an older artwork picking up likes
  // this week never showed here. useTrendingArtworks scores by windowed
  // engagement (artwork_engagement_daily) instead of created_at.
  const { data: FEATURED_ARTWORKS, isLoading, isError } = useTrendingArtworks(8, 7)

  useEffect(() => {
    if (!FEATURED_ARTWORKS || FEATURED_ARTWORKS.length < 2) return
    const timer = setInterval(() => {
      setDirection(1)
      setIndex((prev) => (prev + 1) % FEATURED_ARTWORKS.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [FEATURED_ARTWORKS])

  if (isLoading) {
    return (
      <section className="w-full bg-[#EBF5F5] min-h-[500px] flex items-center justify-center">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full px-8 animate-pulse">
          <div className="lg:col-span-4 space-y-4">
            <div className="h-8 w-40 bg-white/60 rounded-full" />
            <div className="h-16 w-64 bg-white/60 rounded-2xl" />
          </div>
          <div className="lg:col-span-8 grid grid-cols-2 gap-6 h-[400px]">
            <div className="bg-white/60 rounded-[48px]" />
            <div className="bg-white/60 rounded-[48px]" />
          </div>
        </div>
      </section>
    )
  }

  if (isError || !FEATURED_ARTWORKS || FEATURED_ARTWORKS.length === 0) {
    return (
      <section className="w-full bg-[#EBF5F5] py-16 px-8">
        <div className="max-w-[1440px] mx-auto flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary-500" />
          </div>
          <p className="font-poppins text-[15px] font-medium text-neutral-600">
            Nothing&apos;s trending yet this week
          </p>
          <p className="font-poppins text-[13px] text-neutral-400 max-w-xs">
            Check back soon — the gallery pulse updates as artworks pick up likes and views.
          </p>
        </div>
      </section>
    )
  }

  const currentArtwork = FEATURED_ARTWORKS[index]
  const nextIndex = (index + 1) % FEATURED_ARTWORKS.length
  const nextArtwork = FEATURED_ARTWORKS[nextIndex]

  const getImageUrl = (artwork?: Artwork) => getDisplayThumbnail(artwork?.assets)

  const nextStep = () => {
    setDirection(1)
    setIndex((prev) => (prev + 1) % FEATURED_ARTWORKS.length)
  }
  const prevStep = () => {
    setDirection(-1)
    setIndex((prev) => (prev - 1 + FEATURED_ARTWORKS.length) % FEATURED_ARTWORKS.length)
  }

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0, scale: 0.9 }),
    center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ zIndex: 0, x: dir < 0 ? 300 : -300, opacity: 0, scale: 0.9 }),
  }

  return (
    <section className="w-full bg-[#EBF5F5] py-12 px-8 overflow-hidden min-h-[500px] flex items-center">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-29 items-center w-full">
        <div className="lg:col-span-4 flex flex-col space-y-8">
          <div className="space-y-6">
            <h2 className="text-h3 font-semibold font-raleway leading-8 tracking-wide">
              <span className="text-primary-500">Gallery</span> <span className="text-gray-500">Pulse</span>
            </h2>
            <p className="text-gray-400 font-poppins text-body-m tracking-wide max-w-[332px]">
              These are the artworks that captured the most hearts and eyes this week — across every corner of the gallery.
            </p>
          </div>

          <div className="flex items-center gap-2 px-6">
            {FEATURED_ARTWORKS.map((_, i) => (
              <div
                key={i}
                onClick={() => { setDirection(i > index ? 1 : -1); setIndex(i) }}
                className={cn(
                  'h-2 rounded-full transition-all duration-500 cursor-pointer',
                  i === index ? 'w-4 bg-primary-500 rounded-[11px]' : 'w-2 bg-gray-100'
                )}
              />
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 relative h-[400px] flex items-center">
          <div className="relative w-full h-full flex gap-6">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={index}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ x: { type: 'spring', stiffness: 100, damping: 30 }, opacity: { duration: 0.8 } }}
                className="absolute inset-0 w-full h-full grid grid-cols-2 gap-6"
              >
                <div className="relative w-full h-full rounded-[48px] overflow-hidden bg-neutral-100">
                  <Image src={getImageUrl(currentArtwork)} alt={currentArtwork?.title ?? 'Featured artwork'} fill className="object-cover" />
                </div>
                {FEATURED_ARTWORKS.length > 1 && (
                  <div className="relative w-full h-full rounded-[48px] overflow-hidden bg-neutral-100">
                    <Image src={getImageUrl(nextArtwork)} alt={nextArtwork?.title ?? 'Next artwork'} fill className="object-cover" />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {FEATURED_ARTWORKS.length > 1 && (
              <>
                <button
                  onClick={prevStep}
                  disabled={index === 0}
                  className={`cursor-pointer absolute left-6 top-1/2 disabled:pointer-events-none -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all z-20 shadow-lg hover:scale-110 active:scale-95 ${index === 0 ? 'bg-transparent border border-[#788191] rounded-full' : 'bg-primary-500'}`}
                  aria-label="Previous"
                >
                  <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.164852 6.62959L6.79533 0.199898C7.20906 -0.201305 8 0.0418882 8 0.570304L8 13.4297C8 13.9581 7.20906 14.2013 6.79533 13.8001L0.164852 7.37041C-0.0549501 7.15726 -0.0549501 6.84274 0.164852 6.62959Z" fill={index === 0 ? '#788191' : 'white'}/>
                  </svg>
                </button>

                <button
                  onClick={nextStep}
                  disabled={index === FEATURED_ARTWORKS.length - 1}
                  className={`cursor-pointer absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all z-20 shadow-lg hover:scale-110 active:scale-95 ${index === FEATURED_ARTWORKS.length - 1 ? 'bg-transparent border border-[#788191] rounded-full' : 'bg-primary-500'}`}
                  aria-label="Next"
                >
                  <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.83515 6.62959L1.20467 0.199897C0.790939 -0.201306 5.852e-07 0.0418875 5.62102e-07 0.570303L0 13.4297C-2.30978e-08 13.9581 0.790938 14.2013 1.20467 13.8001L7.83515 7.37041C8.05495 7.15726 8.05495 6.84274 7.83515 6.62959Z" fill={index === FEATURED_ARTWORKS.length - 1 ? '#788191' : 'white'}/>
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}