import { NextRequest, NextResponse } from 'next/server'
import { searchProperties } from '@/lib/nlp/search-service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { query, page, limit, sortBy } = body

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

    const result = await searchProperties(query, { page, limit, sortBy })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[AI Search] Error:', error)
    return NextResponse.json(
      { error: 'Search failed', message: error.message },
      { status: 500 }
    )
  }
}