'use client'

import { useEffect, useMemo, useState } from 'react'
import { Spinner } from '@/components'
import Footer from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { HeroSection } from '@/features/home/components/hero'
import { FeedSection } from '@/features/home/components/feed-section'
import { FeedContinuation } from '@/features/home/components/feed-continuation'
import { CreatorCTASection } from '@/features/home/components/creator-cta-section'
import { GalleryPulseSection } from '@/features/home/components/gallery-pulse-section'
import { MobileFilterDrawer } from '@/features/home/components/mobile-filter-drawer'
import { useAuthStore } from '@/store'
import FilterComponent, { FilterDropdownConfig } from '@/features/home/components/filter'
import { DropdownOption } from '@/components/ui/dropdown'
import { INTERESTS } from '@/features/onboarding/data/interests'
import { COLOR_SWATCHES, findClosestSwatch } from '@/features/home/data/color-swatches'
import { useFeed } from '@/hooks/use-artwork'
import type { FeedSort } from '@/features/home/types'
import { useOpenArtwork } from '@/hooks/use-artwork-viewer'
import type { Artwork } from '@/types/artwork'

const MAX_CATEGORIES = 5

const CATEGORY_OPTIONS: DropdownOption[] = [...INTERESTS]
  .sort((a, b) => a.label.localeCompare(b.label))
  .map((item) => ({ id: item.id, label: item.label }))

const COLOR_OPTIONS: DropdownOption[] = COLOR_SWATCHES.map((c) => ({
  id: c.id,
  label: c.label,
  hex: c.hex,
}))

const HomePage = () => {
  const isHydrated = useAuthStore((s) => s.isHydrated)

  const [activeTab, setActiveTab] = useState<FeedSort>('for_you')
  const [selectedCategories, setSelectedCategories] = useState<DropdownOption[]>([])
  const [selectedCountry, setSelectedCountry] = useState<DropdownOption | null>(null)
  const [selectedColor, setSelectedColor] = useState<DropdownOption | null>(null)
  const [hexQuery, setHexQuery] = useState('')
  const [countryQuery, setCountryQuery] = useState('')
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  const openArtwork = useOpenArtwork()

  // Explicit state for countries fetched from third-party API
  const [countries, setCountries] = useState<DropdownOption[]>([])
  const [isLoadingCountries, setIsLoadingCountries] = useState(false)

  useEffect(() => {
    const fetchCountries = async () => {
      setIsLoadingCountries(true)
      try {
        const response = await fetch('https://countriesnow.space/api/v0.1/countries')
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
        const resData = await response.json()
            
        if (!resData.error && Array.isArray(resData.data)) {
          const formattedCountries: DropdownOption[] = resData.data.map((item: { country: string }) => ({
            id: item.country, 
            label: item.country,
          }))
          setCountries(formattedCountries)
        }
      } catch (error) {
        console.error('Failed to load countries selection table:', error)
      } finally {
        setIsLoadingCountries(false)
      }
    }

    fetchCountries()
  }, [])

  // Filter fetched countries based on user input query
  const countryOptions = useMemo(() => {
    if (!countryQuery.trim()) return countries
    const q = countryQuery.trim().toLowerCase()
    return countries.filter((c) => c.label.toLowerCase().includes(q))
  }, [countries, countryQuery])

  const feedQuery = useFeed({
    sort: activeTab,
    categories: selectedCategories.map((c) => String(c.id)),
    ...(selectedCountry ? { country: String(selectedCountry.id) } : {})
  })

  const allArtworks = feedQuery.data?.pages.flatMap((p) => p.data) ?? []
  const midpoint = Math.ceil(allArtworks.length / 2)
  const firstHalf = allArtworks.slice(0, midpoint)
  const secondHalf = allArtworks.slice(midpoint)

  const handleArtworkClick = (artwork: Artwork) =>
    openArtwork(artwork, { siblings: allArtworks, variant: 'home' })

  const handleClearFilters = () => {
    setSelectedCategories([])
    setSelectedCountry(null)
    setSelectedColor(null)
    setCountryQuery('')
    setHexQuery('')
  }

  const filterDropdowns: FilterDropdownConfig[] = [
    {
      id: 'category',
      options: CATEGORY_OPTIONS,
      multiple: true,
      values: selectedCategories,
      onChangeMultiple: setSelectedCategories,
      maxSelected: MAX_CATEGORIES,
      indicator: 'checkmark',
      placeholder: 'Categories',
      leftIcon: '/icons/widget.svg',
    },
    {
      id: 'color',
      options: COLOR_OPTIONS,
      value: selectedColor,
      onChange: setSelectedColor,
      layout: 'grid',
      searchable: true,
      searchPlaceholder: 'Hex code',
      searchValue: hexQuery,
      searchVariant: 'button',
      onSearchChange: setHexQuery,
      onSearchSubmit: () => {
        const closest = findClosestSwatch(hexQuery)
        if (closest) setSelectedColor({ id: closest.id, label: closest.label, hex: closest.hex })
      },
      placeholder: 'Color',
      leftIcon: '/icons/palette.svg',
    },
    {
      id: 'location',
      options: countryOptions,
      value: selectedCountry,
      onChange: (opt) => {
        setSelectedCountry(opt)
      },
      indicator: 'checkmark',
      searchable: true,
      searchPlaceholder: 'Search country',
      searchValue: countryQuery,
      onSearchChange: setCountryQuery,
      isLoading: isLoadingCountries,
      emptyMessage: 'No matching countries',
      placeholder: 'Location',
      leftIcon: '/icons/map-point.svg',
    }
  ]

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <GalleryPulseSection />

      <FilterComponent dropdowns={filterDropdowns} onClear={handleClearFilters} />

      <FeedSection
        activeTab={activeTab}
        onTabChange={setActiveTab}
        artworks={firstHalf}
        isLoading={feedQuery.isLoading}
        onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
        onArtworkClick={handleArtworkClick}
      />

      <CreatorCTASection />

      <FeedContinuation
        artworks={secondHalf}
        isLoading={feedQuery.isLoading}
        hasNextPage={feedQuery.hasNextPage}
        isFetchingNextPage={feedQuery.isFetchingNextPage}
        onLoadMore={() => feedQuery.fetchNextPage()}
        onArtworkClick={handleArtworkClick}
      />

      <Footer />

      <MobileFilterDrawer
        open={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        dropdowns={filterDropdowns}
        onClear={handleClearFilters}
      />
    </div>
  )
}

export default HomePage