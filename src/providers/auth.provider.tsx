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
        gcTime:    1000 * 60 * 10,
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

// ─── Session bootstrap ────────────────────────────────────────────────────────
// Runs once per page mount. Tries to silently refresh the access token using
// the httpOnly RT cookie the browser sends automatically. On success, the user
// store is populated and the access token sits in memory only. On failure the
// store is cleared — middleware already sent them to /login or /signup.

function SessionBootstrap() {
  const setUser      = useAuthStore((s) => s.setUser)
  const setAccessToken = useAuthStore((s) => s.setAccessToken)
  const clearAuth    = useAuthStore((s) => s.clearAuth)
  const setHydrated  = useAuthStore((s) => s.setHydrated)
  const done         = useRef(false)

  useEffect(() => {
    if (done.current) return
    done.current = true

    ;(async () => {
      try {
        // Use raw fetch — NOT apiClient — so the 401 interceptor never fires
        // for this call. The refresh endpoint doesn't need a Bearer token, it
        // uses the httpOnly RT cookie. Routing it through apiClient would cause
        // the interceptor to call refresh AGAIN on a 401, creating an infinite
        // loop and hard-redirecting the user to /login on every page load.
        const res = await fetch(`${API_BASE}/api/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        })

        if (!res.ok) {
          // No session — this is normal for guests. Don't redirect, just clear.
          clearAuth()
          return
        }

        const body = (await res.json()) as { data: { accessToken: string } }
        const accessToken = body.data.accessToken
        setMemoryToken(accessToken)
        setAccessToken(accessToken)

        const meRes = await authService.me()
        setUser(meRes.data)
      } catch {
        clearAuth()
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