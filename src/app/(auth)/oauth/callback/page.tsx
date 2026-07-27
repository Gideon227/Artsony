'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'
import { useToast } from '@/components/ui/toaster'
import { setClientCookie } from '@/hooks/use-auth-mutations'
import { HttpError } from '@/lib/api-client'

function OAuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser, setAccessToken, clearAuth } = useAuthStore()
  const { error } = useToast()
  const [failed, setFailed] = useState(false)
  const hasRun = useRef(false)

  useEffect(() => {
    if (hasRun.current) return
    hasRun.current = true

    const accessToken = searchParams.get('access_token')

    if (!accessToken) {
      error('Sign in failed', 'The sign-in link was incomplete. Please try again.')
      router.replace('/login?error=oauth_failed')
      return
    }

    void (async () => {
      try {
        // Must be set before calling authService.me() — apiClient reads the
        // in-memory token set here to attach the Authorization header.
        setAccessToken(accessToken)

        const { data: user } = await authService.me()
        setUser(user)

        // Same cookie stamping useLogin's onSuccess does, so middleware sees
        // the session on the very next navigation.
        setClientCookie('artsony_session', '1')
        setClientCookie('artsony_visited', '1')
        if (user.onboarded) {
          setClientCookie('artsony_onboarded', '1')
        }

        router.replace(user.onboarded ? '/home' : '/onboarding')
      } catch (err) {
        clearAuth()
        setFailed(true)
        if (err instanceof HttpError) {
          error('Sign in failed', err.message)
        } else {
          error('Sign in failed', 'Something went wrong. Please try again.')
        }
        router.replace('/login?error=oauth_failed')
      }
    })()
  }, [searchParams, router, setUser, setAccessToken, clearAuth, error])

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center gap-6 bg-white">
      <Image src="/icons/logo.svg" alt="Artsony" width={160} height={40} priority />
      {!failed && (
        <div className="flex items-center gap-3 text-neutral-500">
          <span className="animate-spin h-5 w-5 border-2 border-primary-500 border-t-transparent rounded-full inline-block" />
          <span className="text-sm font-medium">Signing you in…</span>
        </div>
      )}
    </main>
  )
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <OAuthCallbackContent />
    </Suspense>
  )
}