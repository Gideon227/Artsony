'use client'

import { useEffect, useState } from 'react'
import { SearchInput } from '@/components/ui/search-input'
import { Button } from '@/components'
import FilterComponent, { FilterDropdownConfig } from '@/features/home/components/filter'
import { DropdownOption } from '@/components/ui/dropdown'
import { PriceRangeSlider } from '@/components/ui/price-range-slider'
import { INTERESTS } from '@/features/onboarding/data/interests'
import { useCountries } from '@/hooks/use-countries'

// ─── Filter state (UI-facing) ─────────────────────────────────────────────────
// Kept separate from ArtworkFilters (the API shape) — the shop page converts
// this to ArtworkFilters when building the query. Color has no backend
// support yet (no color/tag column on artworks), so it's tracked here for the
// UI only and intentionally left out of that conversion.

export type ShopFilterState = {
  category: string | null
  minPrice: number | null
  maxPrice: number | null
  color: string | null
  format: 'PHYSICAL' | 'DIGITAL' | null
  location: string | null
}

export const EMPTY_SHOP_FILTERS: ShopFilterState = {
  category: null,
  minPrice: null,
  maxPrice: null,
  color: null,
  format: null,
  location: null,
}

const CATEGORY_OPTIONS: DropdownOption[] = INTERESTS.map((i) => ({ id: i.id, label: i.label }))

const MEDIUM_OPTIONS: DropdownOption[] = [
  { id: 'ALL', label: 'All' },
  { id: 'PHYSICAL', label: 'Physical' },
  { id: 'DIGITAL', label: 'Digital' },
]

const COLOR_OPTIONS: DropdownOption[] = [
  { id: 'red', label: 'Red', hex: '#EF4444' },
  { id: 'orange', label: 'Orange', hex: '#F97316' },
  { id: 'yellow', label: 'Yellow', hex: '#EAB308' },
  { id: 'green', label: 'Green', hex: '#22C55E' },
  { id: 'blue', label: 'Blue', hex: '#3B82F6' },
  { id: 'purple', label: 'Purple', hex: '#A855F7' },
  { id: 'black', label: 'Black', hex: '#171717' },
  { id: 'white', label: 'White', hex: '#FFFFFF' },
]

const PRICE_MIN = 0
const PRICE_MAX = 10000

interface SearchSectionProps {
  query: string
  onSearch: (query: string) => void
  filters: ShopFilterState
  onFilterChange: (patch: Partial<ShopFilterState>) => void
  onClearFilters: () => void
}

export function SearchSection({ query, onSearch, filters, onFilterChange, onClearFilters }: SearchSectionProps) {
  const [draftQuery, setDraftQuery] = useState(query)
  const { countries } = useCountries()

  // Keep the input in sync when the URL's ?q= changes from elsewhere
  // (e.g. navbar search, browser back/forward, "Back to Shop").
  useEffect(() => {
    setDraftQuery(query)
  }, [query])

  const locationOptions: DropdownOption[] = countries.map((c) => ({ id: c.code, label: c.name }))

  const priceLabel =
    filters.minPrice !== null || filters.maxPrice !== null
      ? `$${filters.minPrice ?? PRICE_MIN} - $${filters.maxPrice ?? PRICE_MAX}`
      : undefined

  const dropdowns: FilterDropdownConfig[] = [
    {
      id: 'categories',
      leftIcon: '/icons/widget.svg',
      placeholder: 'Categories',
      options: CATEGORY_OPTIONS,
      value: filters.category ? CATEGORY_OPTIONS.find((o) => o.id === filters.category) : undefined,
      onChange: (option) => onFilterChange({ category: option ? String(option.id) : null }),
    },
    {
      id: 'price',
      leftIcon: '/icons/tag.svg',
      placeholder: 'Price',
      options: [],
      valueLabel: priceLabel,
      customBody: (
        <PriceRangeSlider
          min={PRICE_MIN}
          max={PRICE_MAX}
          value={[filters.minPrice ?? PRICE_MIN, filters.maxPrice ?? PRICE_MAX]}
          onChange={([min, max]) => onFilterChange({ minPrice: min, maxPrice: max })}
        />
      ),
    },
    {
      id: 'color',
      leftIcon: '/icons/palette.svg',
      placeholder: 'Color',
      layout: 'grid',
      options: COLOR_OPTIONS,
      value: filters.color ? COLOR_OPTIONS.find((o) => o.id === filters.color) : undefined,
      onChange: (option) => onFilterChange({ color: option ? String(option.id) : null }),
    },
    {
      id: 'medium',
      leftIcon: '/icons/filters.svg',
      placeholder: 'Medium',
      options: MEDIUM_OPTIONS,
      value: filters.format ? MEDIUM_OPTIONS.find((o) => o.id === filters.format) : MEDIUM_OPTIONS[0],
      onChange: (option) =>
        onFilterChange({ format: option && option.id !== 'ALL' ? (option.id as 'PHYSICAL' | 'DIGITAL') : null }),
    },
    {
      id: 'location',
      leftIcon: '/icons/map-point.svg',
      placeholder: 'Location',
      options: locationOptions,
      value: filters.location ? locationOptions.find((o) => o.id === filters.location) : undefined,
      onChange: (option) => onFilterChange({ location: option ? String(option.id) : null }),
    },
  ]

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 bg-white">
      <div className="flex justify-between items-center gap-4 pt-8 pb-4">
        <div className='max-w-[448px] w-full h-12'>
          <SearchInput
            value={draftQuery}
            onChange={setDraftQuery}
            onSearch={onSearch}
            placeholder="Find your next art obsession"
            leftIconPath={draftQuery ? '/icons/magnifier-red.svg' : 'home/magnifier.svg'}
            rightIconPath={draftQuery ? '/icons/cancel-red.svg' : undefined}
            onRightIconClick={() => { setDraftQuery(''); onSearch('') }}
            className={query ? 'border-primary-500' : undefined}
          />
        </div>

        <Button
          variant="outline"
          className="shrink-0"
          onClick={() => {
            setDraftQuery('')
            onSearch('')
            onClearFilters()
          }}
        >
          Clear Filter
        </Button>
      </div>

      <FilterComponent dropdowns={dropdowns} onClear={onClearFilters} hideClearButton />
    </div>
  )
}
