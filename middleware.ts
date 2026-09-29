// middleware.ts — role gate for dashboard routes.
//
// Only /owner, /admin, /agent are protected here; everything else
// (public pages, /account, /notifications, /properties, API routes)
// passes through untouched.
//
// Rules:
//   • Not a dashboard path  → pass
//   • Dashboard + no login  → redirect to /login with callbackUrl
//   • ADMIN                 → passes anywhere
//   • Correct role          → passes
//   • Wrong role            → redirect to that role's own dashboard

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'

// Only these prefixes have a role gate. Anything else is untouched.
const ROLE_PREFIXES: Record<string, string> = {
  '/owner': 'OWNER',
  '/admin': 'ADMIN',
  '/agent': 'AGENT',
}

function isDashboardPath(pathname: string): boolean {
  return Object.keys(ROLE_PREFIXES).some((prefix) =>
    pathname.startsWith(prefix),
  )
}

function getRequiredRole(pathname: string): string | null {
  for (const [prefix, role] of Object.entries(ROLE_PREFIXES)) {
    if (pathname.startsWith(prefix)) return role
  }
  return null
}

function getDashboardHome(role: string): string {
  if (role === 'ADMIN') return '/admin'
  if (role === 'OWNER') return '/owner'
  if (role === 'AGENT') return '/agent'
  return '/'
}

export default auth((request) => {
  const pathname = request.nextUrl.pathname
  const user = request.auth?.user

  // 1. Not a dashboard path — public, account, notifications, properties,
  //    etc. all pass through untouched.
  if (!isDashboardPath(pathname)) {
    return NextResponse.next()
  }

  // 2. Dashboard but no session — redirect to login with callbackUrl
  //    so the user lands back here after signing in.
  if (!user) {
    const callbackUrl = encodeURIComponent(pathname)
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, request.url),
    )
  }

  const role = user.role
  const requiredRole = getRequiredRole(pathname)

  // 3. Admins bypass role gates (supervisor role).
  if (role === 'ADMIN') {
    return NextResponse.next()
  }

  // Correct role for this dashboard — pass.
  if (role === requiredRole) {
    return NextResponse.next()
  }

  // 4. Wrong role — send them to their own dashboard instead of a
  //    dead-end 403. Better UX and reveals nothing about the target.
  return NextResponse.redirect(new URL(getDashboardHome(role), request.url))
})

// Skip middleware for API routes, Next.js assets, and static images.
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|avif)$).*)',
  ],
}