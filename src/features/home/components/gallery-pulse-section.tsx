'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { cn } from '@/utils'
import { useTopPicks } from '@/hooks/use-artwork'
import type { Artwork } from '@/types/artwork'

export function GalleryPulseSection() {
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  const { data: FEATURED_ARTWORKS, isLoading, isError } = useTopPicks('week', 8)

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

  const getImageUrl = (artwork?: Artwork) => {
    const asset = artwork?.assets?.[0]
    return asset?.thumbnail_url ?? asset?.optimized_url ?? asset?.original_url ?? ''
  }

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
                  className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white transition-all z-20 shadow-lg bg-primary-500 hover:scale-110 active:scale-95"
                  aria-label="Previous"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={nextStep}
                  className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center text-white transition-all z-20 shadow-lg bg-primary-500 hover:scale-110 active:scale-95"
                  aria-label="Next"
                >
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}