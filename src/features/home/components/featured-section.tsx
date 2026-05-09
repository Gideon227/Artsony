'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronsRight } from 'lucide-react'
import { cn } from '@/utils'
import type { FeaturedArtwork } from '../types/index'

// ─── Mock data (replace with API hook when /api/artworks/featured is ready) ──

const FEATURED: FeaturedArtwork[] = [
  {
    id: '1',
    imageUrl: '/images/mural-bg.jpg',
    title: 'Echoes of the Urban Dream',
    artistName: 'Ivan Kovačević',
    artistAvatar: '/images/image-avatar.svg',
  },
  {
    id: '2',
    imageUrl: '/images/wall-art.jpg',
    title: 'Spectrum of Silence',
    artistName: 'Amara Osei',
    artistAvatar: '/images/image-avatar.svg',
  },
  {
    id: '3',
    imageUrl: '/images/mural-bg.jpg',
    title: 'Beyond the Canvas',
    artistName: 'Lena Fischer',
    artistAvatar: '/images/image-avatar.svg',
  },
]

// ─── Component ─────────────────────────────────────────────────────────────────

export function FeaturedSection() {
  const [active, setActive] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % FEATURED.length)
    }, 5000)
  }

  useEffect(() => {
    startTimer()
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const goTo = (i: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setActive(i)
    startTimer()
  }

  return (
    <section className="w-full bg-secondary-100 py-10 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">

        {/* ── Section Label ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="w-1 h-6 rounded-full bg-primary-500" />
            <h2 className="font-raleway font-semibold text-[20px] md:text-[24px] text-neutral-600 tracking-wide">
              Featured Today
            </h2>
          </div>
          <Link
            href="/discover"
            className="flex items-center gap-1 font-poppins text-[13px] font-medium text-primary-500 hover:text-primary-600 transition-colors group"
          >
            View all
            <ChevronsRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* ── Card Strip ─────────────────────────────────────────────────── */}
        <div className="relative">
          {/* Desktop: show 3 cards side by side */}
          <div className="hidden md:grid grid-cols-3 gap-4">
            {FEATURED.map((item, i) => (
              <FeaturedCard
                key={item.id}
                item={item}
                isActive={i === active}
                onClick={() => goTo(i)}
              />
            ))}
          </div>

          {/* Mobile: full-width single card with AnimatePresence */}
          <div className="md:hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={FEATURED[active]?.id}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4 }}
              >
                <FeaturedCard
                  item={FEATURED[active]!}
                  isActive
                  onClick={() => {}}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── Dot Indicators ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mt-5 ml-1">
          {FEATURED.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                'h-2 rounded-full transition-all duration-400',
                i === active
                  ? 'w-4 bg-primary-500'
                  : 'w-2 bg-neutral-300 hover:bg-neutral-400'
              )}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── FeaturedCard ──────────────────────────────────────────────────────────────

function FeaturedCard({
  item,
  isActive,
  onClick,
}: {
  item: FeaturedArtwork
  isActive: boolean
  onClick: () => void
}) {
  return (
    <Link
      href={`/artwork/${item.id}`}
      onClick={onClick}
      className={cn(
        'relative block overflow-hidden rounded-[32px] cursor-pointer group',
        'transition-all duration-300',
        isActive ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-secondary-100' : ''
      )}
      style={{ height: 'clamp(240px, 30vw, 432px)' }}
    >
      {/* Image */}
      <Image
        src={item.imageUrl}
        alt={item.title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 33vw"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      {/* Bottom content */}
      <div className="absolute bottom-5 left-5 right-5">
        <p className="font-raleway font-semibold text-white text-[16px] leading-tight mb-2 line-clamp-2">
          {item.title}
        </p>
        <div className="flex items-center gap-2">
          <div className="relative w-7 h-7 rounded-full overflow-hidden border border-white/40">
            <Image src={item.artistAvatar} alt={item.artistName} fill className="object-cover" />
          </div>
          <span className="font-poppins text-[12px] text-white/80 font-medium truncate">
            {item.artistName}
          </span>
        </div>
      </div>
    </Link>
  )
}