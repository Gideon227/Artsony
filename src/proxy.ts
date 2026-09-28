import { NextResponse, type NextRequest } from 'next/server'

// ─── Architecture note ────────────────────────────────────────────────────────
// This middleware does NOT gate the whole app anymore. Guests can browse
// freely — home, discover, shop, search, artwork pages, other users'
// profiles, and cart all render without a session. Only routes that are
// inherently the signed-in user's own data are gated here; everything else
// is open, with pages/components adapting their own UI based on auth state
// (see Navbar/Footer, which read the auth store directly).
//
// The httpOnly RT cookie is NOT reliably readable in all middleware edge cases
// — specifically after a client-side login where the Set-Cookie response from
// the login API hasn't been committed before the next navigation fires in
// middleware.
//
// Solution: backend sets a companion, non-httpOnly "session exists" flag
// cookie alongside the real (httpOnly) refresh token cookie. Middleware reads
// only this flag (no sensitive data in it); the client also sets it right
// after a successful login/register mutation so it's available immediately
// on the very next navigation without waiting on the backend response.
// ─────────────────────────────────────────────────────────────────────────────

const SESSION_COOKIE = 'artsony_session' // non-httpOnly, set by backend + client

// Routes that require a signed-in user because they're the user's own
// account data (orders, wallet, messages, settings, seller tools, etc).
// Matched as an exact path or any /prefix/... sub-route.
const GATED_PREFIXES = [
  '/checkout',
  '/my-orders',
  '/all-orders',
  '/notification',
  '/moodboards',
  '/messages',
  '/settings',
  '/seller-registration',
  '/artsony-studio',
  '/artworks/upload',
]

function isGatedPath(pathname: string): boolean {
  // Own profile ("/profile") is account data — gated. Other users' profiles
  // ("/profile/[id]") are public browsing and stay open.
  if (pathname === '/profile') return true
  return GATED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (isStaticOrApi(pathname)) return NextResponse.next()

  // "/" is just a URL alias for the real homepage — not an auth check.
  // The actual homepage content lives at /home for both guests and members.
  if (pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/home'
    return NextResponse.redirect(url)
  }

  if (isGatedPath(pathname)) {
    const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value)
    if (!hasSession) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.search = ''
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}