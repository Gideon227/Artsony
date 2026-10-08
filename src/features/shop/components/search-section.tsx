'use client'

import { useEffect, useMemo, useState } from 'react'
import { SearchInput } from '@/components/ui/search-input'
import { Button } from '@/components'
import FilterComponent, { FilterDropdownConfig } from '@/features/home/components/filter'
import { DropdownOption } from '@/components/ui/dropdown'
import { PriceRangeSlider } from '@/components/ui/price-range-slider'
import { INTERESTS } from '@/features/onboarding/data/interests'
import { useArtworkLocations } from '@/hooks/use-artwork'

export type ShopFilterState = {
  category: string | null
  minPrice: number | null
  maxPrice: number | null
  color: string | null
  format: 'PHYSICAL' | 'DIGITAL' | null
  country: string | null
  state: string | null
  city: string | null
}

export const EMPTY_SHOP_FILTERS: ShopFilterState = {
  category: null,
  minPrice: null,
  maxPrice: null,
  color: null,
  format: null,
  country: null,
  state: null,
  city: null,
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
  const [countryQuery, setCountryQuery] = useState('')

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

  const countryOptions = useMemo(() => {
    if (!countryQuery.trim()) return countries
    const q = countryQuery.trim().toLowerCase()
    return countries.filter((c) => c.label.toLowerCase().includes(q))
  }, [countries, countryQuery])

  useEffect(() => {
    setDraftQuery(query)
  }, [query])

  function toSearchableOptions(
    raw: { label: string; artwork_count: number }[] | undefined,
    q: string,
  ): DropdownOption[] {
    const list = (raw ?? []).map((l) => ({ id: l.label, label: l.label }))
    if (!q.trim()) return list
    const lower = q.trim().toLowerCase()
    return list.filter((o) => o.label.toLowerCase().includes(lower))
  }
  
  const priceLabel =
    filters.minPrice !== null || filters.maxPrice !== null
      ? `$${filters.minPrice ?? PRICE_MIN} - $${filters.maxPrice ?? PRICE_MAX}`
      : undefined

  const selectedCategories = useMemo(() => {
    if (!filters.category) return []
    const selectedIds = filters.category.split(',')
    return CATEGORY_OPTIONS.filter((o) => selectedIds.includes(String(o.id)))
  }, [filters.category])

  const dropdowns: FilterDropdownConfig[] = [
    {
      id: 'categories',
      leftIcon: '/icons/widget.svg',
      placeholder: 'Categories',
      indicator: 'checkmark',
      maxSelected: 5,
      multiple: true,
      options: CATEGORY_OPTIONS,
      values: selectedCategories,
      onChangeMultiple: (options) =>
        onFilterChange({
          category: options.length > 0 ? options.map((o) => o.id).join(',') : null,
        }),
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
      options: countryOptions,
      value: filters.country ? countryOptions.find((o) => String(o.id) === String(filters.country)) : undefined,
      onChange: (option) =>
        onFilterChange({ country: option ? String(option.id) : null, state: null, city: null }),
      searchable: true,
      indicator: 'checkmark',
      searchPlaceholder: 'Search country',
      searchValue: countryQuery,
      onSearchChange: setCountryQuery,
      isLoading: isLoadingCountries,
      emptyMessage: 'No matching countries',
      placeholder: 'Location',
      leftIcon: '/icons/map-point.svg',
    }
  ]

  return (
    <div className="w-full max-w-full overflow-hidden px-4 py-6 md:px-2 bg-white box-border">
      <div className="flex justify-between items-center gap-3 sm:gap-4 lg:pt-12 lg:pb-4 lg:px-6 w-full max-w-full min-w-0">
        <div className="max-w-md w-full flex-1 min-w-0 h-12">
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
        </div>

        <Button
          variant="outline"
          className="shrink-0 max-lg:hidden"
          onClick={() => {
            setDraftQuery('')
            onSearch('')
            onClearFilters()
          }}
        >
          Clear Filter
        </Button>

        <button
          onClick={() => {
            setDraftQuery('')
            onSearch('')
            onClearFilters()
          }}
          className="lg:hidden cursor-pointer shrink-0"
          aria-label="Clear filters"
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <mask id="path-1-inside-1_10340_64186" fill="white">
              <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z"/>
            </mask>
            <path d="M0 20M40 20M40 20M0 20M20 0M40 20M20 40M0 20M20 40V38C10.0589 38 2 29.9411 2 20H0H-2C-2 32.1503 7.84974 42 20 42V40ZM40 20H38C38 29.9411 29.9411 38 20 38V40V42C32.1503 42 42 32.1503 42 20H40ZM20 0V2C29.9411 2 38 10.0589 38 20H40H42C42 7.84974 32.1503 -2 20 -2V0ZM20 0V-2C7.84974 -2 -2 7.84974 -2 20H0H2C2 10.0589 10.0589 2 20 2V0Z" fill="#E6E8EB" mask="url(#path-1-inside-1_10340_64186)"/>
            <path d="M26 16C26 19.3137 23.3137 22 20 22C16.6863 22 14 19.3137 14 16C14 12.6863 16.6863 10 20 10C23.3137 10 26 12.6863 26 16Z" fill="#525965"/>
            <path d="M13.0335 18.7834C11.2216 19.816 10 21.7653 10 24C10 27.3137 12.6863 30 16 30C19.3137 30 22 27.3137 22 24C22 23.7437 21.9839 23.4911 21.9527 23.2432C21.3301 23.4107 20.6755 23.5 20 23.5C16.8414 23.5 14.1388 21.5474 13.0335 18.7834Z" fill="#525965"/>
            <path d="M23.3866 22.6937C23.4611 23.1179 23.5 23.5544 23.5 24C23.5 26.0907 22.6446 27.9815 21.2646 29.3417C22.0849 29.7625 23.0147 30 24 30C27.3137 30 30 27.3137 30 24C30 21.7654 28.7783 19.8161 26.9665 18.7835C26.2876 20.4811 25.0062 21.8727 23.3866 22.6937Z" fill="#525965"/>
          </svg>
        </button>
      </div>

      <div className="w-full max-w-full overflow-x-auto">
        <FilterComponent dropdowns={dropdowns} onClear={onClearFilters} hideClearButton />
      </div>
    </div>
  )
}