'use client'

import { useCallback, useEffect, useMemo, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import AroundTheWorld from '@/features/shop/components/around-the-world'
import ArtGrid from '@/features/shop/components/art-grid'
// import { HeroSection } from '@/features/shop/components/hero-section'
import { HeroSection } from '@/features/home/components/hero'
import { SearchSection, ShopFilterState, EMPTY_SHOP_FILTERS } from '@/features/shop/components/search-section'
import TopArt, { type TopArtFilters } from '@/features/shop/components/top-arts'
import TopPicks from '@/features/shop/components/top-picks'
import { useInfiniteArtworkResults } from '@/hooks/use-artwork'
import { useDebouncedValue } from '@/hooks/queries/use-debounce'
import type { Artwork, ArtworkFilters } from '@/types/artwork'
import { useOpenArtwork } from '@/hooks/use-artwork-viewer'
import { ShopResultsGrid } from '@/features/shop/components/shop-result-grid'
import Footer from '@/components/layout/footer'

// Filters (the price slider especially) change rapidly — wait for them to settle before refetching.
const FILTER_DEBOUNCE_MS = 400

function toArtworkFilters(query: string, filters: ShopFilterState): ArtworkFilters {
  return {
    listing_type: 'MARKETPLACE',
    status: 'PUBLISHED',
    visibility: 'PUBLIC',
    search: query || undefined,
    // `category` holds the multi-select as "a,b,c" — the API wants one param per category
    categories: filters.category ? filters.category.split(',') : undefined,
    color: filters.color ?? undefined,
    min_price: filters.minPrice ?? undefined,
    max_price: filters.maxPrice ?? undefined,
    artwork_format: filters.format ?? undefined,
    country: filters.country ?? undefined,
    state: filters.state ?? undefined,
    city: filters.city ?? undefined,
  }
}

function toTopArtFilters(filters: ShopFilterState): TopArtFilters {
  return {
    categories: filters.category ? filters.category.split(',') : undefined,
    minPrice: filters.minPrice ?? undefined,
    maxPrice: filters.maxPrice ?? undefined,
    color: filters.color ?? undefined,
    format: filters.format ?? undefined,
    country: filters.country ?? undefined,
    state: filters.state ?? undefined,
    city: filters.city ?? undefined,
  }
}

function ShopContent() {
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

  const debouncedFilters = useDebouncedValue(filters, FILTER_DEBOUNCE_MS)
  const artworkFilters = useMemo(() => toArtworkFilters(query, debouncedFilters), [query, debouncedFilters])
  const topArtFilters = useMemo(() => toTopArtFilters(debouncedFilters), [debouncedFilters])

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteArtworkResults(artworkFilters, { keepPreviousData: true })

  const artworks = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data])
  const total = data?.pages[0]?.total

  // Ids Top Art is currently showing. null = Top Art hasn't reported yet, so the
  // grid waits instead of flashing the same artworks before they get filtered out.
  const [topArtIds, setTopArtIds] = useState<Set<string> | null>(null)

  const handleTopArtLoaded = useCallback((items: Artwork[]) => {
    setTopArtIds(new Set(items.map((a) => a.id)))
  }, [])

  // Top Art unmounts in search mode; forget its ids so they're fresh when it returns.
  useEffect(() => {
    if (isSearchMode) setTopArtIds(null)
  }, [isSearchMode])

  const gridArtworks = useMemo(
    () => (topArtIds ? artworks.filter((a) => !topArtIds.has(a.id)) : artworks),
    [artworks, topArtIds],
  )

  const openArtwork = useOpenArtwork()

  const handleGridClick = (index: number) => {
    const artwork = gridArtworks[index]
    if (artwork) openArtwork(artwork, { siblings: gridArtworks, variant: 'home' })
  }

  return (
    <div className="bg-white">
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
          <div className='max-md:hidden'>
            <TopPicks />
          </div>
          <TopArt filters={topArtFilters} onClearFilters={handleClearFilters} onLoaded={handleTopArtLoaded} />
          <div className='max-md:hidden'>
            <AroundTheWorld />
          </div>
          <div className='md:hidden'>
            <TopPicks />
          </div>

          {topArtIds && (
            <>
              <ArtGrid
                artworks={gridArtworks}
                num={0}
                // artVariant="shop"
                onCardClick={(_, index) => handleGridClick(index)}
              />

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
        </>
      )}

      <Footer />
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ShopContent />
    </Suspense>
  )
}