'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Footer from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import ProfileAboutTab from '@/features/profile/components/profile-about'
import ProfileArtwork from '@/features/profile/components/profile-artwork'
import ProfileHeader from '@/features/profile/components/profile-header'
import { ProfileMoodboards } from '@/features/profile/components/profile-moodboards'
import { ProfileTabs, TabItem } from '@/features/profile/components/profile-tabs'
import ArtworkViewOverlay from '@/features/artwork/components/home/artwork-view-overlay'
import { userService } from '@/services/user.service'
import { useAuthStore } from '@/store'
import type { Artwork } from '@/types/artwork'

export default function PublicProfilePage({ params }: { params: { id: string } }) {
    const { id } = params
    const router = useRouter()
    const { user: currentUser } = useAuthStore()
    const [activeArtwork, setActiveArtwork] = useState<Artwork | null>(null)
    const [artworkList, setArtworkList] = useState<Artwork[]>([])

    const isOwnProfile = currentUser?.id === id

    const { data: profileUser, isLoading, isError } = useQuery({
        queryKey: ['users', 'profile', id],
        queryFn: () => userService.getProfile(id).then((r) => r.data),
        enabled: Boolean(id) && !isOwnProfile,
    })

    const handleArtworkClick = (artwork: Artwork, siblings: Artwork[]) => {
        setArtworkList(siblings)
        setActiveArtwork(artwork)
    }

    const activeIndex = activeArtwork ? artworkList.findIndex((a) => a.id === activeArtwork.id) : -1
    const handleNavigateArtwork = (direction: 'prev' | 'next') => {
        if (activeIndex === -1) return
        const nextIndex = direction === 'next' ? Math.min(activeIndex + 1, artworkList.length - 1) : Math.max(activeIndex - 1, 0)
        if (nextIndex === activeIndex) return
        setActiveArtwork(artworkList[nextIndex] as Artwork)
    }

    const profileTabs: TabItem[] = useMemo(() => {
        if (!profileUser) return []
        return [
            {
                id: 'artworks',
                label: 'Artworks',
                icon: '/icons/gallery.svg',
                content: <ProfileArtwork userId={profileUser.id} tabType="artwork" isOwnProfile={false} onArtworkClick={handleArtworkClick} />,
            },
            { id: 'about', label: 'About', icon: '/icons/user-grey.svg', content: <ProfileAboutTab user={profileUser} /> },
            {
                id: 'moodboard',
                label: 'Moodboard',
                icon: '/icons/moodboard-grey.svg',
                content: <ProfileMoodboards isOwnProfile={false} onArtworkClick={handleArtworkClick} />,
            },
            {
                id: 'shop',
                label: 'Shop',
                icon: '/icons/shop.svg',
                content: <ProfileArtwork userId={profileUser.id} tabType="shop" isOwnProfile={false} onArtworkClick={handleArtworkClick} />,
            },
        ]
    }, [profileUser])

    // Viewing your own id via /profile/[id] — send to the canonical /profile
    // route instead of duplicating the "me" experience under two URLs.
    useEffect(() => {
        if (isOwnProfile) router.replace('/profile')
    }, [isOwnProfile, router])

    if (isOwnProfile) {
        return null
    }

    if (isLoading) {
        return (
            <div className="relative min-h-screen">
                <Navbar />
                <div className="flex h-[400px] items-center justify-center">
                    <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
                </div>
            </div>
        )
    }

    if (isError || !profileUser) {
        return (
            <div className="relative min-h-screen">
                <Navbar />
                <div className="flex h-[400px] flex-col items-center justify-center gap-2 text-center">
                    <h2 className="font-poppins text-body-l font-semibold text-heading">Profile not found</h2>
                    <p className="font-poppins text-body-s text-gray-400">This artist may have deactivated their account.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="relative min-h-screen">
            <Navbar />
            <ProfileHeader user={profileUser} isOwnProfile={false} />
            <ProfileTabs tabs={profileTabs} defaultTab={profileTabs[0]?.id} />
            <Footer />

            {activeArtwork && (
                <ArtworkViewOverlay
                    artwork={activeArtwork}
                    onClose={() => setActiveArtwork(null)}
                    onNavigate={artworkList.length > 1 ? handleNavigateArtwork : undefined}
                />
            )}
        </div>
    )
}
