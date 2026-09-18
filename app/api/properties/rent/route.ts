import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      where: {
        status: 'PUBLISHED',
        review_status: 'APPROVED',
        listing_type: 'rent',
      },
      orderBy: [{ featured: 'desc' }, { published_at: 'desc' }],
      take: 12,
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

    return NextResponse.json(serialized)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    )
  }
}