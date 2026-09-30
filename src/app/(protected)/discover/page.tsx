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
import { useOpenArtwork } from '@/hooks/use-artwork-viewer'
import type { Artwork } from '@/types/artwork'
import type { FeedSort } from '@/features/home/types'
import type { LocationFilterValue } from '@/components/filters/location-cascade-filter'

const EMPTY_LOCATION: LocationFilterValue = { country: null, state: null, city: null }

export default function DiscoverPage() {
  const [category, setCategory] = useState<string | null>(null)
  const [sort, setSort] = useState<FeedSort | 'all'>('all')
  const openArtwork = useOpenArtwork()
  const [location, setLocation] = useState<LocationFilterValue>(EMPTY_LOCATION)

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useFeed({
    categories: category ? [category] : undefined,
    country: location.country ?? undefined,
    state: location.state ?? undefined,
    city: location.city ?? undefined,
    sort: sort === 'all' ? undefined : sort,
  })

  const artworks = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data])
  const total = data?.pages[0]?.total
  const activeLabel = category
    ? (INTERESTS.find((interest) => interest.id === category)?.label ?? 'Today')
    : 'Today'

  const handleArtworkClick = (artwork: Artwork) =>
    openArtwork(artwork, { siblings: artworks, variant: 'home' })

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
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <ErrorState
            description="Could not load artworks. Check your connection and try again."
            onRetry={() => refetch()}
          />
        </div>
      ) : artworks.length === 0 ? (
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <EmptyState
            title="No artworks found"
            description="Try a different category, or check back soon."
          />
        </div>
      ) : (
        <>
          <MasonryArtworkGrid artworks={artworks} onArtworkClick={handleArtworkClick} />
          {hasNextPage && (
            <LoadMoreButton onClick={() => fetchNextPage()} isLoading={isFetchingNextPage} />
          )}
        </>
      )}

      <Footer />
    </div>
  )
}
