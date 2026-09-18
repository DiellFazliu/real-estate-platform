import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'

export async function POST(req: NextRequest) {
  try {
    // 1. VERIFY SECRET
    const secret = req.headers.get('x-sanity-webhook-secret')
    if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. PARSE BODY
    const body = await req.json()
    console.log('📥 Sanity webhook:', body._type, body._id)

    // 3. HANDLE VETËM PËR PROPERTY
    if (body._type !== 'property') {
      return NextResponse.json({ message: 'Ignored - not a property' })
    }

    // 4. HANDLE DELETE
    if (body._action === 'delete') {
      await prisma.property.deleteMany({
        where: { sanity_id: body._id },
      })
      revalidatePath('/properties')
      return NextResponse.json({ success: true, action: 'deleted' })
    }

    // 5. LOOKUP USER BY EMAIL (për listed_by_id)
    let listed_by_id: number | null = null

    if (body.listedBy) {
      const user = await prisma.user.findUnique({
        where: { email: body.listedBy },
        select: { id: true },
      })

      if (user) {
        listed_by_id = user.id
      }
    }

    // 6. EXTRACT METADATA
    const metadata = {
      sanity_id: body._id,
      slug: body.slug?.current || '',
      title: body.title || 'Untitled',
      price: body.price || 0,
      price_per_m2: body.pricePerM2 || null,
      status: body.status || 'PUBLISHED',
      featured: body.featured || false,
      listing_type: body.listingType || 'sale',

      // LOCATION
      location: body.location || null,
      neighborhood: body.neighborhood || null,
      city: body.city || null,
      postal_code: body.postalCode || null,
      latitude: body.latitude || null,
      longitude: body.longitude || null,
      distance_from_center: body.distanceFromCenter || null,

      // CHARACTERISTICS
      property_type: body.propertyType || null,
      bedrooms: body.bedrooms || null,
      bathrooms: body.bathrooms || null,
      area: body.area || null,
      balconies: body.balconies || 0,
      floor: body.floor || null,
      total_floors: body.totalFloors || null,
      year_built: body.yearBuilt || null,
      renovation_year: body.renovationYear || null,
      condition: body.condition || null,
      orientation: body.orientation || null,
      furnished: body.furnished || null,

      // FEATURES
      has_elevator: body.hasElevator || false,
      has_parking: body.hasParking || false,
      has_garden: body.hasGarden || false,
      has_pool: body.hasPool || false,
      has_air_conditioning: body.hasAirConditioning || false,
      has_heating: body.hasHeating || false,
      has_security: body.hasSecurity || false,
      has_internet: body.hasInternet || false,
      features: body.features || [],
      energy_class: body.energyClass || null,

      // SOURCE & REVIEW
      source: body.source || 'OWNER',
      review_status: body.reviewStatus || 'APPROVED',

      // LISTED BY (ID, jo email)
      listed_by_id: listed_by_id,
    }

    // 7. UPSERT NË POSTGRESQL
    const property = await prisma.property.upsert({
      where: { sanity_id: body._id },
      update: {
        ...metadata,
        updated_at: new Date(),
      },
      create: {
        ...metadata,
        published_at: body.status === 'PUBLISHED' ? new Date() : null,
      },
    })

    console.log('✅ Property synced:', property.id)

    // 8. REVALIDATE
    revalidatePath('/properties')
    revalidatePath('/account/listings')
    revalidatePath('/owner/properties/pending')

    if (body.slug?.current) {
      revalidatePath(`/properties/${body.slug.current}`)
    }

    return NextResponse.json({
      success: true,
      property_id: property.id,
    })
  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}