import { NextRequest, NextResponse } from 'next/server'
import { getMunicipalityStats } from '@/lib/analytics/municipality-data'

export const revalidate = 300 // cache 5 min

export async function GET(req: NextRequest) {
  try {
    const typeParam = req.nextUrl.searchParams.get('type')
    const listingType: 'sale' | 'rent' =
      typeParam === 'rent' ? 'rent' : 'sale'

    const stats = await getMunicipalityStats(listingType)

    return NextResponse.json({
      success: true,
      listingType,
      count: stats.length,
      data: stats,
    })
  } catch (error) {
    console.error('Municipality stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load municipality stats' },
      { status: 500 }
    )
  }
}