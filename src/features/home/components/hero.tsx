'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronsRight } from 'lucide-react';
import Image from 'next/image';
import { useHeroArtworks } from '@/hooks/use-artwork';
import type { HeroArtwork } from '../types';

const HERO_SLIDE_COUNT = 5;

interface HeroSlide {
  id: string;
  image: string;
  title: React.ReactNode;
  artistName: string;
  artistAvatar: string;
  bio: string;
}

// Shown whenever there aren't yet enough qualifying featured artworks to fill
// every hero slot — early on that's most/all of them. As real artworks pick
// up views, likes, and sales, GET /api/artworks/featured returns more real
// slides and these get displaced automatically; nothing here needs to change
// when that happens.
const PLACEHOLDER_SLIDES: HeroSlide[] = [
  {
    id: 'placeholder-1',
    image: '/images/mural-bg.jpg',
    title: <>Buy What You Love.<br />Sell What You Make.</>,
    artistName: 'Ivan Kovačević',
    artistAvatar: '/images/image-avatar.svg',
    bio: "I paint like I'm remembering something I've never seen before.",
  },
  {
    id: 'placeholder-2',
    image: '/images/wall-art.jpg',
    title: <>Where Creative Souls Connect.</>,
    artistName: 'Ivan Kovačević',
    artistAvatar: '/images/image-avatar.svg',
    bio: 'Art is the only way to run away without leaving home.',
  },
];

function toHeroSlide(artwork: HeroArtwork): HeroSlide | null {
  // No thumbnail means nothing to show behind the slide — skip rather than
  // rendering a broken/blank hero background.
  if (!artwork.thumbnail_url) return null;

  return {
    id: artwork.id,
    image: artwork.thumbnail_url,
    title: artwork.title,
    artistName: artwork.creator.username ?? artwork.creator.display_name ?? 'Artsony Artist',
    artistAvatar: artwork.creator.avatar_url ?? '/images/image-avatar.svg',
    bio: artwork.creator.bio ?? 'Discover more from this artist on Artsony.',
  };
}

export function buildSlides(featured: HeroArtwork[] | undefined): HeroSlide[] {
  const real = (featured ?? [])
    .map(toHeroSlide)
    .filter((slide): slide is HeroSlide => slide !== null);

  if (real.length >= HERO_SLIDE_COUNT) return real.slice(0, HERO_SLIDE_COUNT);

  const needed = HERO_SLIDE_COUNT - real.length;
  const padding = Array.from(
    { length: needed },
    (_, i) => PLACEHOLDER_SLIDES[i % PLACEHOLDER_SLIDES.length]!,
  );

  return [...real, ...padding];
}

export const HeroSection = () => {
  const [index, setIndex] = useState(0);

  // Public, decorative data — a fetch failure should never block or error
  // the hero, it should just fall back to placeholder slides.
  const { data: featured, isError } = useHeroArtworks(HERO_SLIDE_COUNT);

  useEffect(() => {
    if (isError) {
      console.error('[HeroSection] Failed to load featured artworks — showing placeholders');
    }
  }, [isError]);

  const slides = useMemo(() => buildSlides(featured), [featured]);

  useEffect(() => {
    setIndex(0);
  }, [slides]);

  const currentSlide = slides[index];

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [slides.length]);

  if (!currentSlide) return <div className="h-screen w-full bg-black" />;

  return (
    <div className="relative h-[80vh] md:h-screen w-full overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 8, ease: "linear" }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${currentSlide.image}')` }}
          >
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          </motion.div>

          {/* Content Layout */}
          <div className="relative z-10 h-full flex flex-col justify-center px-4 md:px-8">
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="max-w-5xl mx-auto flex justify-center"
            >
              <h1 className="text-white font-raleway font-semibold text-[64px] max-md:text-[32px] max-md:leading-10 leading-18 text-center tracking-wide">
                {currentSlide.title}
              </h1>
            </motion.div>

            {/* Artist Info */}
            <div className="absolute bottom-8 left-8 max-w-2xl" style={{ bottom: 32, left: 32 }}>
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="flex items-center gap-2 mb-4 group cursor-pointer w-fit"
              >
                <Image 
                  src={currentSlide.artistAvatar} 
                  alt={currentSlide.artistName}
                  width={40}
                  height={40} 
                  className="w-10 h-10 rounded-full border border-white/30 object-cover"
                />
                <div className="flex items-center gap-2">
                  <span className="text-white text-[12px] font-poppins font-medium tracking-tight">
                    {currentSlide.artistName}
                  </span>
                  <ChevronsRight className="text-white/70 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </div>
              </motion.div>

              <motion.p 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="text-white/80 text-[12px] md:text-[14px] font-medium italic leading-relaxed max-w-lg"
              >
                “{currentSlide.bio}”
              </motion.p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide Indicators */}
      {/* <div className="absolute bottom-10 right-10 z-20 flex gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1 transition-all duration-500 rounded-full ${
              i === index ? 'w-12 bg-white' : 'w-4 bg-white/30'
            }`}
          />
        ))}
      </div> */}
    </div>
  );
};
