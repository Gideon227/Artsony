import { ArtCard, Artist } from '@/components/ui/art-card'
import { Artwork } from '@/types'
import React from 'react'

const ProfileArtCard = ({ artworks }: { artworks: Artwork[] }) => {
    return (
        <div className="py-12 px-8 bg-white grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-12 items-center justify-center">
            {artworks?.map((art, index) => {
                const formattedArtists: Artist[] = [
                    {
                        id: art.creator?.id || art.creator_id,
                        name: art.creator?.profile?.display_name || art.creator?.username || 'Unknown Artist',
                        avatarUrl: art.creator?.profile?.avatar_url || '/images/image-avatar.svg',
                        role: art.creator?.role || 'Artist',
                        stats: {
                            followers: String(art.creator?.profile?.followers_count ?? 0),
                            likes: String(art.like_count ?? 0),
                            following: String(art.creator?.profile?.following_count ?? 0),
                        },
                    }
                ];

                return (
                    <div key={art.id || index} className="w-full flex justify-center">
                        <ArtCard 
                            image={art.assets[0]?.original_url as string}
                            title={art.title || 'Profile Art'}
                            artist={formattedArtists} 
                            artworkId={art.id}
                            stats={{
                                likes: String(art.like_count || '0'),
                                views: String(art.view_count || '0')
                            }}
                            cardLink={`/artwork/${art.id}`}
                            onAction={(action) => console.log('Action:', action)}
                        />
                    </div>
                )
            })}
        </div>
    )
}

export default ProfileArtCard