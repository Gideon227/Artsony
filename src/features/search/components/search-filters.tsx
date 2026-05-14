'use client'

import React from 'react'
import { Filter, ChevronDown, LayoutGrid, Tag, Palette, Brush, MapPin } from 'lucide-react'

interface SearchFiltersProps {
  totalResults: string;
}

export const SearchFilters = ({ totalResults }: SearchFiltersProps) => {
  const filterOptions = [
    { label: 'Categories', icon: LayoutGrid },
    { label: 'Price', icon: Tag },
    { label: 'Color', icon: Palette },
    { label: 'Medium', icon: Brush },
    { label: 'Location', icon: MapPin },
  ]

  return (
    <div className="w-full border-b border-neutral-200 bg-white sticky top-0 z-20">
      <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Results Count */}
        <div className="text-neutral-800 font-medium text-lg md:text-xl font-raleway">
          <span className="text-[#F15A2B] font-bold">{totalResults}</span> Search Results
        </div>

        {/* Mobile Filter Button */}
        <button className="flex lg:hidden items-center gap-2 px-4 py-2 rounded-full border border-neutral-300 text-sm font-medium">
          Filter <Filter className="w-4 h-4" />
        </button>

        {/* Desktop Filters */}
        <div className="hidden lg:flex items-center gap-4">
          {filterOptions.map((filter) => (
            <button 
              key={filter.label}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-neutral-200 text-sm text-neutral-600 hover:border-neutral-400 transition-colors"
            >
              <filter.icon className="w-4 h-4 text-neutral-400" />
              {filter.label}
              <ChevronDown className="w-4 h-4 ml-2" />
            </button>
          ))}
          <button className="px-6 py-2.5 rounded-full border border-[#F15A2B] text-[#F15A2B] text-sm font-medium hover:bg-[#F15A2B]/5 transition-colors ml-2">
            Clear Filter
          </button>
        </div>

      </div>
    </div>
  )
}