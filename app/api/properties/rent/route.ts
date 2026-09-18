import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { serializeProperties } from '@/lib/utils/serialize'  // ⭐ IMPORT

export async function GET() {
  try {
    const dbProperties = await prisma.property.findMany({
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
        price_per_m2: true,
        city: true,
        neighborhood: true,
        bedrooms: true,
        bathrooms: true,
        area: true,
        primary_image_url: true,
        listing_type: true,
      },
    })

    // ⭐ KONVERTO
    const properties = serializeProperties(dbProperties)

    return NextResponse.json(properties)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    )
  }
}