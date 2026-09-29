import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export const revalidate = 60

export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      where: {
        status: 'PUBLISHED',
        review_status: 'APPROVED',
        featured: true,
      },
      orderBy: [{ published_at: 'desc' }],
      take: 6,
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        city: true,
        neighborhood: true,
        bedrooms: true,
        bathrooms: true,
        area: true,
        primary_image_url: true,
        listing_type: true,
      },
    })

    const serialized = properties.map((p) => ({
      ...p,
      price: Number(p.price),
    }))

    return NextResponse.json(serialized, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    )
  }
}