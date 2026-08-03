'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Footer from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import ProfileAboutTab from '@/features/profile/components/profile-about'
import ProfileArtwork from '@/features/profile/components/profile-artwork'
import ProfileHeader from '@/features/profile/components/profile-header'
import { ProfileMoodboards } from '@/features/profile/components/profile-moodboards'
import { ProfileTabs, TabItem } from '@/features/profile/components/profile-tabs'
import UploadModal from '@/features/upload/components/upload-modal'
import ArtworkViewOverlay from '@/features/artwork/components/home/artwork-view-overlay'
import { artworkService } from '@/services'
import { useAuthStore } from '@/store'
import { User } from '@/types'
import type { Artwork } from '@/types/artwork'

const PersonalProfilePage = () => {
    const { user } = useAuthStore()
    const [showPostArtwork, setShowPostArtwork] = useState(false)
    const [activeArtwork, setActiveArtwork] = useState<Artwork | null>(null)
    const [artworkList, setArtworkList] = useState<Artwork[]>([])

    // Draft tab only shows if there's actually something in it.
    const { data: draftCheck } = useQuery({
        queryKey: ['artworks', 'draft-count', user?.id],
        queryFn: () => artworkService.list({ creator_id: user!.id, status: 'DRAFT', limit: 1 }),
        enabled: Boolean(user?.id),
    })
    const hasDrafts = (draftCheck?.total ?? 0) > 0

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
        if (!user) return []
        const tabs: TabItem[] = [
            {
                id: 'artworks',
                label: 'Artworks',
                icon: '/icons/gallery.svg',
                content: (
                    <ProfileArtwork
                        userId={user.id}
                        tabType="artwork"
                        isOwnProfile
                        onPostArtwork={() => setShowPostArtwork(true)}
                        onArtworkClick={handleArtworkClick}
                    />
                ),
            },
            { id: 'about', label: 'About', icon: '/icons/user-grey.svg', content: <ProfileAboutTab user={user as User} /> },
            {
                id: 'moodboard',
                label: 'Moodboard',
                icon: '/icons/moodboard-grey.svg',
                content: <ProfileMoodboards isOwnProfile onArtworkClick={handleArtworkClick} />,
            },
            {
                id: 'shop',
                label: 'Shop',
                icon: '/icons/shop.svg',
                content: <ProfileArtwork userId={user.id} tabType="shop" isOwnProfile={false} onArtworkClick={handleArtworkClick} />,
            },
        ]

        if (hasDrafts) {
            tabs.push({
                id: 'draft',
                label: 'Draft',
                icon: '/icons/document.svg',
                content: (
                    <ProfileArtwork
                        userId={user.id}
                        tabType="draft"
                        isOwnProfile
                        onArtworkClick={handleArtworkClick}
                    />
                ),
            })
        }

        return tabs
    }, [user, hasDrafts])

    if (!user) return null

    return (
        <div className="relative min-h-screen">
            <Navbar />
            <ProfileHeader user={user as User} isOwnProfile onPostArtwork={() => setShowPostArtwork(true)} />
            <ProfileTabs tabs={profileTabs} defaultTab={profileTabs[0]?.id} />
            <Footer />

            <UploadModal isOpen={showPostArtwork} onClose={() => setShowPostArtwork(false)} />

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

export default PersonalProfilePage
