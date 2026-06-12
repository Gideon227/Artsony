'use client'

import { useAuthStore, selectUser, selectIsAuthenticated, selectIsHydrated } from '@/store'
import { useToast } from '@/components/ui/toaster'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/constants'

export function useAuth() {
  const user = useAuthStore(selectUser)
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const isHydrated = useAuthStore(selectIsHydrated)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const router = useRouter()
  const { success } = useToast()

  const logout = () => {
    clearAuth()
    success('Signed out', 'See you next time!')
    router.push(ROUTES.auth.login)
  }

  const requireAuth = (): boolean => {
    if (!isHydrated) return false
    if (!isAuthenticated) {
      router.push(ROUTES.auth.login)
      return false
    }
    return true
  }

  return { user, isAuthenticated, isHydrated, logout, requireAuth }
}