'use client'
import { Dropdown, DropdownOption } from '@/components/ui/dropdown';
import { artworkService } from '@/services';
import { Artwork } from '@/types';
import React, { useEffect, useState } from 'react'
import ArtGrid from './art-grid';
import { useAuthStore } from '@/store';
import ArtworkViewOverlay from '@/features/artwork/components/shop/artwork-view-overlay'

const searchOptions: DropdownOption[] = [
    { 
        id: 'for-you', 
        label: 'For You', 
    },
    { 
        id: 'everyone', 
        label: 'Everyone', 
    },
]

const TopArt = () => {
    const { user } = useAuthStore()
    const [selected, setSelected] = useState<DropdownOption | undefined>();
    const [artworks, setArtworks] = useState<Artwork[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const [activeIndex, setActiveIndex] = useState<number | null>(null)

    useEffect(() => {
        const fetchMarketplaceArtworks = async () => {
            try {
                setIsLoading(true)
                setError(null)

                const response = await artworkService.list({
                    listing_type: 'MARKETPLACE',
                    status: 'PUBLISHED',
                    visibility: 'PUBLIC',
                    limit: 12
                })

                if (response.success) {
                    setArtworks(response.data)
                } else {
                    setError('Failed to load top picks.')
                }
            } catch (err: any) {
                setError('An unexpected error occurred while fetching artworks.')
            } finally {
                setIsLoading(false)
            }
        }

        fetchMarketplaceArtworks()
    }, [])

    const activeArtwork = activeIndex !== null ? artworks[activeIndex] ?? null : null

    const handleNavigate = (direction: 'prev' | 'next') => {
        if (activeIndex === null) return
        const nextIndex = direction === 'next'
            ? Math.min(activeIndex + 1, artworks.length - 1)
            : Math.max(activeIndex - 1, 0)
        if (nextIndex !== activeIndex) setActiveIndex(nextIndex)
    }

    return (
        <div className='bg-white py-12 px-8 gap-y-6 flex flex-col'>
            <div className='flex justify-between items-center w-full'>
                <h2 className='font-raleway font-semibold text-primary-500 text-h4 leading-10 tracking-wide'>Top Art</h2>
                <Dropdown
                    options={searchOptions}
                    value={selected}
                    onChange={(option) => setSelected(option)}
                    placeholder="For You"
                    className='w-67'
                />
            </div>

            <ArtGrid 
                artworks={artworks}
                artVariant='shop'
                num={0}
                onCardClick={(_, index) => setActiveIndex(index)}
            />

            {activeArtwork && (
                <ArtworkViewOverlay
                    artwork={activeArtwork}
                    onClose={() => setActiveIndex(null)}
                    onNavigate={handleNavigate}
                />
            )}
        </div>
    )
}

export default TopArt
