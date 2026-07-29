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
import ArtworkViewOverlay from '@/features/artwork/components/home/artwork-view-overlay'
import FilterComponent, { FilterDropdownConfig } from '@/features/home/components/filter'
import { DropdownOption } from '@/components/ui/dropdown'
import { INTERESTS } from '@/features/onboarding/data/interests'
import { buildSlides } from '@/features/home/components/hero'

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
  const [activeArtwork, setActiveArtwork] = useState<Artwork | null>(null)

  useEffect(() => {
    setLocalQuery(urlQuery)
  }, [urlQuery])

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<DropdownOption | null>(null)
  const [selectedPrice, setSelectedPrice] = useState<DropdownOption | null>(null)
  const [selectedColor, setSelectedColor] = useState<DropdownOption | null>(null)
  const [selectedSize, setSelectedSize] = useState<DropdownOption | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<DropdownOption | null>(null)
  const [locationQuery, setLocationQuery] = useState('')

  const { data: locations, isLoading: isLoadingLocations } = useArtworkLocations()
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

  const locationOptions: DropdownOption[] = useMemo(() => {
    const list = (locations ?? []).map((l) => ({ id: l.label, label: l.label }))
    if (!locationQuery.trim()) return list
    const q = locationQuery.trim().toLowerCase()
    return list.filter((c) => c.label.toLowerCase().includes(q))
  }, [locations, locationQuery])

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
    setSelectedLocation(null)
    setLocationQuery('')
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
        options: locationOptions,
        value: selectedLocation,
        onChange: setSelectedLocation,
        searchable: true,
        searchPlaceholder: 'Search location',
        searchValue: locationQuery,
        onSearchChange: setLocationQuery,
        isLoading: isLoadingLocations,
        emptyMessage: 'No matching locations',
        placeholder: 'Location',
        leftIcon: '/icons/map-point.svg',
      },
    ],
    [
      categoriesOption,
      selectedCategory,
      selectedPrice,
      selectedColor,
      selectedSize,
      selectedLocation,
      locationOptions,
      locationQuery,
      isLoadingLocations,
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
      location: selectedLocation ? String(selectedLocation.id) : undefined,
      ...(selectedPrice ? parsePriceRange(String(selectedPrice.id)) : {}),
    }),
    [urlQuery, selectedCategory, selectedPrice, selectedSize, selectedLocation]
  )

  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteArtworkResults(searchFilters)

  const artworks: Artwork[] = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data])
  const total = data?.pages[0]?.total

  const activeArtworkIndex = activeArtwork ? artworks.findIndex((a) => a.id === activeArtwork.id) : -1

  const handleNavigateArtwork = (direction: 'prev' | 'next') => {
    if (activeArtworkIndex === -1) return
    const nextIndex =
      direction === 'next'
        ? Math.min(activeArtworkIndex + 1, artworks.length - 1)
        : Math.max(activeArtworkIndex - 1, 0)
    if (nextIndex === activeArtworkIndex) return
    setActiveArtwork(artworks[nextIndex] as Artwork)
  }

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
          <div className="max-w-5xl mx-auto w-full flex justify-center pointer-events-auto">
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

      <main className="flex-1">
        <ResultsGrid
          artworks={artworks}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage ?? false}
          fetchNextPage={fetchNextPage}
          query={urlQuery}
          total={total}
          onArtworkClick={setActiveArtwork}
        />
      </main>

      <FilterComponent dropdowns={filterDropdowns} onClear={handleClearFilters} />

      <Footer />

      {activeArtwork && (
        <ArtworkViewOverlay
          artwork={activeArtwork}
          onClose={() => setActiveArtwork(null)}
          onNavigate={handleNavigateArtwork}
        />
      )}
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