import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'

// ─────────────────────────────────────────────
// Dashboard prefixes — vetëm këto kanë role gate
// ─────────────────────────────────────────────

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

  // ─────────────────────────────────────────────
  // 1. Nuk është dashboard → kalon gjithkush
  //    (public, account, notifications, properties, etj.)
  // ─────────────────────────────────────────────

  if (!isDashboardPath(pathname)) {
    return NextResponse.next()
  }

  // ─────────────────────────────────────────────
  // 2. Dashboard por pa login → login
  // ─────────────────────────────────────────────

  if (!user) {
    const callbackUrl = encodeURIComponent(pathname)
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, request.url),
    )
  }

  const role = user.role
  const requiredRole = getRequiredRole(pathname)

  // ─────────────────────────────────────────────
  // 3. Ka rol → kontrollo
  // ─────────────────────────────────────────────

  // Admin kalon gjithkund në dashboards (mbikëqyrës)
  if (role === 'ADMIN') {
    return NextResponse.next()
  }

  // Roli i saktë për këtë dashboard → kalon
  if (role === requiredRole) {
    return NextResponse.next()
  }

  // ─────────────────────────────────────────────
  // 4. Rol i gabuar → ridrejto te dashboard-i i vet
  // ─────────────────────────────────────────────

  return NextResponse.redirect(
    new URL(getDashboardHome(role), request.url),
  )
})

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}