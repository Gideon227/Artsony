'use client'

import { useMemo, useState } from 'react'
import { Navbar } from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import { Spinner, ErrorState, EmptyState } from '@/components'
import { useFeed } from '@/hooks/use-artwork'
import { INTERESTS } from '@/features/onboarding/data/interests'
import { DiscoverHero } from '@/features/discover/components/discover-hero'
import { CategoryPills } from '@/features/discover/components/category-pills'
import { DiscoverResultsHeader } from '@/features/discover/components/discover-results-header'
import { MasonryArtworkGrid } from '@/features/discover/components/masonry-artwork-grid'
import { LoadMoreButton } from '@/features/discover/components/load-more-button'
import ArtworkViewOverlay from '@/features/artwork/components/artwork-view-overlay'
import type { Artwork } from '@/types/artwork'
import type { FeedSort } from '@/features/home/types'

export default function DiscoverPage() {
  const [category, setCategory] = useState<string | null>(null)
  const [sort, setSort] = useState<FeedSort | 'all'>('all')
  const [activeArtwork, setActiveArtwork] = useState<Artwork | null>(null)

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useFeed({
    category: category ?? undefined,
    sort: sort === 'all' ? undefined : sort,
  })

  const artworks = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data])
  const total = data?.pages[0]?.total
  const activeLabel = category
    ? (INTERESTS.find((interest) => interest.id === category)?.label ?? 'Today')
    : 'Today'

  const activeArtworkIndex = activeArtwork ? artworks.findIndex((a) => a.id === activeArtwork.id) : -1

  const handleNavigateArtwork = (direction: 'prev' | 'next') => {
    if (activeArtworkIndex === -1) return
    const nextIndex = direction === 'next'
      ? Math.min(activeArtworkIndex + 1, artworks.length - 1)
      : Math.max(activeArtworkIndex - 1, 0)
    if (nextIndex === activeArtworkIndex) return
    setActiveArtwork(artworks[nextIndex])
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <DiscoverHero />

      <CategoryPills value={category} onChange={setCategory} />

      <DiscoverResultsHeader
        activeLabel={activeLabel}
        total={total}
        sort={sort}
        onSortChange={setSort}
      />

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <div className="px-4 md:px-8">
          <ErrorState
            description="Could not load artworks. Check your connection and try again."
            onRetry={() => refetch()}
          />
        </div>
      ) : artworks.length === 0 ? (
        <div className="px-4 md:px-8">
          <EmptyState
            title="No artworks found"
            description="Try a different category, or check back soon."
          />
        </div>
      ) : (
        <>
          <MasonryArtworkGrid artworks={artworks} onArtworkClick={setActiveArtwork} />
          {hasNextPage && (
            <LoadMoreButton onClick={() => fetchNextPage()} isLoading={isFetchingNextPage} />
          )}
        </>
      )}

      <Footer />

      {activeArtwork && (
        <ArtworkViewOverlay
          artwork={activeArtwork}
          onClose={() => setActiveArtwork(null)}
          onNavigate={handleNavigateArtwork}
        />
      )}
    </div>
  )
}
