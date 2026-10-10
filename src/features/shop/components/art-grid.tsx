import { ArtCard, Artist } from '@/components/ui/art-card'
import { Artwork } from '@/types'
import React from 'react'

interface Props {
    artworks: Artwork[]
    num?: number
    artVariant?: "standard" | "discover" | "bland" | "shop"
    onCardClick?: (artwork: Artwork, index: number) => void
}

const ArtGrid = ({ artworks, num, artVariant = "standard", onCardClick }: Props) => {
    // Limit items rendered if `num` is passed
    const displayedArtworks = num ? artworks.slice(0, num) : artworks

    return (
        <div className='py-12 px-4 lg:px-8 gap-x-4 gap-y-12 grid grid-cols-[repeat(auto-fill,minmax(min(376px,100%),1fr))] justify-center'>
            {displayedArtworks.map((art, index) => {
                const mappedArtists: Artist[] = art.creator ? [{
                    id: art.creator.id || art.creator_id,
                    name: art.creator.profile?.display_name || art.creator.username || 'Artist',
                    avatarUrl: art.creator.profile?.avatar_url || '/images/image-avatar.svg',
                    role: art.creator.role || 'Artist',
                    stats: {
                        followers: String(art.creator.profile?.followers_count ?? 0),
                        likes: String(art.like_count ?? 0),
                        following: String(art.creator.profile?.following_count ?? 0),
                    }
                }] : []

                return (
                    <ArtCard
                        key={art.id || index}
                        image={art.assets?.[0]?.optimized_url || art.assets?.[0]?.original_url || '/placeholder.png'} 
                        title={art.title}
                        onCardClick={onCardClick ? () => onCardClick(art, index) : undefined}
                        showVideo={art.assets?.[0]?.media_type === 'VIDEO'}
                        artist={mappedArtists}
                        stats={{ likes: String(art.like_count ?? 0), views: String(art.view_count ?? 0) }}
                        variant={artVariant}
                    />
                )
            })}
        </div>
    )
}

export default ArtGrid