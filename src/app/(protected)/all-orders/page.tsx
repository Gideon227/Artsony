'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function LegacyRedirect() {
  const router = useRouter()
  const query = useSearchParams().toString()

  useEffect(() => {
    router.replace(query ? `/order-management?${query}` : '/order-management')
  }, [query, router])

  return null
}

export default function LegacyAllOrdersPage() {
  return (
    <Suspense fallback={null}>
      <LegacyRedirect />
    </Suspense>
  )
}
