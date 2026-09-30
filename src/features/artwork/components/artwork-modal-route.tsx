'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { ArtworkOverlayHost } from './artwork-overlay-host'

export default function ArtworkModalRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()

  return <ArtworkOverlayHost slug={slug} onClose={() => router.back()} />
}
