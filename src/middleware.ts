import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Centralised auth gate for authenticated app pages.
// The per-page `redirect('/login')` calls have been removed in favour of this.
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/flow',
  '/subscribe',
  '/beneficiaries',
]

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl
  const needsAuth = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )
  if (!needsAuth) return NextResponse.next()

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })
  if (token) return NextResponse.next()

  const loginUrl = req.nextUrl.clone()
  loginUrl.pathname = '/login'
  loginUrl.search = ''
  // Preserve the requested URL so we can redirect back after login (future wiring).
  loginUrl.searchParams.set('callbackUrl', pathname + search)
  return NextResponse.redirect(loginUrl)
}

// Only run middleware on protected paths. Everything else (marketing, auth,
// api routes, static assets) skips the token check entirely.
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/flow/:path*',
    '/subscribe/:path*',
    '/beneficiaries/:path*',
  ],
}
