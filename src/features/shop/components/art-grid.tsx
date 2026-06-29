import { ArtCard, Artist } from '@/components/ui/art-card'
import { Artwork } from '@/types'
import React from 'react'

interface Props {
    artworks: Artwork[]
    num: number
    artVariant: "standard" | "discover" | "bland" | "shop"
}

const ArtGrid = ({ artworks, num, artVariant }: Props) => {
    return (
        <div className='py-12 px-8 gap-x-4 gap-y-12 grid grid-cols-4'>
            {artworks.slice(num)?.map((art, index) => {
                
                const mappedArtists: Artist[] = art.creator ? [{
                    id: art.creator.id,
                    name: art.creator.profile?.display_name || art.creator.username || 'Unknown Artist',
                    avatarUrl: art.creator.profile?.avatar_url || '/default-avatar.png',
                    role: art.creator.role || 'Artist',
                    stats: {
                        followers: art.creator.profile?.followers_count?.toString() || '0',
                        likes: art.like_count?.toString() || '0',
                        following: art.creator.profile?.following_count?.toString() || '0'
                    }
                }] : [];

                return (
                    <ArtCard 
                        key={art.id || index}
                        variant={artVariant}
                        image={art.assets?.[0]?.optimized_url || art.assets?.[0]?.original_url || '/placeholder.png'} 
                        title={art.title}
                        artist={mappedArtists}
                        stats={{
                            likes: art.like_count?.toString() || '0',
                            views: art.view_count?.toString() || '0'
                        }}
                    />
                )
            })}
        </div>
    )
}

export default ArtGrid