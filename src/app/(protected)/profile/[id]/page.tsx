'use client'

import { use } from 'react'
import PublicProfileView from '@/features/profile/components/public-profile-view'

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <PublicProfileView id={id} />
}
