'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/constants'
import { ArtworkOverlayHost, useResolvedArtwork } from '@/features/artwork/components/artwork-overlay-host'
import PublicProfileView from '@/features/profile/components/public-profile-view'

export default function ArtworkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()
  const { artwork, isError, retry, isRetrying } = useResolvedArtwork(slug)

  if (isError) {
    return (
      <div className="relative min-h-screen">
        <Navbar />
        <div className="flex h-[400px] flex-col items-center justify-center gap-4 text-center">
          <h2 className="font-poppins text-body-l font-semibold text-heading">Artwork unavailable</h2>
          <p className="font-poppins text-body-s text-gray-400">
            It may have been removed, made private, or the connection failed.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={() => router.replace(ROUTES.home)} aria-label="Go to home">
              Home
            </Button>
            <Button size="lg" isLoading={isRetrying} onClick={() => void retry()} aria-label="Retry loading artwork">
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!artwork) {
    return (
      <div className="relative min-h-screen">
        <Navbar />
        <div role="status" aria-label="Loading artwork" className="flex h-[400px] items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      </div>
    )
  }

  return (
    <>
      <PublicProfileView id={artwork.creator_id} redirectOwnProfile={false} />
      <ArtworkOverlayHost slug={slug} onClose={() => router.replace(ROUTES.profile(artwork.creator_id))} />
    </>
  )
}
