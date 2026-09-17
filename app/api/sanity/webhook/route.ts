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

    // 5. EXTRACT METADATA
    const metadata = {
      sanity_id: body._id,
      slug: body.slug?.current || '',
      title: body.title || 'Untitled',
      price: body.price || 0,
      status: body.status || 'PUBLISHED',
      featured: body.featured || false,
      bedrooms: body.bedrooms,
      bathrooms: body.bathrooms,
      area: body.area,
      city: body.city,
      location: body.location,
      property_type: body.propertyType,
      latitude: body.latitude,
      longitude: body.longitude,
    }

    // 6. UPSERT NË POSTGRESQL
    const property = await prisma.property.upsert({
      where: { sanity_id: body._id },
      update: {
        ...metadata,
        updated_at: new Date(),
      },
      create: {
        ...metadata,
        source: body.source || 'OWNER',
        review_status: body.reviewStatus || 'APPROVED',
        published_at:
          body.status === 'PUBLISHED' ? new Date() : null,
      },
    })

    console.log('✅ Property synced:', property.id)

    // 7. REVALIDATE
    revalidatePath('/properties')
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