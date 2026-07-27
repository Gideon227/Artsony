'use client'

import { useMemo, useState } from 'react'
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
import { useFeed, useArtworkLocations } from '@/hooks/use-artwork'
import type { FeedSort } from '@/features/home/types'

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
  const [selectedLocation, setSelectedLocation] = useState<DropdownOption | null>(null)
  const [selectedColor, setSelectedColor] = useState<DropdownOption | null>(null)
  const [hexQuery, setHexQuery] = useState('')
  const [locationQuery, setLocationQuery] = useState('')
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)

  const { data: locations, isLoading: isLoadingLocations } = useArtworkLocations()

  const locationOptions: DropdownOption[] = useMemo(() => {
    const list = (locations ?? []).map((l) => ({ id: l.label, label: l.label }))
    if (!locationQuery.trim()) return list
    const q = locationQuery.trim().toLowerCase()
    return list.filter((c) => c.label.toLowerCase().includes(q))
  }, [locations, locationQuery])

  const feedQuery = useFeed({
    sort: activeTab,
    categories: selectedCategories.map((c) => String(c.id)),
    ...(selectedLocation ? { location: selectedLocation.label } : {}),
  })

  const allArtworks = feedQuery.data?.pages.flatMap((p) => p.data) ?? []
  const midpoint = Math.ceil(allArtworks.length / 2)
  const firstHalf = allArtworks.slice(0, midpoint)
  const secondHalf = allArtworks.slice(midpoint)

  const handleClearFilters = () => {
    setSelectedCategories([])
    setSelectedLocation(null)
    setSelectedColor(null)
    setLocationQuery('')
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
      options: locationOptions,
      value: selectedLocation,
      onChange: setSelectedLocation,
      indicator: 'checkmark',
      searchable: true,
      searchPlaceholder: 'Search location',
      searchValue: locationQuery,
      onSearchChange: setLocationQuery,
      isLoading: isLoadingLocations,
      emptyMessage: 'No matching locations',
      placeholder: 'Location',
      leftIcon: '/icons/map-point.svg',
    },
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
      />

      <CreatorCTASection />

      <FeedContinuation
        artworks={secondHalf}
        isLoading={feedQuery.isLoading}
        hasNextPage={feedQuery.hasNextPage}
        isFetchingNextPage={feedQuery.isFetchingNextPage}
        onLoadMore={() => feedQuery.fetchNextPage()}
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