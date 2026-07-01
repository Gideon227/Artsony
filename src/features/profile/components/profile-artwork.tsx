'use client'

import React, { useEffect, useState } from 'react'
import { Button } from '@/components'
import { ArtCard } from '@/components/ui/art-card'
import { artworkService } from '@/services'
import { Artwork, ArtworkStatus } from '@/types/artwork'

interface ProfileArtworkProps {
    userId: string;
    tabType: 'artwork' | 'shop' | 'draft';
}

const ProfileArtwork = ({ userId, tabType }: ProfileArtworkProps) => {
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
            <div className='py-12 px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12'>
                {artworks?.map((art) => {
                    const creator = (art as any).creator 
                    const creatorRecentWorks = creator?.artworks?.assets?.map((item: any) => item.optimized_url)

                    return (
                        <ArtCard 
                            key={art.id}
                            image={art.assets?.[0]?.optimized_url || art.assets?.[0]?.original_url || '/placeholder.jpg'}
                            title={art.title}
                            cardLink={`/artwork/${art.slug || art.id}`}
                            artist={[{
                                id: creator?.id || art.creator_id,
                                name: creator?.username || 'Unknown Artist',
                                avatarUrl: creator?.avatarUrl || '/default-avatar.png',
                                role: 'Artist',
                                stats: {
                                    followers: String(creator?.followersCount || '0'),
                                    likes: String(creator?.likesCount || '0'),
                                    following: String(creator?.followingCount || '0')
                                },
                                recentArtworks: creatorRecentWorks as string[] || []
                            }]}
                            stats={{
                                likes: String(art.like_count || 0),
                                views: String(art.view_count || 0)
                            }}
                            variant='standard'
                            showHeart={true}
                            showCat={true}
                            alternate={false}
                        />
                    )
                })}
            </div>
            
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