'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import Footer from '@/components/layout/footer'
import { Navbar } from '@/components/layout/navbar'
import { useOpenArtwork } from '@/hooks/use-artwork-viewer'
import { userService } from '@/services/user.service'
import { useAuthStore } from '@/store'
import type { Artwork } from '@/types/artwork'
import ProfileAboutTab from './profile-about'
import ProfileArtwork from './profile-artwork'
import ProfileHeader from './profile-header'
import { ProfileMoodboards } from './profile-moodboards'
import { ProfileTabs, type TabItem } from './profile-tabs'

type PublicProfileViewProps = {
  id: string
  redirectOwnProfile?: boolean
}

export default function PublicProfileView({ id, redirectOwnProfile = true }: PublicProfileViewProps) {
  const router = useRouter()
  const { user: currentUser } = useAuthStore()
  const openArtwork = useOpenArtwork()

  const isOwnProfile = currentUser?.id === id
  const redirectsToOwn = isOwnProfile && redirectOwnProfile

  const { data: profileUser, isLoading, isError } = useQuery({
    queryKey: ['users', 'profile', id],
    queryFn: () => userService.getProfile(id).then((r) => r.data),
    enabled: Boolean(id) && !redirectsToOwn,
  })

  const handleArtworkClick = useMemo(
    () => (artwork: Artwork, siblings: Artwork[]) => openArtwork(artwork, { siblings, variant: 'home' }),
    [openArtwork],
  )

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
  }, [profileUser, handleArtworkClick])

  // Viewing your own id via /profile/[id] — send to the canonical /profile
  // route instead of duplicating the "me" experience under two URLs.
  useEffect(() => {
    if (redirectsToOwn) router.replace('/profile')
  }, [redirectsToOwn, router])

  if (redirectsToOwn) return null

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
    </div>
  )
}
