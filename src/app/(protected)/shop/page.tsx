'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import AroundTheWorld from '@/features/shop/components/around-the-world'
import ArtGrid from '@/features/shop/components/art-grid'
import { HeroSection } from '@/features/shop/components/hero-section'
import { SearchSection, ShopFilterState, EMPTY_SHOP_FILTERS } from '@/features/shop/components/search-section'
import TopArt from '@/features/shop/components/top-arts'
import TopPicks from '@/features/shop/components/top-picks'
import { ResultsGrid } from '@/features/search/components/results-grid'
import { useInfiniteArtworkResults } from '@/hooks/use-artwork'
import type { ArtworkFilters, Artwork } from '@/types/artwork'
import ArtworkViewOverlay from '@/features/artwork/components/shop/artwork-view-overlay'
import { ShopResultsGrid } from '@/features/shop/components/shop-result-grid'

function toArtworkFilters(query: string, filters: ShopFilterState): ArtworkFilters {
  // listing_type is always MARKETPLACE here — Shop only ever surfaces
  // purchasable artwork, unlike the home feed which mixes in portfolio pieces.
  return {
    listing_type: 'MARKETPLACE',
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
    search: query || undefined,
    categories: filters.category ? [filters.category] : undefined,
    min_price: filters.minPrice ?? undefined,
    max_price: filters.maxPrice ?? undefined,
    artwork_format: filters.format ?? undefined,
    location: filters.location ?? undefined,
    // Note: filters.color is intentionally not sent — there's no color/tag
    // column on artworks yet, so it's UI-only until that's built.
  }
}

const ShopPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const isSearchMode = query.trim().length > 0

  const [filters, setFilters] = useState<ShopFilterState>(EMPTY_SHOP_FILTERS)

  const handleSearch = useCallback(
    (next: string) => {
      const trimmed = next.trim()
      router.push(trimmed ? `/shop?q=${encodeURIComponent(trimmed)}` : '/shop')
    },
    [router]
  )

  const handleFilterChange = useCallback((patch: Partial<ShopFilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }))
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilters(EMPTY_SHOP_FILTERS)
  }, [])

  const artworkFilters = useMemo(() => toArtworkFilters(query, filters), [query, filters])

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteArtworkResults(artworkFilters)

  const artworks = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data])
  const total = data?.pages[0]?.total

  const [activeGridIndex, setActiveGridIndex] = useState<number | null>(null)
  const activeGridArtwork = activeGridIndex !== null ? artworks[activeGridIndex] ?? null : null

  const handleGridNavigate = (direction: 'prev' | 'next') => {
    if (activeGridIndex === null) return
    const nextIndex = direction === 'next'
      ? Math.min(activeGridIndex + 1, artworks.length - 1)
      : Math.max(activeGridIndex - 1, 0)
    if (nextIndex !== activeGridIndex) setActiveGridIndex(nextIndex)
  }

  return (
    <div className='bg-white'>
      <Navbar />
      <HeroSection />
      <SearchSection
        query={query}
        onSearch={handleSearch}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {isSearchMode ? (
        <ShopResultsGrid
          artworks={artworks}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={Boolean(hasNextPage)}
          fetchNextPage={fetchNextPage}
          query={query}
          total={total}
        />
      ) : (
        <>
          <TopPicks />
          <TopArt />
          <AroundTheWorld />

          <ArtGrid artworks={artworks} num={0} artVariant="shop" onCardClick={(_, index) => setActiveGridIndex(index)} />

          {activeGridArtwork && (
            <ArtworkViewOverlay
              artwork={activeGridArtwork}
              onClose={() => setActiveGridIndex(null)}
              onNavigate={handleGridNavigate}
            />
          )}


          <div className="flex justify-center pb-16">
            {hasNextPage && (
              <button
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="flex items-center gap-2 font-poppins text-[14px] text-neutral-500 border border-gray-100 rounded-full px-6 py-3 hover:border-primary-500 hover:text-primary-500 transition-colors disabled:opacity-50"
              >
                {isFetchingNextPage && <Loader2 className="w-4 h-4 animate-spin" />}
                Load more Art
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default ShopPage
