'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components'
import type { DraftHydration } from '../../../../../features/upload/hooks/use-draft-hydration'

export default function DraftLoadState({ state }: { state: Exclude<DraftHydration, { status: 'ready' }> }) {
  const router = useRouter()

  if (state.status === 'loading') {
    return (
      <div role="status" className="flex min-h-screen w-full items-center justify-center bg-white">
        <p className="animate-pulse font-poppins text-body text-gray-400">Loading your draft…</p>
      </div>
    )
  }

  return (
    <div role="alert" className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-white px-6 text-center">
      <p className="max-w-md font-poppins text-body text-gray-500">{state.message}</p>
      <Button variant="primary" onClick={() => router.push('/profile')}>Back to profile</Button>
    </div>
  )
}
