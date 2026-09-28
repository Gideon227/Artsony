'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { cn } from '@/utils'
import { useTrendingArtworks } from '@/hooks/use-artwork'
import { ArtCard } from '@/components/ui/art-card'

const CARD_WIDTH = 448 // px — target card width
const GAP = 16 // px — space between cards
const AUTOPLAY_MS = 6000

export function GalleryPulseSection() {
  // `pos` is an ever-increasing/decreasing step counter, NOT an array index.
  // The artwork shown at absolute slot `abs` is list[abs mod n], which is what
  // makes the strip loop: with 3 artworks you get [1,2] -> [2,3] -> [3,1].
  const [pos, setPos] = useState(0)
  const [paused, setPaused] = useState(false)

  // Gallery Pulse is "what's trending this week" regardless of when it was
  // uploaded — useTopPicks('week') was scoped to artworks *uploaded* in the
  // last 7 days instead, which is why an older artwork picking up likes
  // this week never showed here. useTrendingArtworks scores by windowed
  // engagement (artwork_engagement_daily) instead of created_at.
  const { data: FEATURED_ARTWORKS, isLoading, isError } = useTrendingArtworks(8, 7)

  // ── Measure the carousel's available width ────────────────────────────────
  // Callback ref + state (not useRef) because the viewport only mounts after
  // the loading/empty early-returns below, so an effect with [] deps would
  // run while the element doesn't exist yet.
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

  const list = FEATURED_ARTWORKS ?? []
  const n = list.length

  // Card is 448px, but never wider than the space we have (phones: 1 card that
  // fills the row). `visible` = how many cards fit *fully*; whatever width is
  // left over simply shows the start of the next card, because the viewport
  // clips it (e.g. 448 + 16 + 448 + 50px of room => 2 cards + 50px of a third).
  const cardW = width > 0 ? Math.min(CARD_WIDTH, width) : CARD_WIDTH
  const step = cardW + GAP
  const visible = Math.max(1, Math.floor((width + GAP) / step))

  // Only scroll/loop when there are more artworks than fit. Otherwise a loop
  // would show the same artwork twice on screen, so just lay them out.
  const isCarousel = width > 0 && n > visible

  // Auto-advance. `pos` is a dependency so the 6s countdown restarts after
  // every step (including manual ones); paused while the pointer is over it so
  // hover cards / overlays aren't yanked away mid-interaction.
  useEffect(() => {
    if (!isCarousel || paused) return
    const t = setTimeout(() => setPos((p) => p + 1), AUTOPLAY_MS)
    return () => clearTimeout(t)
  }, [isCarousel, paused, pos])

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

  if (isError || n === 0) {
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

  const activeDot = ((pos % n) + n) % n

  const nextStep = () => setPos((p) => p + 1)
  const prevStep = () => setPos((p) => p - 1)

  // Jump so artwork `i` becomes the first visible one, taking the shorter way
  // round the loop.
  const goToArtwork = (i: number) => {
    let delta = (i - activeDot + n) % n
    if (delta > n / 2) delta -= n
    if (delta !== 0) setPos((p) => p + delta)
  }

  // Slots to render: the visible ones, one partial "peek" slot, plus a buffer
  // slot on each side so cards are already mounted (just off-screen) before
  // they slide in.
  const slots: number[] = []
  for (let abs = pos - 1; abs <= pos + visible + 1; abs++) slots.push(abs)

  const renderCard = (artwork: (typeof list)[number]) => (
    <ArtCard artwork={artwork} variant="discover" fillContainer />
  )

  return (
    <section className="w-full bg-[#EBF5F5] py-12 px-8 overflow-hidden min-h-[500px] flex items-center">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-29 items-center w-full">
        <div className="lg:col-span-4 flex flex-col space-y-8">
          <div className="space-y-6">
            <h2 className="text-h3 font-semibold font-raleway leading-8 tracking-wide">
              <span className="text-primary-500">Gallery</span> <span className="text-gray-500">Pulse</span>
            </h2>
            <p className="text-gray-400 font-poppins text-body-m tracking-wide max-w-[332px]">
              These are the artworks that captured the most hearts and eyes this week — across every corner of the gallery.
            </p>
          </div>

          {isCarousel && (
            <div className="flex items-center gap-2 px-6">
              {list.map((_, i) => (
                <div
                  key={i}
                  onClick={() => goToArtwork(i)}
                  className={cn(
                    'h-2 rounded-full transition-all duration-500 cursor-pointer',
                    i === activeDot ? 'w-4 bg-primary-500 rounded-[11px]' : 'w-2 bg-gray-100'
                  )}
                />
              ))}
            </div>
          )}
        </div>

        <div
          className="lg:col-span-8 relative h-[400px] min-w-0"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Viewport: clips the strip, so a partly-visible next card is just
              the overflow being cut off. */}
          <div ref={setViewportEl} className="relative w-full h-full overflow-hidden">
            {width > 0 && !isCarousel && (
              <div className="flex h-full" style={{ gap: GAP }}>
                {list.map((artwork) => (
                  <div
                    key={artwork.id}
                    className="relative h-full shrink-0 rounded-[48px] overflow-hidden bg-neutral-100"
                    style={{ width: cardW }}
                  >
                    {renderCard(artwork)}
                  </div>
                ))}
              </div>
            )}

            {width > 0 && isCarousel && (
              <motion.div
                className="absolute inset-y-0 left-0"
                initial={false}
                animate={{ x: -pos * step }}
                transition={{ type: 'spring', stiffness: 100, damping: 30 }}
              >
                {slots.map((abs) => {
                  const artwork = list[((abs % n) + n) % n]
                  if (!artwork) return null
                  return (
                    <div
                      key={abs}
                      className="absolute top-0 h-full rounded-[48px] overflow-hidden bg-neutral-100"
                      style={{ left: abs * step, width: cardW }}
                    >
                      {renderCard(artwork)}
                    </div>
                  )
                })}
              </motion.div>
            )}
          </div>

          {isCarousel && (
            <>
              <button
                onClick={prevStep}
                className="cursor-pointer absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all z-20 shadow-lg hover:scale-110 active:scale-95 bg-primary-500"
                aria-label="Previous"
              >
                <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.164852 6.62959L6.79533 0.199898C7.20906 -0.201305 8 0.0418882 8 0.570304L8 13.4297C8 13.9581 7.20906 14.2013 6.79533 13.8001L0.164852 7.37041C-0.0549501 7.15726 -0.0549501 6.84274 0.164852 6.62959Z" fill="white" />
                </svg>
              </button>

              <button
                onClick={nextStep}
                className="cursor-pointer absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all z-20 shadow-lg hover:scale-110 active:scale-95 bg-primary-500"
                aria-label="Next"
              >
                <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7.83515 6.62959L1.20467 0.199897C0.790939 -0.201306 5.852e-07 0.0418875 5.62102e-07 0.570303L0 13.4297C-2.30978e-08 13.9581 0.790938 14.2013 1.20467 13.8001L7.83515 7.37041C8.05495 7.15726 8.05495 6.84274 7.83515 6.62959Z" fill="white" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}