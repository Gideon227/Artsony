// 'use client'

// import PreviewPhysicalArt from '@/features/upload/components/preview-physical-art'
// import { artworkService } from '@/services'
// import { useParams, useRouter } from 'next/navigation'
// import React, { useEffect, useState } from 'react'

// import type { Artwork } from '@/types/artwork' 
// import { User } from '@/types'
// import ArtworkViewOverlay from '@/features/artwork/components/artwork-view-overlay'

// const UploadDetailPage = () => {
//     const router = useRouter()
//     const { id: urlArtworkId } = useParams<{ id: string }>()
    
//     const [artwork, setArtwork] = useState<Artwork | null>(null) 
//     const [isLoading, setIsLoading] = useState<boolean>(true)
//     const [error, setError] = useState<string | null>(null)

//     useEffect(() => {
//         const getArtwork = async () => {
//             if (!urlArtworkId) return;

//             try {
//                 setIsLoading(true)
//                 setError(null)

//                 const response = await artworkService.getById(urlArtworkId)
//                 if (response && response.data) {
//                     setArtwork(response.data)
//                 } else {
//                     setError('Failed to load artwork details.')
//                 }
                
//             } catch (err: any) {
//                 console.error('[ARTWORK_FETCH_ERROR]:', err)
//                 setError('An unexpected error occurred while fetching the artwork.')
//             } finally {
//                 setIsLoading(false)
//             }
//         }

//         getArtwork()
//     }, [urlArtworkId])

//     console.log("Artwork: ", artwork)
//     console.log("Artwork Creator: ", artwork?.creator)

//     return (
//         <div className='bg-black'>
//             {artwork?.creator && (() => {
//                 // Map the minimized creator payload into the full structural interface expected by User
//                 const mappedUser: User = {
//                     id: artwork.creator.id,
//                     username: artwork.creator.username,
//                     displayName: artwork.creator.profile?.display_name || artwork.creator.username,
//                     avatarUrl: artwork.creator.profile?.avatar_url || null,
//                     followersCount: artwork.creator.profile?.followers_count || 0,
//                     followingCount: artwork.creator.profile?.following_count || 0,
//                     artworksCount: artwork.creator.profile?.artworks_count || 0,
                    
//                     // Satisfying fallback assignments for missing fields required by the type definition
//                     email: '', 
//                     bio: null,
//                     website: null,
//                     instagramLink: null,
//                     facebookLink: null,
//                     twitterLink: null,
//                     behanceLink: null,
//                     likesCount: 0,
//                     viewsCount: 0,
//                     isVerified: false,
//                     onboarded: false,
//                     interests: [],
//                     artworks: artwork, 
                    
//                     // Timestamp compatibility mappings
//                     created_at: artwork.created_at,
//                     createdAt: artwork.created_at, 
//                     updatedAt: artwork.updated_at,
//                 }

//                 return (
//                     <ArtworkViewOverlay 
//                         user={mappedUser} 
//                     />
//                 )
//             })()}
//         </div>
//     )
// }

// export default UploadDetailPage