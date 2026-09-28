import { NextRequest, NextResponse } from 'next/server'
import { parseQuery } from '@/lib/nlp/hybrid-parser'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown'
    const rateCheck = checkRateLimit(`ai-search:${clientIp}`, 30, 60 * 1000)

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many search requests' },
        { status: 429 }
      )
    }

    const body = await req.json()
    const { query } = body

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    if (query.length > 500) {
      return NextResponse.json(
        { error: 'Query too long (max 500 chars)' },
        { status: 400 }
      )
    }

    const parsed = await parseQuery(query)

    return NextResponse.json({ parsed })
  } catch (error: any) {
    console.error('[AI Search] Error:', error)
    return NextResponse.json(
      { error: 'Search failed', message: error.message },
      { status: 500 }
    )
  }
}