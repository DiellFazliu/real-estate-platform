import { NextRequest, NextResponse } from 'next/server'
import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook'
import { prisma } from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'
import { generatePropertyIntelligence } from '@/lib/intelligence/generate'

// ═══════════════════════════════════════════════════════════════
// BACKGROUND JOB - Generate Intelligence
// ═══════════════════════════════════════════════════════════════

async function runIntelligenceJob(propertyId: number, title: string) {
  try {
    console.log(`🧠 [BACKGROUND] Starting intelligence for #${propertyId}`)
    const startTime = Date.now()

    await generatePropertyIntelligence(propertyId)

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`✅ [BACKGROUND] Intelligence ready for "${title}" in ${elapsed}s`)

    // Revalidate faqen e pronës pasi intelligence është gati
    revalidatePath(`/properties/${title}`)
  } catch (error: any) {
    console.error(`❌ [BACKGROUND] Intelligence failed for #${propertyId}:`, error.message)
    // Nuk hedhim error - webhook duhet të kthejë success
    // Intelligence do të riprovohet nga cron job në të ardhmen
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN WEBHOOK HANDLER
// ═══════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  try {
    // 1. VERIFY SIGNATURE
    const webhookSecret = process.env.SANITY_WEBHOOK_SECRET
    const rawBody = await req.text()
    const signature = req.headers.get(SIGNATURE_HEADER_NAME)
    const validSignature = Boolean(
      webhookSecret &&
        signature &&
        (await isValidSignature(rawBody, signature, webhookSecret)),
    )

    if (!validSignature) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. PARSE BODY
    const body = JSON.parse(rawBody)
    console.log('📥 Sanity webhook:', body._type, body._id)
    // ═══════════════════════════════════════════════════════════════
// HANDLE HERO SLIDE
// ═══════════════════════════════════════════════════════════════

if (body._type === 'heroSlide') {
  // Handle delete
  if (body._action === 'delete') {
    await prisma.heroSlide.deleteMany({
      where: { sanity_id: body._id },
    })
    revalidatePath('/')
    return NextResponse.json({ success: true, action: 'deleted' })
  }

  // Find property by sanity_id
  let property_id: number | null = null
  if (body.property?._ref) {
    const property = await prisma.property.findUnique({
      where: { sanity_id: body.property._ref },
      select: { id: true },
    })
    if (property) property_id = property.id
  }

  // Extract metadata
  const slideMetadata = {
    sanity_id: body._id,
    slug: body.slug?.current || null,
    title: body.title || 'Untitled',
    subtitle: body.subtitle || null,
    price: body.price || null,
    description: body.description || null,
    badge: body.badge || null,
    image_url: body.imageUrl || null,
    property_id,
    custom_url: body.customUrl || null,
    order: body.order || 0,
    is_active: body.isActive !== false,
    source: 'SANITY',
  }

  // Upsert
  const slide = await prisma.heroSlide.upsert({
    where: { sanity_id: body._id },
    update: {
      ...slideMetadata,
      updated_at: new Date(),
    },
    create: slideMetadata,
  })

  console.log('✅ Hero slide synced:', slide.id)
  revalidatePath('/')

  return NextResponse.json({
    success: true,
    hero_slide_id: slide.id,
  })
}


    // 3. HANDLE VETËM PËR PROPERTY
    if (body._type !== 'property') {
      return NextResponse.json({ message: 'Ignored - not a property' })
    }

    // 4. HANDLE DELETE
    if (body._action === 'delete') {
      await prisma.property.updateMany({
        where: { sanity_id: body._id },
        data: { status: 'ARCHIVED' },
      })
      revalidatePath('/properties')
      return NextResponse.json({ success: true, action: 'archived' })
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
    const existingProperty = await prisma.property.findUnique({
      where: { sanity_id: body._id },
      select: { id: true },
    })

    const property = await prisma.property.upsert({
      where: { sanity_id: body._id },
      update: {
        // Prisma owns workflow, ownership, and review fields.
        ...(({ status, review_status, source, listed_by_id, ...content }) => content)(metadata),
        updated_at: new Date(),
      },
      create: {
        ...metadata,
        published_at: body.status === 'PUBLISHED' ? new Date() : null,
      },
    })

    console.log('✅ Property synced:', property.id)

    // ═══════════════════════════════════════════════════════════
    // 8. BACKGROUND JOB - Intelligence Generation
    // ═══════════════════════════════════════════════════════════
    // NUK e presim (fire-and-forget)
    // Webhook kthen përgjigje menjëherë
    // Intelligence generohet në background

    if (property.status === 'PUBLISHED' && property.review_status === 'APPROVED') {
      runIntelligenceJob(property.id, property.title).catch((err) => {
        console.error('Background job error:', err)
      })
    }

    // 9. REVALIDATE
    revalidatePath('/properties')
    revalidatePath('/account/listings')
    revalidatePath('/owner/properties/pending')

    if (existingProperty) {
      revalidatePath(`/properties/${body.slug?.current || metadata.slug}`)
    }

    if (body.slug?.current) {
      revalidatePath(`/properties/${body.slug.current}`)
    }

    // 10. KTHE PËRGJIGJE MENJËHERË (pa pritur intelligence)
    return NextResponse.json({
      success: true,
      property_id: property.id,
      intelligence: 'generating_in_background',
    })
  } catch (error) {
    console.error('❌ Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}