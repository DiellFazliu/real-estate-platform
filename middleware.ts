import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'

export default auth((request) => {
  const pathname = request.nextUrl.pathname
  const user = request.auth?.user

  // Public routes that everyone can access
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/about',
    '/contact',
    '/properties',
  ]

  // Auth routes
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/auth')
  ) {
    return NextResponse.next()
  }

  // ─────────────────────────────────────────────
  // NOT LOGGED IN
  // ─────────────────────────────────────────────

  if (!user) {
    return NextResponse.next()
  }

  const role = user.role

  // ─────────────────────────────────────────────
  // AGENT
  // ─────────────────────────────────────────────

  if (role === 'AGENT') {
    if (!pathname.startsWith('/agent')) {
      return NextResponse.redirect(
        new URL('/agent', request.url)
      )
    }

    return NextResponse.next()
  }

  // ─────────────────────────────────────────────
  // ADMIN
  // ─────────────────────────────────────────────

  if (role === 'ADMIN') {
    if (!pathname.startsWith('/admin')) {
      return NextResponse.redirect(
        new URL('/admin', request.url)
      )
    }

    return NextResponse.next()
  }

  // ─────────────────────────────────────────────
  // OWNER
  // ─────────────────────────────────────────────

  if (role === 'OWNER') {
    if (!pathname.startsWith('/owner')) {
      return NextResponse.redirect(
        new URL('/owner', request.url)
      )
    }

    return NextResponse.next()
  }

  // USER
  return NextResponse.next()

})

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}