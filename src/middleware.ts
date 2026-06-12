import { NextResponse, type NextRequest } from 'next/server'

// ─── Architecture note ────────────────────────────────────────────────────────
// The httpOnly RT cookie is NOT reliably readable in all middleware edge cases —
// specifically after a client-side login where the Set-Cookie response from the
// login API hasn't been committed before the next navigation fires in middleware.
//
// Solution: backend sets TWO cookies on login/refresh/logout:
//   1. artsony_rt       → httpOnly, secure — the actual refresh token (API use only)
//   2. artsony_session  → NOT httpOnly, SameSite=Strict — plain "session exists" flag
//
// Middleware reads artsony_session (no sensitive data in it).
// The client also sets artsony_session after a successful login mutation so the
// flag is available immediately on the next navigation without waiting on backend.
// ─────────────────────────────────────────────────────────────────────────────

const SESSION_COOKIE  = 'artsony_session'   // non-httpOnly, set by backend + client
const ONBOARDED_COOKIE = 'artsony_onboarded' // non-httpOnly, set by backend + client
const VISITED_COOKIE  = 'artsony_visited'   // set by this middleware

const PUBLIC_AUTH_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password']

function isPublicAuth(p: string) {
  return PUBLIC_AUTH_PATHS.some((r) => p === r || p.startsWith(r + '/'))
}

function isOnboardingPath(p: string) {
  return p === '/onboarding' || p.startsWith('/onboarding/')
}

function isStaticOrApi(p: string) {
  return (
    p.startsWith('/_next') ||
    p.startsWith('/api') ||
    p.startsWith('/icons') ||
    p.startsWith('/images') ||
    p.startsWith('/socials') ||
    /\.(ico|svg|png|jpg|jpeg|webp|woff2?|ttf|otf|map|css|js)$/.test(p)
  )
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isStaticOrApi(pathname)) return NextResponse.next()

  const hasSession  = Boolean(request.cookies.get(SESSION_COOKIE)?.value)
  const isOnboarded = request.cookies.get(ONBOARDED_COOKIE)?.value === '1'
  const hasVisited  = Boolean(request.cookies.get(VISITED_COOKIE)?.value)

  const redirect = (to: string, preserveNext = false) => {
    const url = request.nextUrl.clone()
    url.pathname = to
    url.search = ''
    if (preserveNext && !isPublicAuth(pathname) && pathname !== '/') {
      url.searchParams.set('next', pathname)
    }
    return NextResponse.redirect(url)
  }

  // ── Root ───────────────────────────────────────────────────────────────────
  if (pathname === '/') {
    if (!hasSession) return redirect(hasVisited ? '/login' : '/signup')
    if (!isOnboarded) return redirect('/onboarding')
    return redirect('/home')
  }

  // ── No session ─────────────────────────────────────────────────────────────
  if (!hasSession) {
    if (isPublicAuth(pathname)) return NextResponse.next()
    return redirect(hasVisited ? '/login' : '/signup', true)
  }

  // ── Has session on an auth page → redirect into app ───────────────────────
  if (isPublicAuth(pathname)) {
    return redirect(isOnboarded ? '/home' : '/onboarding')
  }

  // ── Not onboarded yet ──────────────────────────────────────────────────────
  if (!isOnboarded && !isOnboardingPath(pathname)) {
    return redirect('/onboarding')
  }

  // ── Already onboarded, revisiting onboarding ──────────────────────────────
  if (isOnboarded && isOnboardingPath(pathname)) {
    return redirect('/home')
  }

  // ── Authenticated and on a valid route ────────────────────────────────────
  const res = NextResponse.next()
  if (!hasVisited) {
    res.cookies.set(VISITED_COOKIE, '1', {
      httpOnly: false,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 365 * 24 * 60 * 60,
    })
  }
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}