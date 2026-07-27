'use client'

import * as React from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, DollarSign, HelpCircle } from 'lucide-react'
import { Dropdown, type DropdownOption } from '@/components/ui/dropdown'
import { TrendIndicator } from '@/components/ui/metric-card'
import { useFeaturedArtworks } from '@/hooks/queries/use-stats'
import { formatUsd } from '@/lib/wallet/format'
import type { ArtworkRankSort } from '@/types/stats'

const SORT_OPTIONS: DropdownOption[] = [
  { id: 'EARNINGS', label: 'By Earnings' },
  { id: 'SALES', label: 'By Sales' },
  { id: 'VIEWS', label: 'By Views' },
]

function TpaSkeleton() {
  return (
    <div className="flex-1 rounded-2xl border border-gray-50 bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="h-4 w-16 animate-pulse rounded bg-gray-50" />
        <div className="h-9 w-28 animate-pulse rounded-full bg-gray-50" />
      </div>
      <div className="mt-4 aspect-square w-full animate-pulse rounded-2xl bg-gray-50" />
      <div className="mt-6 h-5 w-24 animate-pulse rounded bg-gray-50" />
      <div className="mt-3 h-8 w-32 animate-pulse rounded bg-gray-50" />
    </div>
  )
}

export function FeaturedArtworkCard() {
  const [sort, setSort] = React.useState<ArtworkRankSort>('EARNINGS')
  const [index, setIndex] = React.useState(0)
  const { data: artworks, isLoading } = useFeaturedArtworks(sort)

  React.useEffect(() => setIndex(0), [sort])

  if (isLoading || !artworks || artworks.length === 0) return <TpaSkeleton />

  const safeIndex = Math.min(index, artworks.length - 1)
  const artwork = artworks[safeIndex]!

  const goPrev = () => setIndex((i) => (i === 0 ? artworks.length - 1 : i - 1))
  const goNext = () => setIndex((i) => (i === artworks.length - 1 ? 0 : i + 1))

  return (
    <div className="flex-1 rounded-2xl border border-gray-50 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-body-s font-medium text-body">
          TPA
          <button type="button" aria-label="About TPA" className="text-info-500">
            <HelpCircle className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </span>

        <Dropdown
          options={SORT_OPTIONS}
          value={SORT_OPTIONS.find((opt) => opt.id === sort)}
          onChange={(option) => setSort(option.id as ArtworkRankSort)}
          className="w-40"
        />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={goPrev}
          aria-label="Previous artwork"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-50 text-body transition-colors hover:bg-neutral-50"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
        </button>

        <div className="relative aspect-square w-full flex-1 overflow-hidden rounded-2xl bg-neutral-100">
          <AnimatePresence mode="wait">
            <motion.div
              key={artwork.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <Image
                src={artwork.image_url}
                alt={artwork.title}
                fill
                className="object-cover"
                onError={(e) => {
                  // Graceful fallback if image doesn't exist yet
                  ;(e.currentTarget as HTMLImageElement).src = '/images/placeholder-art.jpg'
                }}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={goNext}
          aria-label="Next artwork"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-500 text-white transition-colors hover:bg-primary-600"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>

      <p className="mt-3 text-center text-body-s font-medium text-body">{artwork.title}</p>

      <div className="mt-2 flex items-center justify-center gap-1.5">
        {artworks.map((a, i) => (
          <button
            key={a.id}
            type="button"
            aria-label={`Go to artwork ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${i === safeIndex ? 'w-5 bg-primary-500' : 'w-1.5 bg-gray-50'}`}
          />
        ))}
      </div>

      <div className="mt-6 border-t border-gray-50 pt-4">
        <p className="font-raleway text-h6 font-semibold text-heading">
          Rank <span className="text-primary-500">#{String(artwork.rank).padStart(2, '0')}</span>
        </p>
        <p className="mt-1 text-body-s text-body">Top artworks by total earnings this month.</p>

        <div className="mt-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success-100">
            <DollarSign className="h-4 w-4 text-success-600" strokeWidth={1.75} />
          </span>
          <span className="text-body-s text-body">Total Earnings:</span>
        </div>
        <p className="mt-1 font-raleway text-h5 font-semibold text-heading">
          <span className="mr-1 font-normal text-body-m text-text-alt-grey">$</span>
          {formatUsd(artwork.total_earnings)}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-body-s text-body">Total Sales:</span>
          <span className="text-body-s font-medium text-heading">{artwork.total_sales} units</span>
        </div>

        <div className="mt-3">
          <TrendIndicator trend={artwork} label="This Month" />
        </div>
      </div>
    </div>
  )
}
