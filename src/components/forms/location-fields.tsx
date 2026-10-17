'use client'

import { useMemo, useState } from 'react'
import { Dropdown, type DropdownArrow, type DropdownOption } from '@/components/ui/dropdown'
import { getCountryName, useCountryOptions, useStateOptions } from '@/hooks/use-location-data'

export const FieldError = ({ message }: { message?: string }) =>
  message ? <p className='pl-4 text-xs font-semibold text-error-500'>{message}</p> : null

interface CountryFieldProps {
  value: string
  onChange: (code: string) => void
  disabled?: boolean
  error?: string
  placeholder?: string
  arrow?: DropdownArrow
}

export const CountryField = ({
  value,
  onChange,
  disabled,
  error,
  placeholder = 'Country',
  arrow = 'chevron',
}: CountryFieldProps) => {
  const { countries, isLoading } = useCountryOptions()
  const [query, setQuery] = useState('')

  const options = useMemo<DropdownOption[]>(
    () => countries.map((c) => ({ id: c.code, label: c.name })),
    [countries],
  )
  const selected = useMemo<DropdownOption | undefined>(() => {
    if (!value) return undefined
    return options.find((o) => o.id === value) ?? { id: value, label: getCountryName(value) ?? value }
  }, [options, value])

  return (
    <div className='flex min-w-0 flex-col gap-y-1.5'>
      <Dropdown
        options={options}
        value={selected}
        onChange={(option) => {
          setQuery('')
          onChange(String(option.id))
        }}
        placeholder={placeholder}
        title='Country'
        arrow={arrow}
        searchable
        searchPlaceholder='Search country'
        searchValue={query}
        onSearchChange={setQuery}
        isLoading={isLoading}
        disabled={disabled}
        variant={error ? 'error' : 'default'}
        emptyMessage='No countries found'
      />
      <FieldError message={error} />
    </div>
  )
}

interface StateFieldProps {
  country: string
  value: string
  onChange: (state: string) => void
  disabled?: boolean
  error?: string
  placeholder?: string
  arrow?: DropdownArrow
}

export const StateField = ({
  country,
  value,
  onChange,
  disabled,
  error,
  placeholder = 'State/Province',
  arrow = 'chevron',
}: StateFieldProps) => {
  const { countries } = useCountryOptions()
  const [query, setQuery] = useState('')

  const countryName = country
    ? countries.find((c) => c.code === country)?.name ?? getCountryName(country)
    : undefined
  const { states, isLoading, isError, refetch } = useStateOptions(countryName)

  const options = useMemo<DropdownOption[]>(() => states.map((name) => ({ id: name, label: name })), [states])
  const selected = useMemo<DropdownOption | undefined>(
    () => (value ? { id: value, label: value } : undefined),
    [value],
  )

  return (
    <div className='flex min-w-0 flex-1 flex-col gap-y-1.5'>
      <Dropdown
        options={options}
        value={selected}
        onChange={(option) => {
          setQuery('')
          onChange(String(option.id))
        }}
        placeholder={placeholder}
        title='State/Province'
        arrow={arrow}
        searchable
        searchPlaceholder='Search state'
        searchValue={query}
        onSearchChange={setQuery}
        isLoading={isLoading}
        disabled={disabled || !country}
        variant={error ? 'error' : 'default'}
        emptyMessage={
          !country
            ? 'Select a country first'
            : isError
              ? 'Could not load states'
              : 'No states found for this country'
        }
      />
      {isError && !disabled && (
        <button
          type='button'
          onClick={() => refetch()}
          className='self-start pl-4 text-xs font-semibold text-primary-500 underline underline-offset-2 hover:text-primary-600'
        >
          Could not load states. Retry
        </button>
      )}
      <FieldError message={error} />
    </div>
  )
}