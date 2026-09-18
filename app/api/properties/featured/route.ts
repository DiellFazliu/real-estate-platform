import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      where: {
        status: 'PUBLISHED',
        review_status: 'APPROVED',
        featured: true,
      },
      orderBy: { published_at: 'desc' },
      take: 6,
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

    // ⭐ KONVERTO Decimal → number
    const serialized = properties.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      price: Number(p.price),
      price_per_m2: p.price_per_m2 ? Number(p.price_per_m2) : null,
      city: p.city,
      neighborhood: p.neighborhood,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      area: p.area,
      primary_image_url: p.primary_image_url,
      listing_type: p.listing_type,
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