import { NextResponse, type NextRequest } from 'next/server'

// ─── Route maps ───────────────────────────────────────────────────────────────

const PUBLIC_PATHS  = ['/login', '/signup', '/forgot-password', '/reset-password']
const ONBOARDING    = '/onboarding'

function isPublic(p: string) { return PUBLIC_PATHS.some((r) => p === r || p.startsWith(r + '/')) }
function isOnboarding(p: string) { return p === ONBOARDING || p.startsWith(ONBOARDING + '/') }
function isStatic(p: string) {
  return (
    p.startsWith('/_next') ||
    p.startsWith('/api')   ||
    p.startsWith('/icons') ||
    p.startsWith('/images')||
    /\.(ico|svg|png|jpg|jpeg|webp|woff2?|ttf|otf|map)$/.test(p)
  )
}

// ─── Cookie names ──────────────────────────────────────────────────────────────
// artsony_rt        → httpOnly RT set by backend — presence = active session
// artsony_onboarded → non-httpOnly boolean set by backend — '1' = onboarded
// artsony_visited   → we set this — '1' = user has logged in before on this device

const RT_COOKIE = 'artsony_rt'
const ONBOARDED_COOKIE  = 'artsony_onboarded'
const VISITED_COOKIE = 'artsony_visited'

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl

//   if (isStatic(pathname)) return NextResponse.next()

//   const hasSession   = Boolean(request.cookies.get(RT_COOKIE)?.value)
//   const isOnboarded  = request.cookies.get(ONBOARDED_COOKIE)?.value === '1'
//   const hasVisited   = Boolean(request.cookies.get(VISITED_COOKIE)?.value)

//   const redirect = (to: string) => {
//     const url = request.nextUrl.clone()
//     url.pathname = to
//     url.search = ''
//     // Carry the intended destination so post-auth can redirect back
//     if (pathname !== '/' && !isPublic(pathname)) {
//       url.searchParams.set('next', pathname)
//     }
//     return NextResponse.redirect(url)
//   }

//   // ── 1. No session ──────────────────────────────────────────────────────────
//   if (!hasSession) {
//     // Already on a public auth page → let them through
//     if (isPublic(pathname)) return NextResponse.next()

//     // First-time visitor → /signup
//     // Returning visitor (has logged in before) → /login
//     return redirect(hasVisited ? '/login' : '/signup')
//   }

//   // ── 2. Has session, on a public auth page → bounce to app ─────────────────
//   if (hasSession && isPublic(pathname)) {
//     return redirect(isOnboarded ? '/home' : ONBOARDING)
//   }

//   // ── 3. Has session, not yet onboarded → force to /onboarding ──────────────
//   if (hasSession && !isOnboarded && !isOnboarding(pathname)) {
//     return redirect(ONBOARDING)
//   }

//   // ── 4. Has session, already onboarded, trying to re-do onboarding → /home ──
//   if (hasSession && isOnboarded && isOnboarding(pathname)) {
//     return redirect('/home')
//   }

//   // ── 5. Root / → /home ─────────────────────────────────────────────────────
//   if (pathname === '/') {
//     return redirect(hasSession && isOnboarded ? '/home' : (isOnboarding(pathname) ? ONBOARDING : (hasVisited ? '/login' : '/signup')))
//   }

//   // ── 6. All good — mark device as visited and proceed ──────────────────────
//   const res = NextResponse.next()
//   if (!hasVisited) {
//     res.cookies.set(VISITED_COOKIE, '1', {
//       ...COOKIE_OPTS,
//       maxAge: 365 * 24 * 60 * 60,
//     })
//   }
//   return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}