'use client'

import { usePathname } from 'next/navigation'
import { MobileNav } from '@/components/layout/mobile-nav'

export function ConditionalMobileNav() {
  const pathname = usePathname()
  
  // Adjust this check to match your chat route structure (e.g., /messages/123)
  const isChatScreen = pathname?.includes('/messages')

  if (isChatScreen) return null

  return <MobileNav />
}