'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils'
import { ArtCard } from '@/components/ui/art-card'
import { Dropdown, type DropdownOption } from '@/components/ui/dropdown'
import { ArtworkGridSkeleton } from './artwork-grid-skeleton'
import { FEED_TABS } from '../types'
import type { FeedSort } from '../types'
import type { Artwork } from '@/types/artwork'

interface FeedSectionProps {
  activeTab: FeedSort
  onTabChange: (tab: FeedSort) => void
  artworks: Artwork[]
  isLoading: boolean
  onOpenMobileFilters?: () => void
  onArtworkClick: (artwork: Artwork) => void
}

const FEED_TAB_OPTIONS: DropdownOption[] = FEED_TABS.map((t) => ({ id: t.value, label: t.label }))

export function FeedSection({ activeTab, onTabChange, artworks, isLoading, onOpenMobileFilters, onArtworkClick }: FeedSectionProps) {
  const activeOption = FEED_TAB_OPTIONS.find((o) => o.id === activeTab) ?? FEED_TAB_OPTIONS[0]

  return (
    <section className="w-full py-6 md:py-14">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">

        {/* Mobile header */}
        <div className="flex justify-between items-center md:hidden mb-6">
          <button onClick={onOpenMobileFilters} aria-label="Open filters">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <mask id="path-1-inside-1_7180_37631" fill="white">
                <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z"/>
              </mask>
              <path d="M0 20M40 20M40 20M0 20M20 0M40 20M20 40M0 20M20 40V38C10.0589 38 2 29.9411 2 20H0H-2C-2 32.1503 7.84974 42 20 42V40ZM40 20H38C38 29.9411 29.9411 38 20 38V40V42C32.1503 42 42 32.1503 42 20H40ZM20 0V2C29.9411 2 38 10.0589 38 20H40H42C42 7.84974 32.1503 -2 20 -2V0ZM20 0V-2C7.84974 -2 -2 7.84974 -2 20H0H2C2 10.0589 10.0589 2 20 2V0Z" fill="#E6E8EB" mask="url(#path-1-inside-1_7180_37631)"/>
              <path d="M27 11H13C11.5858 11 10.8787 11 10.4393 11.4122C10 11.8244 10 12.4878 10 13.8147V14.5045C10 15.5423 10 16.0612 10.2596 16.4914C10.5192 16.9216 10.9935 17.1886 11.942 17.7225L14.855 19.3624C15.4915 19.7206 15.8097 19.8998 16.0375 20.0976C16.512 20.5095 16.8041 20.9935 16.9364 21.5872C17 21.8722 17 22.2058 17 22.8729L17 25.5424C17 26.452 17 26.9067 17.2519 27.2613C17.5038 27.6158 17.9513 27.7907 18.8462 28.1406C20.7248 28.875 21.6641 29.2422 22.3321 28.8244C23 28.4066 23 27.4519 23 25.5424V22.8729C23 22.2058 23 21.8722 23.0636 21.5872C23.1959 20.9935 23.488 20.5095 23.9625 20.0976C24.1903 19.8998 24.5085 19.7206 25.145 19.3624L28.058 17.7225C29.0065 17.1886 29.4808 16.9216 29.7404 16.4914C30 16.0612 30 15.5423 30 14.5045V13.8147C30 12.4878 30 11.8244 29.5607 11.4122C29.1213 11 28.4142 11 27 11Z" fill="#525965"/>
            </svg>
          </button>

          <div style={{ width: 132 }}>
            <Dropdown
              options={FEED_TAB_OPTIONS}
              value={activeOption}
              onChange={(opt) => onTabChange(opt.id as FeedSort)}
              indicator="highlight"
              placeholder="For you"
            />
          </div>
        </div>

        {/* Header + feed-mode dropdown (desktop) */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h2 className="flex-1 font-raleway font-semibold text-h4 text-primary-500 leading-10">Top Art</h2>

          <div style={{ width: 332 }} className="w-80 max-sm:w-full max-md:hidden">
            <Dropdown
              options={FEED_TAB_OPTIONS}
              value={activeOption}
              onChange={(opt) => onTabChange(opt.id as FeedSort)}
              indicator="highlight"
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
                  image={artwork.assets[0]?.thumbnail_url ?? artwork.assets[0]?.optimized_url ?? artwork.assets[0]?.original_url ?? ''}
                  title={artwork.title}
                  artworkId={artwork.id}
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