'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ArtCard } from '@/components/ui/art-card'

// Mocked featured artist — replace with /api/users/spotlight hook when ready
const SPOTLIGHT = {
  name: 'Ivan Kovačević',
  avatarUrl: '/images/image-avatar.svg',
  artworkUrl: '/images/mural-bg.jpg',
  quote: "I paint like I'm remembering something I've never seen before.",
  artworksCount: 47,
  followersCount: '2.3K',
  profileHref: '/@ivan',
}

// Mocked items for the Artsony Shop Carousel matching the design
const SHOP_ARTWORKS = [
  {
    id: '1',
    image: '/images/artwork-1.jpg',
    title: 'Neon Predator',
    artist: [{ id: 'art1', name: 'Kemi Oladele', avatarUrl: '/images/avatar-1.svg' }],
    stats: { likes: '2.4K', views: '12K' }
  },
  {
    id: '2',
    image: '/images/artwork-2.jpg',
    title: 'The Silent Companion',
    artist: [{ id: 'art2', name: 'Username', avatarUrl: '/images/avatar-2.svg' }],
    stats: { likes: '456', views: '1.9K' }
  },
  {
    id: '3',
    image: '/images/artwork-3.jpg',
    title: 'Summer Shoreline',
    artist: [{ id: 'art3', name: 'Oliver Bennett', avatarUrl: '/images/avatar-3.svg' }],
    stats: { likes: '130', views: '890' }
  },
  {
    id: '4',
    image: '/images/artwork-4.jpg',
    title: 'Gilded Elephant',
    artist: [{ id: 'art4', name: 'Sofia Martínez', avatarUrl: '/images/avatar-4.svg' }],
    stats: { likes: '3.1K', views: '15.4K' }
  },
  {
    id: '5',
    image: '/images/artwork-5.jpg',
    title: 'Abstract Harmony',
    artist: [{ id: 'art5', name: 'Gabriel Banega', avatarUrl: '/images/avatar-5.svg' }],
    stats: { likes: '892', views: '4.2K' }
  },
]

export function CreatorCTASection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    if (currentIndex < SHOP_ARTWORKS.length - 1) {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  return (
    <section className="w-full bg-secondary-100 py-12 px-8 overflow-hidden flex flex-col gap-y-14">
      <div className='flex items-center justify-center gap-x-12 w-full'>
        <div className='flex flex-col gap-6 flex-1 w-full'>
          <div className='flex gap-2 items-center'>
            <h1 className='font-raleway font-semibold text-h4 leading-10 text-primary-500'>Artsony Shop</h1>
            <Image src='/icons/shop.svg' width={48} height={48} alt='shop icon' />
          </div>

          <p className='font-poppins font-medium text-body-m text-gray-400 leading-6 tracking-wide max-w-141'>
            A glimpse into what our artists are creating — discover original works waiting to find a home.
          </p>
        </div>

        <div className='self-end items-end justify-end flex'>
          <Button
            variant='outline'
          >
            Visit Shop
          </Button>
        </div>
      </div>

      {/* CAROUSEL - NEW IMPLEMENTATION */}
      <div className="relative w-full overflow-visible px-2">
        <div className="overflow-hidden w-full class-carousel-viewport">
          <motion.div 
            className="flex gap-6 w-max"
            animate={{ x: -(currentIndex * 356) }}
            transition={{
              type: "spring",
              stiffness: 45,
              damping: 15,
              mass: 1.2
            }}
          >
            {SHOP_ARTWORKS.map((artwork) => (
              <div key={artwork.id} className="w-[332px] shrink-0">
                <ArtCard
                  image={artwork.image}
                  title={artwork.title}
                  artist={artwork.artist}
                  stats={artwork.stats}
                  variant="standard"
                  alternate={false}
                />
              </div>
            ))}
          </motion.div>
        </div>

        {/* Navigation Overlays */}
        {currentIndex > 0 && (
          <button 
            onClick={prevSlide}
            className="absolute left-6 top-[166px] -translate-y-1/2 w-12 h-12 rounded-full border border-white/30 bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/40 transition-all z-20"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {currentIndex < SHOP_ARTWORKS.length - 1 && (
          <button 
            onClick={nextSlide}
            className="absolute right-6 top-[166px] -translate-y-1/2 w-12 h-12 rounded-full bg-[#FF6B44] flex items-center justify-center text-white shadow-lg hover:scale-105 active:scale-95 transition-all z-20"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-raleway font-semibold text-[20px] text-neutral-700">{value}</span>
      <span className="font-poppins text-[11px] text-neutral-400 uppercase tracking-wider">{label}</span>
    </div>
  )
}