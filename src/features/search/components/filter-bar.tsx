'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { X, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/utils'
import { INTERESTS } from '@/features/onboarding/data/interests'

// ─── Types ────────────────────────────────────────────────────────────────────

export type FilterOption = {
  id: string
  label: string
  icon?: string
}

export type FilterValues = {
  category: string | null
  price: string | null
  color: string | null
  size: string | null
  location: string | null
}

type FilterBarProps = {
  values: FilterValues
  onChange: (key: keyof FilterValues, value: string | null) => void
  onClear: () => void
}

// ─── Static option lists ──────────────────────────────────────────────────────

const CATEGORY_OPTIONS: FilterOption[] = INTERESTS.map((i) => ({
  id: i.id,
  label: i.label,
  icon: i.image,
}))

const PRICE_OPTIONS: FilterOption[] = [
  { id: '0-500',    label: 'Under $500' },
  { id: '500-1000', label: '$500 – $1,000' },
  { id: '1000-5000',label: '$1,000 – $5,000' },
  { id: '5000+',    label: 'Over $5,000' },
]

const COLOR_OPTIONS: FilterOption[] = [
  { id: 'red',        label: 'Red' },
  { id: 'blue',       label: 'Blue' },
  { id: 'green',      label: 'Green' },
  { id: 'yellow',     label: 'Yellow' },
  { id: 'monochrome', label: 'Black & White' },
  { id: 'multicolor', label: 'Multicolor' },
]

const SIZE_OPTIONS: FilterOption[] = [
  { id: 'small',  label: 'Small (< 40 cm)' },
  { id: 'medium', label: 'Medium (40–100 cm)' },
  { id: 'large',  label: 'Large (> 100 cm)' },
]

type DropdownDef = {
  key: keyof FilterValues
  placeholder: string
  icon: string
  options: FilterOption[]
}

const DROPDOWNS: DropdownDef[] = [
  { key: 'category', placeholder: 'Category',  icon: '/icons/widget.svg',       options: CATEGORY_OPTIONS },
  { key: 'price',    placeholder: 'Price',      icon: '/icons/dollar-circle.svg',options: PRICE_OPTIONS   },
  { key: 'color',    placeholder: 'Color',      icon: '/icons/palette.svg',      options: COLOR_OPTIONS   },
  { key: 'size',     placeholder: 'Size',       icon: '/icons/maximize.svg',     options: SIZE_OPTIONS    },
]

// ─── FilterBar ────────────────────────────────────────────────────────────────

export function FilterBar({ values, onChange, onClear }: FilterBarProps) {
  const [countries, setCountries] = useState<FilterOption[]>([])
  const [loadingCountries, setLoadingCountries] = useState(true)

  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all?fields=name,flags')
      .then((r) => r.json())
      .then((data: Array<{ name: { common: string }; flags: { svg: string } }>) => {
        const sorted = data
          .map((c) => ({ id: c.name.common, label: c.name.common, icon: c.flags.svg }))
          .sort((a, b) => a.label.localeCompare(b.label))
        setCountries(sorted)
      })
      .catch(console.error)
      .finally(() => setLoadingCountries(false))
  }, [])

  const hasActiveFilters = Object.values(values).some(Boolean)

  const allDropdowns: DropdownDef[] = [
    ...DROPDOWNS,
    {
      key: 'location',
      placeholder: loadingCountries ? 'Loading…' : 'Location',
      icon: '/icons/map-point.svg',
      options: countries,
    },
  ]

  return (
    <div className="w-full border-b border-neutral-100 bg-white sticky top-[72px] z-40">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-3 flex items-center gap-3 overflow-x-auto scrollbar-none">
        {allDropdowns.map((def) => (
          <FilterDropdown
            key={def.key}
            def={def}
            value={values[def.key]}
            onChange={(val) => onChange(def.key, val)}
          />
        ))}

        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="shrink-0 flex items-center gap-1.5 h-10 px-3 rounded-full border border-neutral-200 text-neutral-500 hover:border-primary-300 hover:text-primary-500 font-poppins text-[13px] transition-colors whitespace-nowrap"
          >
            <X className="w-3.5 h-3.5" />
            Clear all
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Single filter dropdown pill ──────────────────────────────────────────────

function FilterDropdown({
  def,
  value,
  onChange,
}: {
  def: DropdownDef
  value: string | null
  onChange: (val: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const activeLabel = def.options.find((o) => o.id === value)?.label

  const filtered = search
    ? def.options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : def.options

  return (
    <div ref={ref} className="relative shrink-0">
      {/* Trigger pill */}
      <button
        onClick={() => { setOpen((p) => !p); setSearch('') }}
        className={cn(
          'flex items-center gap-2 h-10 px-4 rounded-full border font-poppins text-[13px] font-medium transition-all whitespace-nowrap',
          value
            ? 'border-primary-500 bg-primary-50 text-primary-600'
            : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300'
        )}
      >
        {/* Left icon */}
        <Image src={def.icon} alt="" width={16} height={16} className="shrink-0 opacity-60" />
        <span>{activeLabel ?? def.placeholder}</span>
        {value
          ? <X className="w-3.5 h-3.5 ml-0.5 text-primary-400 hover:text-primary-600" onClick={(e) => { e.stopPropagation(); onChange(null) }} />
          : <ChevronDown className={cn('w-3.5 h-3.5 ml-0.5 transition-transform', open && 'rotate-180')} />
        }
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute top-[calc(100%+6px)] left-0 w-56 bg-white border border-neutral-100 rounded-2xl shadow-lg z-50 overflow-hidden">
          {/* Search inside dropdown when > 8 options */}
          {def.options.length > 8 && (
            <div className="px-3 pt-3 pb-2">
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full h-8 px-3 rounded-full border border-neutral-200 font-poppins text-[13px] outline-none focus:border-primary-400"
              />
            </div>
          )}

          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 && (
              <li className="px-4 py-3 font-poppins text-[13px] text-neutral-400">No results</li>
            )}
            {filtered.map((opt) => (
              <li key={opt.id}>
                <button
                  onClick={() => { onChange(opt.id === value ? null : opt.id); setOpen(false) }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 font-poppins text-[13px] text-left transition-colors',
                    opt.id === value
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-neutral-600 hover:bg-neutral-50'
                  )}
                >
                  {opt.icon && (
                    <Image
                      src={opt.icon}
                      alt={opt.label}
                      width={20}
                      height={20}
                      className="w-5 h-5 rounded-sm object-cover shrink-0"
                    />
                  )}
                  <span className="flex-1 truncate">{opt.label}</span>
                  {opt.id === value && <Check className="w-3.5 h-3.5 text-primary-500 shrink-0" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}