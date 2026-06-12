'use client'
import Footer from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import ProfileAboutTab from '@/features/profile/components/profile-about'
import ProfileArtwork from '@/features/profile/components/profile-artwork'
import ProfileHeader from '@/features/profile/components/profile-header'
import { ProfileTabs, TabItem } from '@/features/profile/components/profile-tabs'
import UploadModal from '@/features/upload/components/upload-modal' // <-- Import Modal
import { useAuthStore } from '@/store'
import { User } from '@/types'
import React, { useState } from 'react'

const PersonalProfilePage = () => {
    const { user } = useAuthStore()
    const [showPostArtwork, setShowPostArtwork] = useState(false) // State to trigger modal

    const profileTabs: TabItem[] = [
        { id: 'artworks', label: 'Artworks', icon: '/icons/gallery.svg', content: <ProfileArtwork userId={user?.id as string} tabType='artwork' /> },
        { id: 'about', label: 'About', icon: '/icons/user-grey.svg', content: <ProfileAboutTab user={user as User} /> },
        { id: 'moodboard', label: 'Moodboard', icon: '/icons/moodboard-grey.svg', content: <ProfileAboutTab user={user as User} /> },
        { id: 'shop', label: 'Shop', icon: '/icons/shop.svg', content: <ProfileArtwork userId={user?.id as string} tabType='shop' /> },
        { id: 'draft', label: 'Draft', icon: '/icons/document.svg', content: <ProfileArtwork userId={user?.id as string} tabType='draft' /> },
    ]

    if(!user) return null;

    return (
        <div className="relative min-h-screen">
            <Navbar />
            <ProfileHeader user={user as User} whoisthis='me' onClick={() => setShowPostArtwork(true)} />
            <ProfileTabs tabs={profileTabs} defaultTab={profileTabs[0]?.id} />
            <Footer />

            {/* Mount the Modal outside the normal document flow */}
            <UploadModal 
                isOpen={showPostArtwork} 
                onClose={() => setShowPostArtwork(false)} 
            />
        </div>
    )
}

export default PersonalProfilePage