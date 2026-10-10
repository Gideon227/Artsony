'use client'

import { useState, useMemo, useCallback, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronsRight } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import { SearchInput } from '@/components/ui/search-input'
import { ResultsGrid } from '@/features/search/components/results-grid'
import { useArtworkLocations, useHeroArtworks, useInfiniteArtworkResults } from '@/hooks/use-artwork'
import type { Artwork, ArtworkFilters } from '@/types'
import { useOpenArtwork } from '@/hooks/use-artwork-viewer'
import FilterComponent, { FilterDropdownConfig } from '@/features/home/components/filter'
import { DropdownOption } from '@/components/ui/dropdown'
import { INTERESTS } from '@/features/onboarding/data/interests'
import { buildSlides } from '@/features/home/components/hero'
import { MobileFilterDrawer } from '@/features/home/components/mobile-filter-drawer'

// Price dropdown options translation
function parsePriceRange(id: string): Pick<ArtworkFilters, 'min_price' | 'max_price'> {
  if (id === '5000+') return { min_price: 5000 }
  const [min, max] = id.split('-').map(Number)
  return { min_price: min, max_price: max }
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const urlQuery = searchParams.get('q') ?? ''
  const [localQuery, setLocalQuery] = useState(urlQuery)
  const [index, setIndex] = useState(0)
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  

  //Search States
  const openArtwork = useOpenArtwork()
  const query = searchParams.get('q') ?? ''
  const isSearchMode = query.trim().length > 0
  const [draftQuery, setDraftQuery] = useState(query)

  useEffect(() => {
    setLocalQuery(urlQuery)
  }, [urlQuery])

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<DropdownOption | null>(null)
  const [selectedPrice, setSelectedPrice] = useState<DropdownOption | null>(null)
  const [selectedColor, setSelectedColor] = useState<DropdownOption | null>(null)
  const [selectedSize, setSelectedSize] = useState<DropdownOption | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<DropdownOption | null>(null)
  const [countryQuery, setCountryQuery] = useState('')

  const { data: countries, isLoading: isLoadingCountries } = useArtworkLocations('country')
  const { data: featured, isError } = useHeroArtworks(5)

  useEffect(() => {
    if (isError) {
      console.error('[HeroSection] Failed to load featured artworks — showing placeholders')
    }
  }, [isError])

  const slides = useMemo(() => buildSlides(featured), [featured])

  useEffect(() => {
    setIndex(0)
  }, [slides])

  const currentSlide = slides[index]

  useEffect(() => {
    if (slides.length <= 1) return

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length)
    }, 6000)

    return () => clearInterval(timer)
  }, [slides.length])

  function toSearchableOptions(
    raw: { label: string; artwork_count: number }[] | undefined,
    q: string,
  ): DropdownOption[] {
    const list = (raw ?? []).map((l) => ({ id: l.label, label: l.label }))
    if (!q.trim()) return list
    const lower = q.trim().toLowerCase()
    return list.filter((c) => c.label.toLowerCase().includes(lower))
  }

  const countryOptions = useMemo(() => toSearchableOptions(countries, countryQuery), [countries, countryQuery])

  const categoriesOption: DropdownOption[] = useMemo(
    () => INTERESTS.map((item) => ({ id: item.id, icon: item.image, label: item.label })),
    []
  )

  const priceOptions: DropdownOption[] = [
    { id: '0-500', label: 'Under $500' },
    { id: '500-1000', label: '$500 - $1,000' },
    { id: '1000-5000', label: '$1,000 - $5,000' },
    { id: '5000+', label: 'Over $5,000' },
  ]

  const colorOptions: DropdownOption[] = [
    { id: 'red', label: 'Red', icon: '/icons/colors/red.svg' },
    { id: 'blue', label: 'Blue', icon: '/icons/colors/blue.svg' },
    { id: 'green', label: 'Green', icon: '/icons/colors/green.svg' },
    { id: 'monochrome', label: 'Black & White' },
  ]

  const sizeOptions: DropdownOption[] = [
    { id: 'small', label: 'Small (Under 40cm)' },
    { id: 'medium', label: 'Medium (40-100cm)' },
    { id: 'large', label: 'Large (Over 100cm)' },
  ]

  const handleClearFilters = useCallback(() => {
    setSelectedCategory(null)
    setSelectedPrice(null)
    setSelectedColor(null)
    setSelectedSize(null)
    setSelectedCountry(null)
    setCountryQuery('')
  }, [])

  const filterDropdowns: FilterDropdownConfig[] = useMemo(
    () => [
      {
        id: 'category',
        options: categoriesOption,
        value: selectedCategory,
        onChange: setSelectedCategory,
        placeholder: 'Categories',
        leftIcon: '/icons/widget.svg',
      },
      {
        id: 'price',
        options: priceOptions,
        value: selectedPrice,
        onChange: setSelectedPrice,
        placeholder: 'Price',
        leftIcon: '/icons/dollar-circle.svg',
      },
      {
        id: 'color',
        options: colorOptions,
        value: selectedColor,
        onChange: setSelectedColor,
        placeholder: 'Color',
        leftIcon: '/icons/palette.svg',
      },
      {
        id: 'size',
        options: sizeOptions,
        value: selectedSize,
        onChange: setSelectedSize,
        placeholder: 'Size',
        leftIcon: '/icons/maximize.svg',
      },
      {
        id: 'location',
        options: countryOptions,
        value: selectedCountry,
        onChange: (opt: DropdownOption | null) => {
          setSelectedCountry(opt)
        },
        searchable: true,
        searchPlaceholder: 'Search country',
        searchValue: countryQuery,
        onSearchChange: setCountryQuery,
        isLoading: isLoadingCountries,
        emptyMessage: 'No matching countries',
        placeholder: 'Location',
        leftIcon: '/icons/map-point.svg',
      }
    ],
    [
      categoriesOption,
      selectedCategory,
      selectedPrice,
      selectedColor,
      selectedSize,
      selectedCountry,
      countryOptions,
      countryQuery,
      isLoadingCountries,
    ]
  )

  const handleSearch = (q: string) => {
    const trimmed = q.trim()
    if (!trimmed) return
    handleClearFilters()
    router.push(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  const searchFilters: ArtworkFilters = useMemo(
    () => ({
      search: urlQuery || undefined,
      categories: selectedCategory ? [String(selectedCategory.id)] : undefined,
      size_label: selectedSize ? String(selectedSize.id) : undefined,
      country: selectedCountry ? String(selectedCountry.id) : undefined,
      ...(selectedPrice ? parsePriceRange(String(selectedPrice.id)) : {}),
    }),
    [urlQuery, selectedCategory, selectedPrice, selectedSize, selectedCountry]
  )

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteArtworkResults(searchFilters)

  const artworks: Artwork[] = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data])
  const total = data?.pages[0]?.total

  const handleArtworkClick = (artwork: Artwork) =>
    openArtwork(artwork, { siblings: artworks, variant: 'home' })

  if (!currentSlide) return <div className="h-screen w-full bg-black" />

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar hideSearchBar />

      <section className="relative h-[80vh] md:h-[calc(95vh-72px)] w-full overflow-hidden bg-black">
        <AnimatePresence>
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 5, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <motion.div
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 8, ease: 'linear' }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${currentSlide.image}')` }}
            >
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            </motion.div>

            {/* Artist Info */}
            <div className="absolute bottom-8 left-8 max-w-2xl z-10" style={{ bottom: 32, left: 32 }}>
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.5, duration: 1.5, ease: 'easeOut' }}
                className="flex items-center gap-2 mb-4 group cursor-pointer w-fit"
              >
                <Image
                  src={currentSlide.artistAvatar}
                  alt={currentSlide.artistName}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full border border-white/30 object-cover"
                />
                <div className="flex items-center gap-2">
                  <span className="text-white text-[12px] font-poppins font-medium tracking-tight">
                    {currentSlide.artistName}
                  </span>
                  <ChevronsRight className="text-white/70 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </div>
              </motion.div>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 2, duration: 1.5, ease: 'easeOut' }}
                className="text-white/80 text-[12px] md:text-[14px] font-medium italic leading-relaxed max-w-lg"
              >
                “{currentSlide.bio}”
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="relative z-20 h-full flex flex-col justify-center px-4 md:px-8 pointer-events-none">
          <div className="w-full flex justify-center pointer-events-auto">
            <div className="relative flex flex-col items-center justify-center gap-5 w-full px-4 py-16 md:py-20">
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
          </div>
        </div>
      </section>

      {/* Mobile header */}
      <div className="hidden max-lg:flex gap-4 items-center md:hidden my-6 mx-4">
        <SearchInput
          value={draftQuery}
          onChange={setDraftQuery}
          onSearch={handleSearch}
          placeholder="Find your next art obsession"
          leftIconPath='home/magnifier.svg'
          rightIconPath={draftQuery ? '/icons/cancel.svg' : undefined}
          onRightIconClick={() => {
            setDraftQuery('')
            handleSearch('')
          }}
        />

        <button onClick={() => setIsMobileFiltersOpen(true)} aria-label="Open filters">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <mask id="path-1-inside-1_7180_37631" fill="white">
            <path d="M0 20C0 8.95431 8.95431 0 20 0C31.0457 0 40 8.95431 40 20C40 31.0457 31.0457 40 20 40C8.95431 40 0 31.0457 0 20Z"/>
            </mask>
            <path d="M0 20M40 20M40 20M0 20M20 0M40 20M20 40M0 20M20 40V38C10.0589 38 2 29.9411 2 20H0H-2C-2 32.1503 7.84974 42 20 42V40ZM40 20H38C38 29.9411 29.9411 38 20 38V40V42C32.1503 42 42 32.1503 42 20H40ZM20 0V2C29.9411 2 38 10.0589 38 20H40H42C42 7.84974 32.1503 -2 20 -2V0ZM20 0V-2C7.84974 -2 -2 7.84974 -2 20H0H2C2 10.0589 10.0589 2 20 2V0Z" fill="#E6E8EB" mask="url(#path-1-inside-1_7180_37631)"/>
            <path d="M26 16C26 19.3137 23.3137 22 20 22C16.6863 22 14 19.3137 14 16C14 12.6863 16.6863 10 20 10C23.3137 10 26 12.6863 26 16Z" fill="#525965"/>
            <path d="M13.0335 18.7834C11.2216 19.816 10 21.7653 10 24C10 27.3137 12.6863 30 16 30C19.3137 30 22 27.3137 22 24C22 23.7437 21.9839 23.4911 21.9527 23.2432C21.3301 23.4107 20.6755 23.5 20 23.5C16.8414 23.5 14.1388 21.5474 13.0335 18.7834Z" fill="#525965"/>
            <path d="M23.3866 22.6937C23.4611 23.1179 23.5 23.5544 23.5 24C23.5 26.0907 22.6446 27.9815 21.2646 29.3417C22.0849 29.7625 23.0147 30 24 30C27.3137 30 30 27.3137 30 24C30 21.7654 28.7783 19.8161 26.9665 18.7835C26.2876 20.4811 25.0062 21.8727 23.3866 22.6937Z" fill="#525965"/>
          </svg>
        </button>
      </div>

      <FilterComponent dropdowns={filterDropdowns} onClear={handleClearFilters} hideClearButton={true} />
      
      <main className="flex-1">
        <ResultsGrid
          artworks={artworks}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage ?? false}
          fetchNextPage={fetchNextPage}
          query={urlQuery}
          total={total}
          onArtworkClick={handleArtworkClick}
        />
      </main>


      <Footer />

      <MobileFilterDrawer
        open={isMobileFiltersOpen}
        onClose={() => setIsMobileFiltersOpen(false)}
        dropdowns={filterDropdowns}
        onClear={handleClearFilters}
        filterNum={artworks.length}
      />
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <SearchContent />
    </Suspense>
  )
}