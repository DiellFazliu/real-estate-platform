import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Studio nuk ka layout problem sepse është jashtë grupeve
  // Middleware nuk nevojitet
  return NextResponse.next()
}

export const config = {
  matcher: [],
}