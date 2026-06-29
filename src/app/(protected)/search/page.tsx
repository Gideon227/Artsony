'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronsRight, ArrowLeft } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import { SearchInput } from '@/components/ui/search-input'
import { FilterBar, type FilterValues } from '@/features/search/components/filter-bar'
import { ResultsGrid } from '@/features/search/components/results-grid'
import { useSearchArtworks } from '@/hooks/use-artwork'
import type { Artwork } from '@/types'
import FilterComponent, { FilterDropdownConfig } from '@/features/home/components/filter'
import { DropdownOption } from '@/components/ui/dropdown'
import { INTERESTS } from '@/features/onboarding/data/interests'

// ─── SearchPage ───────────────────────────────────────────────────────────────

const SearchPage = () => {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Read initial query from URL — ?q=landscape+photography
  const urlQuery = searchParams.get('q') ?? ''

  // Local query state so the search bar stays in sync when the user retypes
  const [localQuery, setLocalQuery] = useState(urlQuery)

  // Sync local input if URL param changes (e.g. browser back/forward)
  useEffect(() => {
    setLocalQuery(urlQuery)
  }, [urlQuery])

  // ── Filters ─────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState<FilterValues>({
    category: null,
    price:    null,
    color:    null,
    size:     null,
    location: null,
  })

  const handleFilterChange = useCallback(
    (key: keyof FilterValues, value: string | null) => {
      setFilters((prev) => ({ ...prev, [key]: value }))
    },
    []
  )

//   const handleClearFilters = useCallback(() => {
//     setFilters({ category: null, price: null, color: null, size: null, location: null })
//   }, [])

  // --- State Management ---
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [selectedPrice, setSelectedPrice] = useState<any>(null);
    const [selectedColor, setSelectedColor] = useState<any>(null);
    const [selectedSize, setSelectedSize] = useState<any>(null);
    const [selectedLocation, setSelectedLocation] = useState<any>(null);
    
    // State for dynamic countries
    const [countries, setCountries] = useState<DropdownOption[]>([]);

    // --- Fetch Countries on Mount ---
    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags');
                const data = await response.json();
                
                const countryOptions: DropdownOption[] = data
                    .map((country: any) => ({
                        id: country.name.common,
                        label: country.name.common,
                        icon: country.flags.svg, // Using the SVG flag as the icon
                    }))
                    .sort((a: any, b: any) => a.label.localeCompare(b.label));

                setCountries(countryOptions);
            } catch (error) {
                console.error("Error fetching countries:", error);
            }
        };

        fetchCountries();
    }, []);

    // --- 2. Define Options ---

    const categoriesOption: DropdownOption[] = INTERESTS.map((item) => ({
        id: item.id,
        icon: item.image,
        label: item.label
    }));

    const priceOptions: DropdownOption[] = [
        { id: '0-500', label: 'Under $500' },
        { id: '500-1000', label: '$500 - $1,000' },
        { id: '1000-5000', label: '$1,000 - $5,000' },
        { id: '5000+', label: 'Over $5,000' },
    ];

    const colorOptions: DropdownOption[] = [
        { id: 'red', label: 'Red', icon: '/icons/colors/red.svg' },
        { id: 'blue', label: 'Blue', icon: '/icons/colors/blue.svg' },
        { id: 'green', label: 'Green', icon: '/icons/colors/green.svg' },
        { id: 'monochrome', label: 'Black & White' },
    ];

    const sizeOptions: DropdownOption[] = [
        { id: 'small', label: 'Small (Under 40cm)' },
        { id: 'medium', label: 'Medium (40-100cm)' },
        { id: 'large', label: 'Large (Over 100cm)' },
    ];

    // --- 3. Build Dropdown Configuration ---
    // useMemo ensures this array only recreates when a value or the countries list changes
    const filterDropdowns: FilterDropdownConfig[] = useMemo(() => [
        {
            id: 'category',
            options: categoriesOption,
            value: selectedCategory,
            onChange: setSelectedCategory,
            placeholder: 'Categories',
            leftIcon: '/icons/widget.svg'
        },
        {
            id: 'price',
            options: priceOptions,
            value: selectedPrice,
            onChange: setSelectedPrice,
            placeholder: 'Price',
            leftIcon: '/icons/dollar-circle.svg'
        },
        {
            id: 'color',
            options: colorOptions,
            value: selectedColor,
            onChange: setSelectedColor,
            placeholder: 'Color',
            leftIcon: '/icons/palette.svg'
        },
        {
            id: 'size',
            options: sizeOptions,
            value: selectedSize,
            onChange: setSelectedSize,
            placeholder: 'Size',
            leftIcon: '/icons/maximize.svg'
        },
        {
            id: 'location',
            options: countries, // Dynamic list from API
            value: selectedLocation,
            onChange: setSelectedLocation,
            placeholder: countries.length > 0 ? 'Location' : 'Loading...',
            leftIcon: '/icons/map-point.svg'
        },
    ], [selectedCategory, selectedPrice, selectedColor, selectedSize, selectedLocation, countries]);

    const handleClearFilters = () => {
        setSelectedCategory(null);
        setSelectedPrice(null);
        setSelectedColor(null);
        setSelectedSize(null);
        setSelectedLocation(null);
    };

  // ── Search query: push URL and reset filters on new search ───────────────
  const handleSearch = (q: string) => {
    const trimmed = q.trim()
    if (!trimmed) return
    // Reset filters on a fresh search so results aren't stale-filtered
    handleClearFilters()
    router.push(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  // ── Data fetching ─────────────────────────────────────────────────────────
  const searchFilters = useMemo(() => ({
    q: urlQuery,
    category: filters.category ?? undefined,
    price: filters.price ?? undefined,
    color: filters.color ?? undefined,
    size: filters.size ?? undefined,
    location: filters.location ?? undefined,
  }), [urlQuery, filters])

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useSearchArtworks(searchFilters)

  const artworks: Artwork[] = useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data]
  )

  const total = data?.pages[0]?.total

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar without its own search bar — we have a big one in the hero */}
      <Navbar hideSearchBar />

      {/* ── Hero / Search Banner ─────────────────────────────────────────── */}
      <section
        className="relative w-full bg-cover bg-center"
        style={{
          backgroundImage: 'url(/images/search-bg.jpg)',
          minHeight: 'clamp(320px, 45vw, 424px)',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/35" />

        {/* Artist attribution bottom-left */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="absolute bottom-6 left-6 md:left-8 flex items-center gap-2 group cursor-pointer"
        >
          <Image
            src="/images/image-avatar.svg"
            alt="Artist"
            width={40}
            height={40}
            className="w-9 h-9 rounded-full border border-white/30 object-cover shrink-0"
          />
          <span className="font-poppins text-[12px] text-white/80 font-medium whitespace-nowrap">
            Ivan Kovačević
          </span>
          <ChevronsRight className="text-white/60 w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </motion.div>

        {/* Centred search + result count */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-5 h-full px-4 py-16 md:py-20">
          <div className="w-full max-w-xl">
            <SearchInput
              value={localQuery}
              onChange={setLocalQuery}
              onSearch={handleSearch}
              placeholder="Landscape Photography"
              leftIconPath="/home/magnifier.svg"
              className="h-14 shadow-lg border-0"
            />
          </div>

          {urlQuery && (
            <motion.h2
              key={urlQuery}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="font-raleway font-semibold text-white text-[20px] md:text-[24px] leading-8 text-center tracking-wide"
            >
              {total !== undefined && (
                <span className="font-bold">
                  {total >= 1000 ? `${(total / 1000).toFixed(0)}k+` : `+${total}`}{' '}
                </span>
              )}
              <span className="font-normal">Results for </span>
              {urlQuery}
            </motion.h2>
          )}
        </div>
      </section>

      {/* ── Sticky Filter Bar ─────────────────────────────────────────────── */}
      {/* <FilterBar
        values={filters}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      /> */}

      <FilterComponent
            dropdowns={filterDropdowns} 
            onClear={handleClearFilters} 
        />

      {/* ── Results ────────────────────────────────────────────────────────── */}
      <main className="flex-1">
        <ResultsGrid
          artworks={artworks}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage ?? false}
          fetchNextPage={fetchNextPage}
          query={urlQuery}
          total={total}
        />
      </main>

      <Footer />
    </div>
  )
}

export default SearchPage