'use client'

import { useMemo, useState } from 'react'
import { Dropdown, DropdownOption } from '@/components/ui/dropdown'
import { useArtworkLocations } from '@/hooks/use-artwork'

export type LocationFilterValue = {
  country: string | null
  state: string | null
  city: string | null
}

interface Props {
  value: LocationFilterValue
  onChange: (value: LocationFilterValue) => void
  className?: string
}

function useSearchableOptions(
  raw: { label: string; artwork_count: number }[] | undefined,
  query: string,
): DropdownOption[] {
  return useMemo(() => {
    const list = (raw ?? []).map((l) => ({ id: l.label, label: l.label }))
    if (!query.trim()) return list
    const q = query.trim().toLowerCase()
    return list.filter((o) => o.label.toLowerCase().includes(q))
  }, [raw, query])
}

// Three cascading dropdowns backed by real artist location data (see
// get_distinct_artist_locations() on the backend) — state options are
// scoped to the selected country, city options to the selected
// country+state, so you never see an option that would return zero
// results. Picking a broader level clears anything narrower under it.
export function LocationCascadeFilter({ value, onChange, className }: Props) {
  const [countryQuery, setCountryQuery] = useState('')
  const [stateQuery, setStateQuery] = useState('')
  const [cityQuery, setCityQuery] = useState('')

  const { data: countries, isLoading: isLoadingCountries } = useArtworkLocations('country')
  const { data: states, isLoading: isLoadingStates } = useArtworkLocations(
    'state',
    value.country ? { country: value.country } : undefined,
  )
  const { data: cities, isLoading: isLoadingCities } = useArtworkLocations(
    'city',
    value.country ? { country: value.country, state: value.state ?? undefined } : undefined,
  )

  const countryOptions = useSearchableOptions(countries, countryQuery)
  const stateOptions = useSearchableOptions(states, stateQuery)
  const cityOptions = useSearchableOptions(cities, cityQuery)

  return (
    <div className={`flex items-center gap-x-3 ${className ?? ''}`}>
      <div style={{ width: 180 }}>
        <Dropdown
          options={countryOptions}
          value={value.country ? { id: value.country, label: value.country } : undefined}
          onChange={(opt) =>
            onChange({ country: opt ? String(opt.id) : null, state: null, city: null })
          }
          leftIcon="/icons/map-point.svg"
          placeholder="Country"
          searchable
          searchPlaceholder="Search country"
          searchValue={countryQuery}
          onSearchChange={setCountryQuery}
          isLoading={isLoadingCountries}
          emptyMessage="No countries yet"
        />
      </div>

      <div style={{ width: 180 }}>
        <Dropdown
          options={stateOptions}
          value={value.state ? { id: value.state, label: value.state } : undefined}
          onChange={(opt) => onChange({ ...value, state: opt ? String(opt.id) : null, city: null })}
          placeholder="State"
          disabled={!value.country}
          searchable
          searchPlaceholder="Search state"
          searchValue={stateQuery}
          onSearchChange={setStateQuery}
          isLoading={isLoadingStates}
          emptyMessage={value.country ? 'No states yet' : 'Select a country first'}
        />
      </div>

      <div style={{ width: 180 }}>
        <Dropdown
          options={cityOptions}
          value={value.city ? { id: value.city, label: value.city } : undefined}
          onChange={(opt) => onChange({ ...value, city: opt ? String(opt.id) : null })}
          placeholder="City"
          disabled={!value.country}
          searchable
          searchPlaceholder="Search city"
          searchValue={cityQuery}
          onSearchChange={setCityQuery}
          isLoading={isLoadingCities}
          emptyMessage={value.country ? 'No cities yet' : 'Select a country first'}
        />
      </div>
    </div>
  )
}
