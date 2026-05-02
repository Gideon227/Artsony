import { NextResponse, type NextRequest } from 'next/server'

// ─── Route classification ─────────────────────────────────────────────────────

const PUBLIC_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password']
const AUTH_ONLY_PATHS = ['/onboarding']
const PROTECTED_PREFIXES = ['/profile', '/upload', '/settings', '/cart', '/checkout', '/orders', '/notifications']

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

function isOnboardingPath(pathname: string) {
  return pathname === '/onboarding' || pathname.startsWith('/onboarding/')
}

function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

// ─── Middleware ───────────────────────────────────────────────────────────────
// The RT cookie is httpOnly — JS can't touch it, but Next.js middleware CAN
// read it server-side. We detect its presence to determine session state.
// We do NOT validate the JWT here (that's the backend's job). We only check:
//   1. Does an RT cookie exist? → user likely has a session
//   2. Is the user onboarded?   → determined from our own session cookie
//
// For strict validation, the backend middleware handles it.
// This middleware is for fast redirects, not security enforcement.

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip Next internals and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/images') ||
    pathname.match(/\.(ico|svg|png|jpg|jpeg|webp|woff2|woff|ttf)$/)
  ) {
    return NextResponse.next()
  }

  const rtCookie = request.cookies.get('artsony_rt')
  const hasSession = Boolean(rtCookie?.value)

  // ── Guest on public page: allow ────────────────────────────────────────
  if (!hasSession && isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // ── Guest on protected/home page: redirect based on history ───────────
  // If they've never logged in (no 'artsony_visited' cookie): → /signup
  // If they've visited before (returning unauthenticated): → /login
  if (!hasSession && !isPublicPath(pathname)) {
    const hasVisited = request.cookies.get('artsony_visited')
    const target = hasVisited ? '/login' : '/signup'
    const url = request.nextUrl.clone()
    url.pathname = target
    // Preserve intended destination for post-login redirect
    if (pathname !== '/') url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // ── Authenticated user on public auth pages: redirect home ────────────
  if (hasSession && isPublicPath(pathname) && !isOnboardingPath(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // ── Set "visited" cookie so returning guests go to /login not /signup ─
  const response = NextResponse.next()
  if (!request.cookies.get('artsony_visited')) {
    response.cookies.set('artsony_visited', '1', {
      maxAge: 365 * 24 * 60 * 60,
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    })
  }

  // ── Onboarding status check ─────────────────────────────────────────────
  // We use a lightweight session cookie (set by the backend on login/register)
  // to avoid calling the DB on every request. The backend sets this cookie
  // when it issues the RT. If `artsony_onboarded=1`, skip onboarding gate.
  const onboardedCookie = request.cookies.get('artsony_onboarded')
  const isOnboarded = onboardedCookie?.value === '1'

  if (hasSession && !isOnboarded && !isOnboardingPath(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/onboarding'
    return NextResponse.redirect(url)
  }

  if (hasSession && isOnboarded && isOnboardingPath(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}