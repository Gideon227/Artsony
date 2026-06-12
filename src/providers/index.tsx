'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect, useRef } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'
import { setMemoryToken } from '@/lib/api-client'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ''

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 10,
        retry: (failureCount, error) => {
          if (error instanceof Error && 'statusCode' in error) {
            const code = (error as { statusCode: number }).statusCode
            if (code === 401 || code === 403 || code === 404) return false
          }
          return failureCount < 2
        },
        refetchOnWindowFocus: false,
      },
      mutations: { retry: 0 },
    },
  })
}

let browserQueryClient: QueryClient | undefined

function getQueryClient() {
  if (typeof window === 'undefined') return makeQueryClient()
  browserQueryClient ??= makeQueryClient()
  return browserQueryClient
}

function SessionBootstrap() {
  const setUser       = useAuthStore((s) => s.setUser)
  const setAccessToken = useAuthStore((s) => s.setAccessToken)
  const clearAuth     = useAuthStore((s) => s.clearAuth)
  const setHydrated   = useAuthStore((s) => s.setHydrated)
  const isHydrated    = useAuthStore((s) => s.isHydrated)
  const done          = useRef(false)

  useEffect(() => {
    if (done.current || isHydrated) return
    done.current = true

    ;(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        })

        if (!res.ok) {
          // No active session — clear any stale Zustand-persisted user
          clearAuth()
          // Also clear the session indicator so middleware agrees
          document.cookie = 'artsony_session=; max-age=0; path=/; SameSite=Strict'
          return
        }

        const body = (await res.json()) as { data: { accessToken: string } }
        const accessToken = body.data.accessToken

        setMemoryToken(accessToken)
        setAccessToken(accessToken)

        const meRes = await authService.me()
        setUser(meRes.data)

        // Ensure session indicator is present for middleware on any subsequent navigation
        document.cookie = `artsony_session=1; path=/; SameSite=Strict; max-age=${365 * 24 * 60 * 60}`
      } catch {
        clearAuth()
        document.cookie = 'artsony_session=; max-age=0; path=/; SameSite=Strict'
      } finally {
        setHydrated()
      }
    })()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <SessionBootstrap />
      {children}
      <Toaster />
    </QueryClientProvider>
  )
}