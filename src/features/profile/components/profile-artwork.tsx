'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components'
import { ArtCard } from '@/components/ui/art-card'
import { artworkService } from '@/services'
import { Artwork, ArtworkStatus } from '@/types/artwork'

interface ProfileArtworkProps {
    userId: string;
    tabType: 'artwork' | 'shop' | 'draft';
    isOwnProfile: boolean;
    onArtworkClick: (artwork: Artwork, list: Artwork[]) => void;
    onPostArtwork?: () => void;
}

const EMPTY_COPY: Record<ProfileArtworkProps['tabType'], { title: string; body: string }> = {
    artwork: { title: 'Nothing here… yet.', body: "You haven't shared any artworks yet. Create your first post to start engaging with the community." },
    shop: { title: 'Nothing for sale… yet.', body: "No artworks are currently listed in the shop." },
    draft: { title: 'No drafts.', body: "Artworks you save without publishing will show up here." },
}

const ProfileArtwork = ({ userId, tabType, isOwnProfile, onArtworkClick, onPostArtwork }: ProfileArtworkProps) => {
    const [artworks, setArtworks] = useState<Artwork[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [page, setPage] = useState<number>(1)
    const [hasMore, setHasMore] = useState<boolean>(false)

    // Re-fetch from page 1 whenever the userId or tabType changes
    useEffect(() => {
        if (userId) {
            setArtworks([]) // Clear existing artworks on tab switch
            setPage(1)
            fetchArtworks(1, tabType)
        }
    }, [userId, tabType])

    const fetchArtworks = async (currentPage: number, currentTab: string) => {
        try {
            setIsLoading(true)
            
            // Determine API filters based on the selected tab
            let statusFilter:ArtworkStatus = 'PUBLISHED'
            let listingTypeFilter = undefined

            if (currentTab === 'draft') {
                statusFilter = 'DRAFT'
            } else if (currentTab === 'shop') {
                statusFilter = 'PUBLISHED'
                // Assuming your backend uses a specific listing type for store items.
                // Adjust this value ('SALE', 'COMMERCIAL', etc.) to match your actual Supabase enum.
                // listingTypeFilter = 'SALE' 
            }

            const response = await artworkService.list({ 
                creator_id: userId, 
                status: statusFilter,
                ...(listingTypeFilter ? { listing_type: listingTypeFilter } : {}),
                page: currentPage, 
                limit: 8 
            })

            if (currentPage === 1) {
                setArtworks(response.data)
            } else {
                setArtworks((prev) => [...prev, ...response.data])
            }
            
            setHasMore(response.has_next)
        } catch (error) {
            console.error(`Failed to load ${currentTab} artworks:`, error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleLoadMore = () => {
        const next = page + 1
        setPage(next)
        fetchArtworks(next, tabType)
    }

    return (
        <div className='flex flex-col'>
            {isLoading && artworks.length === 0 ? (
                <div className='grid grid-cols-1 gap-x-4 gap-y-12 px-4 py-12 sm:grid-cols-2 md:grid-cols-3 md:px-8 lg:grid-cols-4'>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className='aspect-square animate-pulse rounded-2xl bg-gray-50' />
                    ))}
                </div>
            ) : artworks.length === 0 ? (
                <div className='flex flex-col items-center gap-6 px-4 py-16 text-center'>
                    {/* Placeholder path — swap in the illustration you're adding yourself. */}
                    <Image src='/images/empty-artworks.svg' width={224} height={224} alt='' />
                    <div className='flex flex-col gap-2'>
                        <h3 className='font-poppins text-body-l font-semibold text-heading'>{EMPTY_COPY[tabType].title}</h3>
                        <p className='max-w-sm font-poppins text-body-s text-gray-400'>{EMPTY_COPY[tabType].body}</p>
                    </div>
                    {isOwnProfile && tabType === 'artwork' && onPostArtwork && (
                        <Button variant='primary' leftIcon='/icons/plus-white-bg.svg' onClick={onPostArtwork}>
                            Post Artwork
                        </Button>
                    )}
                </div>
            ) : (
                <div className='grid grid-cols-1 gap-x-4 gap-y-12 px-4 py-12 sm:grid-cols-2 md:grid-cols-3 md:px-8 lg:grid-cols-4'>
                    {artworks.map((art) => (
                        <ArtCard
                            key={art.id}
                            image={art.assets?.[0]?.optimized_url || art.assets?.[0]?.original_url || '/placeholder.jpg'}
                            title={art.title}
                            onCardClick={() => onArtworkClick(art, artworks)}
                            showVideo={art.assets?.[0]?.media_type === 'VIDEO'}
                            showCart={art.listing_type === 'MARKETPLACE'}
                            artist={[{
                                id: art.creator?.id || art.creator_id,
                                name: art.creator?.profile?.display_name || art.creator?.username || 'Unknown Artist',
                                avatarUrl: art.creator?.profile?.avatar_url || '/images/image-avatar.svg',
                            }]}
                            stats={{
                                likes: String(art.like_count || 0),
                                views: String(art.view_count || 0)
                            }}
                            variant='standard'
                        />
                    ))}
                </div>
            )}

            {hasMore && (
                <div className='w-full py-6 flex items-center justify-center'>
                    <Button 
                        leftIcon='/home/profile-ring.svg'
                        variant='outline'
                        size='xl'
                        onClick={handleLoadMore}
                        disabled={isLoading}
                        loadingText='Loading...'
                    >
                        Load More Art
                    </Button>
                </div>
            )}
        </div>
    )
}

export default ProfileArtwork