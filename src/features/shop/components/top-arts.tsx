'use client'
import { Dropdown, DropdownOption } from '@/components/ui/dropdown';
import { artworkService } from '@/services';
import { Artwork } from '@/types';
import React, { useEffect, useState } from 'react'
import ArtGrid from './art-grid';
import { useAuthStore } from '@/store';
import { useOpenArtwork } from '@/hooks/use-artwork-viewer'
import { Button } from '@/components';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Matches the Figma dropdown exactly: "For You" is the default/current value,
// the rest are the selectable list. The first 5 are feed *modes* (mutually
// exclusive ranking/selection algorithms); the last 2 are a format filter,
// applied on top of whichever mode is active. Kept as one flat single-select
// list to match the design — see FEED_MODE_BY_OPTION / FORMAT_BY_OPTION below
// for how each id actually gets fetched.
const searchOptions: DropdownOption[] = [
    { id: 'for-you', label: 'For You' },
    { id: 'trending', label: 'Trending' },
    { id: 'new-arrivals', label: 'New Arrivals' },
    { id: 'most-popular', label: 'Most Popular' },
    { id: 'newbies', label: 'Newbies' },
    { id: 'digital-only', label: 'Digital Only' },
    { id: 'physical-only', label: 'Physical Only' },
]

// The backend's getFeed() already implements for_you/trending/new/newbies as
// real distinct queries (see artwork.service.ts) — "Trending" here maps to
// the genuine recency-decayed hot-right-now ranking (getTrendingArtworks),
// not getFeed's mode:'trending' (which is really just an all-time
// like_count sort — that's what "Most Popular" below uses instead).
// ASSUMPTION flagged for Shallom: this Trending-vs-Most-Popular split is my
// read of the two distinct ranking implementations already in the codebase,
// not something stated — flag if "Trending" should mean something else.
const FEED_MODE_BY_OPTION: Record<string, 'for_you' | 'trending' | 'new' | 'newbies' | null> = {
    'for-you': 'for_you',
    'trending': null, // handled via useTrendingArtworks-equivalent call below, not getFeed
    'new-arrivals': 'new',
    'most-popular': 'trending', // getFeed's mode:'trending' = sort by all-time like_count
    'newbies': 'newbies',
    'digital-only': null,
    'physical-only': null,
}

const FORMAT_BY_OPTION: Record<string, 'DIGITAL' | 'PHYSICAL' | undefined> = {
    'digital-only': 'DIGITAL',
    'physical-only': 'PHYSICAL',
}

// The shop page's filter bar, narrowed to what the feed endpoint understands.
export type TopArtFilters = {
    categories?: string[]
    minPrice?: number
    maxPrice?: number
    color?: string
    format?: 'DIGITAL' | 'PHYSICAL'
    country?: string
    state?: string
    city?: string
}

interface TopArtProps {
    filters?: TopArtFilters
    onClearFilters?: () => void;
}

const hasActiveFilters = (f?: TopArtFilters) =>
    Boolean(
        f &&
            (f.categories?.length ||
                f.minPrice !== undefined ||
                f.maxPrice !== undefined ||
                f.color ||
                f.format ||
                f.country ||
                f.state ||
                f.city),
    )

const TopArt = ({ filters, onClearFilters }: TopArtProps) => {
    const { user } = useAuthStore()
    const [selected, setSelected] = useState<DropdownOption>(searchOptions[0]!)
    const [artworks, setArtworks] = useState<Artwork[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const openArtwork = useOpenArtwork()
    const router = useRouter()

    // console.log('Top Art Artworks: ', artworks, isLoading, error)

    // Stable dependency: re-fetch when the filter *values* change, not on every new object identity.
    const filtersKey = JSON.stringify(filters ?? {})
    const filtersActive = hasActiveFilters(filters)

    useEffect(() => {
        // Ignore a response that arrives after the filters/option changed again.
        let cancelled = false

        const fetchMarketplaceArtworks = async () => {
            try {
                setIsLoading(true)
                setError(null)

                const optionId = String(selected.id)
                // The dropdown's Digital/Physical Only is an explicit choice, so it wins over the page's Medium filter.
                const format = FORMAT_BY_OPTION[optionId] ?? filters?.format

                // The activity-based trending endpoint can't be filtered, so with filters
                // on we use the feed's trending sort instead (it applies every filter).
                if (optionId === 'trending' && !filtersActive) {
                    const trendingResponse = await artworkService.getTrending(12, 7, 'MARKETPLACE')
                    if (!cancelled) setArtworks(trendingResponse.data)
                    return
                }

                const mode = FEED_MODE_BY_OPTION[optionId] ?? (optionId === 'trending' ? 'trending' : 'new')
                const response = await artworkService.getFeed({
                    sort: mode,
                    perPage: 12,
                    listingType: 'MARKETPLACE',
                    format,
                    categories: filters?.categories,
                    minPrice: filters?.minPrice,
                    maxPrice: filters?.maxPrice,
                    color: filters?.color,
                    country: filters?.country,
                    state: filters?.state,
                    city: filters?.city,
                })

                if (cancelled) return
                if (response.success) {
                    setArtworks(response.data)
                } else {
                    setError('Failed to load top picks.')
                }
            } catch (err: any) {
                if (!cancelled) setError('An unexpected error occurred while fetching artworks.')
            } finally {
                if (!cancelled) setIsLoading(false)
            }
        }

        fetchMarketplaceArtworks()
        return () => {
            cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected, user?.id, filtersKey])

    const handleOpenArtwork = (index: number) => {
        const target = artworks[index]
        if (target) openArtwork(target, { siblings: artworks, variant: 'shop' })
    }

    return (
        <div className='bg-white py-12 md:gap-y-6 flex flex-col'>
            <div className='flex px-4 lg:px-8 justify-between items-center w-full'>
                <h2 className='font-raleway font-semibold text-primary-500 text-h6 md:text-h4 leading-10 tracking-wide'>Top Art</h2>
                <Dropdown
                    options={searchOptions}
                    value={selected}
                    onChange={(option) => setSelected(option)}
                    placeholder="For You"
                    className='w-33 md:w-67'
                />
            </div>

            {error && !isLoading && (
                <div className="text-center py-10 text-red-500 font-poppins">
                    {error}
                </div>
            )}

            {!isLoading && !error && artworks.length === 0 && (
                <div className="text-center py-10 text-gray-500 font-poppins min-h-[400px] flex flex-col gap-12 items-center justify-center">
                    <div className='w-[515px] h-100 max-lg:w-[343px] max-lg:h-[267px] relative'>
                        <Image src='/images/empty_search.png' fill className='object-contain' alt='empty search' />
                    </div>

                    <div className='flex flex-col gap-2 items-center justify-center'>
                        <p className='font-poppins font-medium text-heading text-h6 text-center'>Looks Like This Canvas is Empty</p>
                        <p className='font-poppins text-body text-body-m text-center mb-2'>
                            {filtersActive ? 'No artworks match your filters.' : 'No marketplace artworks available right now.'}
                        </p>

                        <Button 
                            onClick={() => {
                            if (filtersActive) {
                                onClearFilters?.()
                            } else {
                                router.push('/explore')
                            }
                            }}
                        >
                            {filtersActive ? 'Clear Filters' : 'Explore'}
                        </Button>
                    </div>
                </div>
            )}

            {!isLoading && artworks.length > 0 && !error && (
                <ArtGrid
                    artworks={artworks}
                    // artVariant='shop'
                    num={0}
                    onCardClick={(_, index) => handleOpenArtwork(index)}
                />
            )}
        </div>
    )
}

export default TopArt