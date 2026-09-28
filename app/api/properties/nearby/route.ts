import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export const revalidate = 30

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const lat = parseFloat(searchParams.get('lat') || '0')
    const lng = parseFloat(searchParams.get('lng') || '0')
    const excludeId = parseInt(searchParams.get('excludeId') || '0')
    const radius = parseFloat(searchParams.get('radius') || '5')

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Missing lat/lng' },
        { status: 400 }
      )
    }

    // Bounding box për performance
    const latDelta = radius / 111
    const lngDelta = radius / (111 * Math.cos((lat * Math.PI) / 180))

    const properties = await prisma.property.findMany({
      where: {
        id: { not: excludeId },
        status: 'PUBLISHED',
        review_status: 'APPROVED',
        latitude: {
          gte: lat - latDelta,
          lte: lat + latDelta,
        },
        longitude: {
          gte: lng - lngDelta,
          lte: lng + lngDelta,
        },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        price_per_m2: true,
        area: true,
        bedrooms: true,
        bathrooms: true,
        latitude: true,
        longitude: true,
        neighborhood: true,
        city: true,
        primary_image_url: true,
        listing_type: true,
      },
      take: 100,
    })

    // Konverto Decimal → number dhe filtro me distancë
    const propertiesWithDistance = properties
      .map((p) => {
        if (!p.latitude || !p.longitude) return null

        const pLat = Number(p.latitude)
        const pLng = Number(p.longitude)

        // Haversine distance
        const R = 6371
        const dLat = ((pLat - lat) * Math.PI) / 180
        const dLng = ((pLng - lng) * Math.PI) / 180
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat * Math.PI) / 180) *
            Math.cos((pLat * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        const distance = R * c

        if (distance > radius) return null

        return {
          id: p.id,
          slug: p.slug,
          title: p.title,
          price: Number(p.price),
          price_per_m2: p.price_per_m2 ? Number(p.price_per_m2) : null,
          area: p.area,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          latitude: pLat,
          longitude: pLng,
          neighborhood: p.neighborhood,
          city: p.city,
          primary_image_url: p.primary_image_url,
          listing_type: p.listing_type,
          distance: Math.round(distance * 10) / 10,
        }
      })
      .filter((p) => p !== null)
      .sort((a, b) => a!.distance - b!.distance)

    return NextResponse.json(propertiesWithDistance)
  } catch (error) {
    console.error('Nearby properties error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}