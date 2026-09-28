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
    <div className="px-4 md:px-2 bg-white">
      <div className="flex justify-between items-center gap-4 pt-12 pb-4 px-6">
        <div className="max-w-md w-full h-12">
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