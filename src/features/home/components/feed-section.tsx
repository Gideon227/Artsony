'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { cn, getDisplayThumbnail } from '@/utils'
import { ArtCard } from '@/components/ui/art-card'
import { Dropdown, type DropdownOption } from '@/components/ui/dropdown'
import { ArtworkGridSkeleton } from './artwork-grid-skeleton'
import { FEED_TABS } from '../types'
import type { FeedSort } from '../types'
import type { Artwork } from '@/types/artwork'
import { SearchInput } from '@/components/ui/search-input'

interface FeedSectionProps {
  query: string
  onSearch: (query: string) => void
  activeTab: FeedSort
  onTabChange: (tab: FeedSort) => void
  artworks: Artwork[]
  isLoading: boolean
  onOpenMobileFilters?: () => void
  onArtworkClick: (artwork: Artwork) => void
}

const FEED_TAB_OPTIONS: DropdownOption[] = FEED_TABS.map((t) => ({ id: t.value, label: t.label }))

export function FeedSection({ query, onSearch, activeTab, onTabChange, artworks, isLoading, onOpenMobileFilters, onArtworkClick }: FeedSectionProps) {
  const [draftQuery, setDraftQuery] = useState(query)
  const activeOption = FEED_TAB_OPTIONS.find((o) => o.id === activeTab) ?? FEED_TAB_OPTIONS[0]

  return (
    <section className="w-full py-6 md:py-14">
      <div className="px-4 md:px-8">

        {/* Mobile header */}
        <div className="flex gap-4 items-center md:hidden mb-6">
          <SearchInput
            value={draftQuery}
            onChange={setDraftQuery}
            onSearch={onSearch}
            placeholder="Find your next art obsession"
            leftIconPath={draftQuery ? '/icons/magnifier-red.svg' : 'home/magnifier.svg'}
            rightIconPath={draftQuery ? '/icons/cancel-red.svg' : undefined}
            onRightIconClick={() => {
              setDraftQuery('')
              onSearch('')
            }}
            className={query ? 'border-primary-500' : undefined}
          />

          <button onClick={onOpenMobileFilters} aria-label="Open filters">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <mask id="path-1-inside-1_7180_37631" fill="white">
              <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z"/>
              </mask>
              <path d="M0 20M40 20M40 20M0 20M20 0M40 20M20 40M0 20M20 40V38C10.0589 38 2 29.9411 2 20H0H-2C-2 32.1503 7.84974 42 20 42V40ZM40 20H38C38 29.9411 29.9411 38 20 38V40V42C32.1503 42 42 32.1503 42 20H40ZM20 0V2C29.9411 2 38 10.0589 38 20H40H42C42 7.84974 32.1503 -2 20 -2V0ZM20 0V-2C7.84974 -2 -2 7.84974 -2 20H0H2C2 10.0589 10.0589 2 20 2V0Z" fill="#E6E8EB" mask="url(#path-1-inside-1_7180_37631)"/>
              <path d="M26 16C26 19.3137 23.3137 22 20 22C16.6863 22 14 19.3137 14 16C14 12.6863 16.6863 10 20 10C23.3137 10 26 12.6863 26 16Z" fill="#525965"/>
              <path d="M13.0335 18.7834C11.2216 19.816 10 21.7653 10 24C10 27.3137 12.6863 30 16 30C19.3137 30 22 27.3137 22 24C22 23.7437 21.9839 23.4911 21.9527 23.2432C21.3301 23.4107 20.6755 23.5 20 23.5C16.8414 23.5 14.1388 21.5474 13.0335 18.7834Z" fill="#525965"/>
              <path d="M23.3866 22.6937C23.4611 23.1179 23.5 23.5544 23.5 24C23.5 26.0907 22.6446 27.9815 21.2646 29.3417C22.0849 29.7625 23.0147 30 24 30C27.3137 30 30 27.3137 30 24C30 21.7654 28.7783 19.8161 26.9665 18.7835C26.2876 20.4811 25.0062 21.8727 23.3866 22.6937Z" fill="#525965"/>
            </svg>
          </button>
        </div>

        {/* Header + feed-mode dropdown (desktop) */}
        <div className="flex flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h2 className="flex-1 font-raleway font-semibold text-h6 lg:text-h4 text-primary-500 leading-10">Top Art</h2>

          <div style={{ width: 332 }} className="w-80 max-sm:w-full max-md:hidden">
            <Dropdown
              options={FEED_TAB_OPTIONS}
              value={activeOption}
              onChange={(opt) => onTabChange(opt.id as FeedSort)}
              indicator="highlight"
            />
          </div>

          <div style={{ width: 132 }} className='lg:hidden'>
            <Dropdown
              options={FEED_TAB_OPTIONS}
              value={activeOption}
              onChange={(opt) => onTabChange(opt.id as FeedSort)}
              multiple={false}
              indicator="highlight"
              placeholder='Sort By'
            />
          </div>
        </div>

        {isLoading ? (
          <ArtworkGridSkeleton count={8} />
        ) : artworks.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10">
            {artworks.map((artwork, i) => (
              <motion.div
                key={artwork.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.4 }}
                className="flex justify-center"
              >
                <ArtCard
                  image={getDisplayThumbnail(artwork.assets)}
                  title={artwork.title}
                  // artworkId={artwork.id}
                  onCardClick={() => onArtworkClick(artwork)}
                  showVideo={artwork.assets[0]?.media_type === 'VIDEO'}
                  artist={[{
                    id: artwork.creator?.id || artwork.creator_id,
                    name: artwork.creator?.profile?.display_name || artwork.creator?.username || 'Artist',
                    avatarUrl: artwork.creator?.profile?.avatar_url ?? '/images/image-avatar.svg',
                    role: artwork.creator?.role || 'Artist',
                    stats: {
                      followers: String(artwork.creator?.profile?.followers_count ?? 0),
                      likes: String(artwork.like_count ?? 0),
                      following: String(artwork.creator?.profile?.following_count ?? 0),
                    },
                  }]}
                  stats={{ likes: String(artwork.like_count), views: String(artwork.view_count) }}
                  variant="standard"
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 py-24 text-center">
      <div className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <path d="M4 20L10 14L14 18L20 10L24 15" stroke="#5DAFB1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="2" y="2" width="24" height="24" rx="6" stroke="#5DAFB1" strokeWidth="2"/>
        </svg>
      </div>
      <p className="font-poppins text-[15px] font-medium text-neutral-600">No artworks yet</p>
      <p className="font-poppins text-[13px] text-neutral-400 max-w-xs">Be the first to share your work with the community.</p>
    </div>
  )
}