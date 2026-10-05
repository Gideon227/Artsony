'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect, useRef } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'
import { HttpError, isSessionEndedError, refreshAccessToken } from '@/lib/api-client'
import { setClientCookie } from '@/hooks/use-auth-mutations'

const ME_MAX_ATTEMPTS = 3
const ME_RETRY_BASE_DELAY_MS = 500

function isTransientError(err: unknown): boolean {
  if (!(err instanceof HttpError)) return true
  return err.statusCode === 429 || err.statusCode >= 500
}

async function loadCurrentUser() {
  for (let attempt = 1; ; attempt++) {
    try {
      return await authService.me()
    } catch (err) {
      if (!isTransientError(err) || attempt >= ME_MAX_ATTEMPTS) throw err
      await new Promise((resolve) => setTimeout(resolve, ME_RETRY_BASE_DELAY_MS * 2 ** (attempt - 1)))
    }
  }
}

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
  const setUser     = useAuthStore((s) => s.setUser)
  const setHydrated = useAuthStore((s) => s.setHydrated)
  const isHydrated  = useAuthStore((s) => s.isHydrated)
  const done        = useRef(false)

  useEffect(() => {
    if (done.current || isHydrated) return
    done.current = true

    ;(async () => {
      try {
        // Shares one in-flight request with any API call that 401s while the
        // page is loading, and clears the session itself only when the server
        // answers 401 (refresh token missing, expired or revoked).
        await refreshAccessToken()

        // The refresh succeeded, so the session is proven valid — restore the
        // proxy flag now rather than after /me, which may fail transiently.
        setClientCookie('artsony_session', '1')

        const meRes = await loadCurrentUser()
        setUser(meRes.data)
      } catch (err) {
        // A transport failure, 429 or 5xx says nothing about the session:
        // keep the persisted user and flag so the next request can recover.
        if (!isSessionEndedError(err)) {
          console.error('[SessionBootstrap] Could not restore session:', err)
        }
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