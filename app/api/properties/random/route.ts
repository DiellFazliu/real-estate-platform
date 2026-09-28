import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { serializeProperties } from '@/lib/utils/serialize'

export async function GET() {
  try {
    const total = await prisma.property.count({
      where: { status: 'PUBLISHED', review_status: 'APPROVED' },
    })

    if (total === 0) return NextResponse.json([])

    const skip = Math.max(0, Math.floor(Math.random() * Math.max(1, total - 3)))
    const properties = await prisma.property.findMany({
      where: { status: 'PUBLISHED', review_status: 'APPROVED' },
      orderBy: { published_at: 'desc' },
      skip,
      take: 3,
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
        featured: true,
      },
    })

    return NextResponse.json(serializeProperties(properties))
  } catch (error) {
    console.error('Error fetching random properties:', error)
    return NextResponse.json([], { status: 500 })
  }
}
