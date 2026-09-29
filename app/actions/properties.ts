'use server'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { writeClient } from '@/lib/sanity/write-client'
import { propertySubmitSchema } from '@/lib/validation/property'
import { checkRateLimit } from '@/lib/rate-limit'
import { revalidatePath } from 'next/cache'
import { inngest } from '@/inngest/client'

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80)
}

function readPropertyFormData(formData: FormData) {
  return {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    price: Number(formData.get('price')),
    location: formData.get('location') as string,
    city: formData.get('city') as string,
    neighborhood: formData.get('neighborhood') as string,
    postalCode: (formData.get('postalCode') as string) || undefined,
    propertyType: formData.get('propertyType') as string,
    listingType: formData.get('listingType') as string,
    bedrooms: formData.get('bedrooms')
      ? Number(formData.get('bedrooms'))
      : undefined,
    bathrooms: formData.get('bathrooms')
      ? Number(formData.get('bathrooms'))
      : undefined,
    area: formData.get('area') ? Number(formData.get('area')) : undefined,
    balconies: formData.get('balconies')
      ? Number(formData.get('balconies'))
      : 0,
    floor: formData.get('floor') ? Number(formData.get('floor')) : undefined,
    totalFloors: formData.get('totalFloors')
      ? Number(formData.get('totalFloors'))
      : undefined,
    yearBuilt: formData.get('yearBuilt')
      ? Number(formData.get('yearBuilt'))
      : undefined,
    renovationYear: formData.get('renovationYear')
      ? Number(formData.get('renovationYear'))
      : undefined,
    condition: (formData.get('condition') as string) || 'good',
    orientation: (formData.get('orientation') as string) || undefined,
    furnished: (formData.get('furnished') as string) || 'unfurnished',
    energyClass: (formData.get('energyClass') as string) || undefined,
    distanceFromCenter: formData.get('distanceFromCenter')
      ? Number(formData.get('distanceFromCenter'))
      : undefined,

    hasElevator: formData.get('hasElevator') === 'on',
    hasParking: formData.get('hasParking') === 'on',
    hasGarden: formData.get('hasGarden') === 'on',
    hasPool: formData.get('hasPool') === 'on',
    hasAirConditioning: formData.get('hasAirConditioning') === 'on',
    hasHeating: formData.get('hasHeating') === 'on',
    hasSecurity: formData.get('hasSecurity') === 'on',
    hasInternet: formData.get('hasInternet') === 'on',

    latitude: Number(formData.get('latitude')),
    longitude: Number(formData.get('longitude')),
    images: JSON.parse((formData.get('images') as string) || '[]'),
    features: formData.getAll('features') as string[],
    contactPhone: formData.get('contactPhone') as string,
    contactEmail: formData.get('contactEmail') as string,
  }
}

// ═══════════════════════════════════════════════════════════════
// QUEUE INTELLIGENCE (BACKGROUND)
// ═══════════════════════════════════════════════════════════════

async function queueIntelligenceGeneration(
  propertyId: number,
  options: {
    priority?: 'high' | 'normal' | 'low'
    invalidateNearby?: boolean
  } = {}
) {
  const { priority = 'normal', invalidateNearby = false } = options

  try {
    await inngest.send({
      name: 'property/intelligence.requested',
      data: {
        propertyId,
        priority,
        invalidateNearby,
      },
    })
    console.log(`📤 Queued intelligence for property ${propertyId} (${priority})`)
  } catch (error) {
    console.error('Failed to queue intelligence:', error)
    // Nuk bllokon operacionin kryesor
  }
}

// ═══════════════════════════════════════════════════════════════
// SUBMIT PROPERTY (create new listing)
// ═══════════════════════════════════════════════════════════════

export async function submitProperty(formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Duhet të jesh i loguar' }
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(session.user.id) },
      select: {
        is_seller: true,
        seller_verified: true,
        email: true,
        name: true,
      },
    })

    if (!user?.is_seller || !user?.seller_verified) {
      return { success: false, error: 'Duhet të jesh SELLER i verifikuar' }
    }

    const rateCheck = checkRateLimit(session.user.id, 3)
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: 'Keni arritur limitin e 3 listimeve në 24 orë',
      }
    }

    const rawData = readPropertyFormData(formData)
    const parsed = propertySubmitSchema.safeParse(rawData)

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      const firstError =
        Object.values(fieldErrors)[0]?.[0] || 'Të dhëna të pavlefshme'
      return { success: false, error: firstError, details: fieldErrors }
    }

    const data = parsed.data

    const existing = await prisma.property.findFirst({
      where: {
        listed_by_id: parseInt(session.user.id),
        title: { equals: data.title, mode: 'insensitive' },
        city: data.city,
      },
    })

    if (existing) {
      return {
        success: false,
        error: 'Keni tashmë një listim të ngjashëm',
      }
    }

    const slug = generateSlug(data.title) + '-' + Date.now()
    const pricePerM2 = data.area ? data.price / data.area : undefined

    // ═══════════════════════════════════════════════════════════
    // 1. CREATE IN SANITY
    // ═══════════════════════════════════════════════════════════
    let sanityProperty
    try {
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(2, 10)
      const sanityId = `property-${timestamp}-${randomStr}`

      sanityProperty = await writeClient.create({
        _id: sanityId,
        _type: 'property',
        title: data.title,
        slug: { current: slug },
        description: data.description,
        price: data.price,
        pricePerM2,
        status: 'DRAFT',
        reviewStatus: 'PENDING_REVIEW',
        source: 'USER',
        listedBy: user.email,
        listingType: data.listingType,
        propertyType: data.propertyType,

        location: data.location,
        city: data.city,
        neighborhood: data.neighborhood,
        postalCode: data.postalCode,
        latitude: data.latitude,
        longitude: data.longitude,
        distanceFromCenter: data.distanceFromCenter,

        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        area: data.area,
        balconies: data.balconies,
        floor: data.floor,
        totalFloors: data.totalFloors,
        yearBuilt: data.yearBuilt,
        renovationYear: data.renovationYear,
        condition: data.condition,
        orientation: data.orientation,
        furnished: data.furnished,
        energyClass: data.energyClass,

        hasElevator: data.hasElevator,
        hasParking: data.hasParking,
        hasGarden: data.hasGarden,
        hasPool: data.hasPool,
        hasAirConditioning: data.hasAirConditioning,
        hasHeating: data.hasHeating,
        hasSecurity: data.hasSecurity,
        hasInternet: data.hasInternet,
        features: data.features,

        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,

        images: data.images.map((id: string, index: number) => ({
          _type: 'image',
          _key: `img-${index}-${timestamp}-${Math.random().toString(36).substring(2, 8)}`,
          asset: { _type: 'reference', _ref: id },
        })),

        featured: false,
      })
    } catch (error) {
      console.error('Sanity create error:', error)
      return { success: false, error: 'Gabim gjatë ruajtjes në CMS' }
    }

    // ═══════════════════════════════════════════════════════════
    // 2. CREATE IN POSTGRESQL
    // ═══════════════════════════════════════════════════════════
    const dbProperty = await prisma.property.create({
      data: {
        sanity_id: sanityProperty._id,
        slug,
        title: data.title,
        price: data.price,
        price_per_m2: pricePerM2,
        status: 'DRAFT',
        review_status: 'PENDING_REVIEW',
        source: 'USER',
        listing_type: data.listingType,
        listed_by_id: parseInt(session.user.id),

        location: data.location,
        city: data.city,
        neighborhood: data.neighborhood,
        postal_code: data.postalCode,
        latitude: data.latitude,
        longitude: data.longitude,
        distance_from_center: data.distanceFromCenter,

        property_type: data.propertyType,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        area: data.area,
        balconies: data.balconies || 0,
        floor: data.floor,
        total_floors: data.totalFloors,
        year_built: data.yearBuilt,
        renovation_year: data.renovationYear,
        condition: data.condition,
        orientation: data.orientation,
        furnished: data.furnished,
        energy_class: data.energyClass,

        has_elevator: data.hasElevator,
        has_parking: data.hasParking,
        has_garden: data.hasGarden,
        has_pool: data.hasPool,
        has_air_conditioning: data.hasAirConditioning,
        has_heating: data.hasHeating,
        has_security: data.hasSecurity,
        has_internet: data.hasInternet,
        features: data.features,
      },
    })

    // ═══════════════════════════════════════════════════════════
    // 3. NOTIFY OWNERS
    // ═══════════════════════════════════════════════════════════
    const owners = await prisma.user.findMany({
      where: { role: { name: { in: ['OWNER', 'ADMIN'] } } },
      select: { id: true },
    })

    for (const owner of owners) {
      await prisma.notification.create({
        data: {
          user_id: owner.id,
          type: 'property_pending_review',
          title: 'Pronë e re për review',
          message: `${user.name} listoi "${data.title}" në ${data.neighborhood || data.city}`,
          link: '/owner/properties/pending',
        },
      })
    }

    // ═══════════════════════════════════════════════════════════
    // 4. ⭐ NO INTELLIGENCE QUEUE HERE
    // ═══════════════════════════════════════════════════════════
    // Property is DRAFT + PENDING_REVIEW — no published comparables exist yet,
    // and the property may be rejected. Intelligence is queued on APPROVAL
    // in reviewProperty() instead. This avoids wasting Groq calls on drafts.

    // ═══════════════════════════════════════════════════════════
    // 5. REVALIDATE
    // ═══════════════════════════════════════════════════════════
    revalidatePath('/properties')
    revalidatePath('/account/listings')
    revalidatePath('/owner/properties/pending')

    return {
      success: true,
      message: 'Prona u dërgua për review. Do të njoftoheni kur të aprovohet.',
      propertyId: dbProperty.id,
    }
  } catch (error) {
    console.error('Submit error:', error)
    return { success: false, error: 'Gabim i brendshëm' }
  }
}

// ═══════════════════════════════════════════════════════════════
// UPDATE PROPERTY (edit listing, resets review state)
// ═══════════════════════════════════════════════════════════════

export async function updateProperty(formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Duhet të jesh i loguar' }
    }

    const userId = parseInt(session.user.id)

    const propertyId = Number(formData.get('propertyId'))
    if (!Number.isSafeInteger(propertyId) || propertyId <= 0) {
      return { success: false, error: 'Prona nuk është e vlefshme' }
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        sanity_id: true,
        slug: true,
        title: true,
        listed_by_id: true,
        review_status: true,
        city: true,
        neighborhood: true,
        property_type: true,
        listing_type: true,
      },
    })

    if (!property) {
      return { success: false, error: 'Prona nuk u gjet' }
    }

    const isOwnerOrAdmin =
      session.user.role === 'ADMIN' || session.user.role === 'OWNER'

    if (!isOwnerOrAdmin && property.listed_by_id !== userId) {
      return { success: false, error: 'Nuk ke leje për të edituar këtë pronë' }
    }

    if (property.review_status === 'PENDING_REVIEW' && !isOwnerOrAdmin) {
      return {
        success: false,
        error:
          'Kjo pronë është në pritje për review. Nuk mund të bësh ndryshime derisa review-i të përfundojë.',
      }
    }

    const rawData = readPropertyFormData(formData)
    const parsed = propertySubmitSchema.safeParse(rawData)

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      const firstError =
        Object.values(fieldErrors)[0]?.[0] || 'Të dhëna të pavlefshme'
      return { success: false, error: firstError, details: fieldErrors }
    }

    const data = parsed.data
    const pricePerM2 = data.area ? data.price / data.area : undefined

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    })

    // ═══════════════════════════════════════════════════════════
    // 1. UPDATE IN SANITY
    // ═══════════════════════════════════════════════════════════
    try {
      await writeClient
        .patch(property.sanity_id)
        .set({
          title: data.title,
          description: data.description,
          price: data.price,
          pricePerM2,
          listingType: data.listingType,
          propertyType: data.propertyType,
          location: data.location,
          city: data.city,
          neighborhood: data.neighborhood,
          postalCode: data.postalCode,
          latitude: data.latitude,
          longitude: data.longitude,
          distanceFromCenter: data.distanceFromCenter,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          area: data.area,
          balconies: data.balconies,
          floor: data.floor,
          totalFloors: data.totalFloors,
          yearBuilt: data.yearBuilt,
          renovationYear: data.renovationYear,
          condition: data.condition,
          orientation: data.orientation,
          furnished: data.furnished,
          energyClass: data.energyClass,
          hasElevator: data.hasElevator,
          hasParking: data.hasParking,
          hasGarden: data.hasGarden,
          hasPool: data.hasPool,
          hasAirConditioning: data.hasAirConditioning,
          hasHeating: data.hasHeating,
          hasSecurity: data.hasSecurity,
          hasInternet: data.hasInternet,
          features: data.features,
          contactPhone: data.contactPhone,
          contactEmail: data.contactEmail,
          images: data.images.map((id: string, index: number) => ({
            _type: 'image',
            _key: `img-${index}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
            asset: { _type: 'reference', _ref: id },
          })),
          status: 'DRAFT',
          reviewStatus: 'PENDING_REVIEW',
        })
        .unset(['rejectionReason'])
        .commit()
    } catch (error) {
      console.error('Sanity update error:', error)
      return { success: false, error: 'Gabim gjatë ruajtjes në CMS' }
    }

    // ═══════════════════════════════════════════════════════════
    // 2. UPDATE IN POSTGRESQL (TRANSACTION)
    // ═══════════════════════════════════════════════════════════
    await prisma.$transaction(async (tx) => {
      await tx.property.update({
        where: { id: propertyId },
        data: {
          title: data.title,
          price: data.price,
          price_per_m2: pricePerM2,
          listing_type: data.listingType,
          property_type: data.propertyType,
          location: data.location,
          city: data.city,
          neighborhood: data.neighborhood,
          postal_code: data.postalCode,
          latitude: data.latitude,
          longitude: data.longitude,
          distance_from_center: data.distanceFromCenter,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          area: data.area,
          balconies: data.balconies || 0,
          floor: data.floor,
          total_floors: data.totalFloors,
          year_built: data.yearBuilt,
          renovation_year: data.renovationYear,
          condition: data.condition,
          orientation: data.orientation,
          furnished: data.furnished,
          energy_class: data.energyClass,
          has_elevator: data.hasElevator,
          has_parking: data.hasParking,
          has_garden: data.hasGarden,
          has_pool: data.hasPool,
          has_air_conditioning: data.hasAirConditioning,
          has_heating: data.hasHeating,
          has_security: data.hasSecurity,
          has_internet: data.hasInternet,
          features: data.features,

          review_status: 'PENDING_REVIEW',
          status: 'DRAFT',
          rejection_reason: null,
          reviewed_by_id: null,
          reviewed_at: null,
          published_at: null,
        },
      })

      // ⭐ FIX #2: Delete stale intelligence — price/location may have changed
      await tx.propertyIntelligence.deleteMany({
        where: { property_id: propertyId },
      })

      const owners = await tx.user.findMany({
        where: { role: { name: { in: ['OWNER', 'ADMIN'] } } },
        select: { id: true },
      })

      for (const owner of owners) {
        if (owner.id === userId) continue

        await tx.notification.create({
          data: {
            user_id: owner.id,
            type: 'property_pending_review',
            title: 'Pronë e edituar për review',
            message: `${user?.name || user?.email || 'Përdoruesi'} editoi "${property.title}" dhe e ridërgoi për review.`,
            link: '/owner/properties/pending',
          },
        })
      }

      await tx.notification.create({
        data: {
          user_id: userId,
          type: 'property_resubmitted',
          title: 'Prona u ridërgua për review',
          message: `Ndryshimet në "${data.title}" u ruajtën dhe prona është në pritje për review.`,
          link: '/account/listings',
        },
      })

      await tx.auditLog.create({
        data: {
          user_id: userId,
          action: 'update_property',
          resource: 'property',
          resource_id: String(propertyId),
          old_values: {
            review_status: property.review_status,
            title: property.title,
          },
          new_values: {
            review_status: 'PENDING_REVIEW',
            title: data.title,
          },
        },
      })
    })

    // ═══════════════════════════════════════════════════════════
    // 3. REVALIDATE
    // ═══════════════════════════════════════════════════════════
    revalidatePath('/account/listings')
    revalidatePath('/properties')
    revalidatePath(`/properties/${property.slug}`)
    revalidatePath('/owner/properties/pending')
    revalidatePath('/admin/reviews')

    return {
      success: true,
      message: 'Ndryshimet u ruajtën. Prona është ridërguar për review.',
      propertyId,
    }
  } catch (error) {
    console.error('Update property error:', error)
    return { success: false, error: 'Gabim i brendshëm' }
  }
}

// ═══════════════════════════════════════════════════════════════
// REVIEW PROPERTY (approve / reject)
// ═══════════════════════════════════════════════════════════════

export async function reviewProperty(formData: FormData) {
  const session = await auth()

  const canReview =
    session?.user?.role === 'ADMIN' ||
    (session?.user?.role === 'OWNER' &&
      session.user.permissions?.includes('properties:review'))

  if (!session?.user || !canReview) {
    return { success: false, error: 'Nuk keni leje për të rishikuar prona.' }
  }

  const propertyId = Number(formData.get('propertyId'))
  const decision = formData.get('decision')
  const rejectionReason = String(formData.get('rejectionReason') || '').trim()
  const agentIdRaw = formData.get('agentId')
  const agentId = agentIdRaw ? Number(agentIdRaw) : 0

  if (!Number.isSafeInteger(propertyId) || propertyId <= 0) {
    return { success: false, error: 'Prona nuk është e vlefshme.' }
  }

  if (decision !== 'APPROVED' && decision !== 'REJECTED') {
    return { success: false, error: 'Vendimi i review nuk është i vlefshëm.' }
  }

  if (
    decision === 'REJECTED' &&
    (rejectionReason.length < 10 || rejectionReason.length > 1000)
  ) {
    return {
      success: false,
      error: 'Arsyeja e refuzimit duhet të ketë nga 10 deri në 1000 karaktere.',
    }
  }

  if (decision === 'APPROVED') {
    if (!Number.isSafeInteger(agentId) || agentId <= 0) {
      return {
        success: false,
        error: 'Zgjidhni një agjent përpara se të aprovohet prona.',
      }
    }
  }

  const property = await prisma.property.findFirst({
    where: { id: propertyId, review_status: 'PENDING_REVIEW' },
    select: {
      id: true,
      sanity_id: true,
      title: true,
      slug: true,
      listed_by_id: true,
      city: true,
      neighborhood: true,
      property_type: true,
      listing_type: true,
    },
  })

  if (!property) {
    return {
      success: false,
      error: 'Kjo pronë nuk është më në pritje për review.',
    }
  }

  let agent: { id: number; name: string | null; email: string } | null = null

  if (decision === 'APPROVED') {
    agent = await prisma.user.findFirst({
      where: {
        id: agentId,
        is_active: true,
        role: { name: 'AGENT' },
      },
      select: { id: true, name: true, email: true },
    })

    if (!agent) {
      return {
        success: false,
        error: 'Agjenti i zgjedhur nuk është i vlefshëm ose nuk është aktiv.',
      }
    }
  }

  const approved = decision === 'APPROVED'
  const reviewerId = Number(session.user.id)

  if (!Number.isSafeInteger(reviewerId) || reviewerId <= 0) {
    return { success: false, error: 'Sesioni i përdoruesit nuk është i vlefshëm.' }
  }

  // ═════════════════════════════════════════════════════════════
  // 1. POSTGRES TRANSACTION (source of truth)
  // ═════════════════════════════════════════════════════════════
  try {
    await prisma.$transaction(async (tx) => {
      const updated = await tx.property.updateMany({
        where: { id: property.id, review_status: 'PENDING_REVIEW' },
        data: {
          review_status: decision,
          status: approved ? 'PUBLISHED' : 'DRAFT',
          reviewed_by_id: reviewerId,
          reviewed_at: new Date(),
          rejection_reason: approved ? null : rejectionReason,
          published_at: approved ? new Date() : null,
          ...(approved && agent ? { primary_agent_id: agent.id } : {}),
        },
      })

      if (updated.count !== 1) {
        throw new Error('Property has already been reviewed')
      }

      // ⭐ FIX #3: On rejection, delete stale intelligence
      if (!approved) {
        await tx.propertyIntelligence.deleteMany({
          where: { property_id: property.id },
        })
      }

      if (approved && agent) {
        await tx.propertyAgent.updateMany({
          where: {
            property_id: property.id,
            agent_id: { not: agent.id },
          },
          data: { is_primary: false },
        })

        await tx.propertyAgent.upsert({
          where: {
            property_id_agent_id: {
              property_id: property.id,
              agent_id: agent.id,
            },
          },
          update: {
            is_primary: true,
            status: 'ACTIVE',
            assigned_by: reviewerId,
          },
          create: {
            property_id: property.id,
            agent_id: agent.id,
            assigned_by: reviewerId,
            is_primary: true,
            status: 'ACTIVE',
          },
        })

        await tx.notification.create({
          data: {
            user_id: agent.id,
            type: 'property_assigned',
            title: 'Pronë e re e caktuar',
            message: `Ju është caktuar prona "${property.title}".`,
            link: '/agent/my-properties',
          },
        })
      }

      if (property.listed_by_id) {
        await tx.notification.create({
          data: {
            user_id: property.listed_by_id,
            type: approved ? 'property_approved' : 'property_rejected',
            title: approved ? 'Prona u aprovua' : 'Prona u refuzua',
            message: approved
              ? `Prona juaj "${property.title}" u aprovua dhe tani është publike.`
              : `Prona juaj "${property.title}" u refuzua. Arsyeja: ${rejectionReason}`,
            link: '/account/listings',
          },
        })
      }

      await tx.auditLog.create({
        data: {
          user_id: reviewerId,
          action: approved ? 'approve' : 'reject',
          resource: 'property',
          resource_id: String(property.id),
          new_values: {
            review_status: decision,
            rejection_reason: approved ? null : rejectionReason,
            ...(approved && agent
              ? { agent_id: agent.id, agent_email: agent.email }
              : {}),
          },
        },
      })
    })
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'Property has already been reviewed'
    ) {
      return {
        success: false,
        error: 'Kjo pronë është rishikuar tashmë.',
      }
    }

    console.error('Property review (Prisma) error:', error)
    return {
      success: false,
      error: 'Review nuk u ruajt. Ju lutemi provoni përsëri.',
    }
  }

  // ═════════════════════════════════════════════════════════════
  // 2. SANITY SYNC (best-effort — mos blloko nëse dështon)
  // ═════════════════════════════════════════════════════════════
  try {
    const sanityPatch = writeClient.patch(property.sanity_id).set({
      reviewStatus: decision,
      status: approved ? 'PUBLISHED' : 'DRAFT',
    })

    if (approved) {
      sanityPatch.unset(['rejectionReason'])
    } else {
      sanityPatch.set({ rejectionReason })
    }

    await sanityPatch.commit()
  } catch (error) {
    console.error(
      `Sanity sync failed for property ${property.id} — DB is correct, CMS is out of sync:`,
      error,
    )
  }

  // ═════════════════════════════════════════════════════════════
  // 3. QUEUE INTELLIGENCE (VETËM NËSE APROVOHET)
  // ═════════════════════════════════════════════════════════════
  if (approved) {
    await queueIntelligenceGeneration(property.id, {
      priority: 'high',
      invalidateNearby: true,
    })
  }

  // ═════════════════════════════════════════════════════════════
  // 4. REVALIDATE
  // ═════════════════════════════════════════════════════════════
  revalidatePath('/owner/properties/pending')
  revalidatePath('/owner')
  revalidatePath('/admin')
  revalidatePath('/admin/reviews')
  revalidatePath('/account/listings')
  revalidatePath('/properties')
  revalidatePath(`/properties/${property.slug}`)
  revalidatePath('/agent/my-properties')

  return {
    success: true,
    message: approved
      ? `Prona u aprovua dhe ${agent?.name || agent?.email} u caktua si agjent.`
      : 'Prona u refuzua dhe shitësi u njoftua.',
  }
}

// ═══════════════════════════════════════════════════════════════
// ASSIGN PROPERTY AGENT (standalone, kept for backwards compat)
// ═══════════════════════════════════════════════════════════════

export async function assignPropertyAgent(formData: FormData) {
  const session = await auth()
  const canAssign =
    session?.user?.role === 'ADMIN' ||
    (session?.user?.role === 'OWNER' &&
      session.user.permissions?.includes('properties:assign'))

  if (!session?.user || !canAssign) {
    return { success: false, error: 'Nuk keni leje për të caktuar agjentë.' }
  }

  const propertyId = Number(formData.get('propertyId'))
  const agentId = Number(formData.get('agentId'))
  const assignerId = Number(session.user.id)

  if (
    ![propertyId, agentId, assignerId].every(
      (value) => Number.isSafeInteger(value) && value > 0,
    )
  ) {
    return { success: false, error: 'Prona ose agjenti nuk është i vlefshëm.' }
  }

  const [property, agent] = await Promise.all([
    prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true, title: true },
    }),
    prisma.user.findFirst({
      where: { id: agentId, is_active: true, role: { name: 'AGENT' } },
      select: { id: true, name: true, email: true },
    }),
  ])

  if (!property) return { success: false, error: 'Prona nuk u gjet.' }
  if (!agent) return { success: false, error: 'Zgjidhni një agjent aktiv.' }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.propertyAgent.updateMany({
        where: { property_id: propertyId },
        data: { is_primary: false },
      })

      await tx.propertyAgent.upsert({
        where: {
          property_id_agent_id: { property_id: propertyId, agent_id: agentId },
        },
        update: { is_primary: true, status: 'ACTIVE', assigned_by: assignerId },
        create: {
          property_id: propertyId,
          agent_id: agentId,
          assigned_by: assignerId,
          is_primary: true,
          status: 'ACTIVE',
        },
      })

      await tx.property.update({
        where: { id: propertyId },
        data: { primary_agent_id: agentId },
      })

      await tx.notification.create({
        data: {
          user_id: agent.id,
          type: 'property_assigned',
          title: 'Pronë e re e caktuar',
          message: `Ju është caktuar prona "${property.title}".`,
          link: '/agent/my-properties',
        },
      })

      await tx.auditLog.create({
        data: {
          user_id: assignerId,
          action: 'assign_agent',
          resource: 'property',
          resource_id: String(property.id),
          new_values: { agent_id: agent.id, agent_email: agent.email },
        },
      })
    })
  } catch (error) {
    console.error('Property agent assignment error:', error)
    return { success: false, error: 'Caktimi i agjentit dështoi.' }
  }

  revalidatePath(`/owner/properties/${property.id}/review`)
  revalidatePath('/owner')

  return {
    success: true,
    message: `${agent.name || agent.email} u caktua si agjent.`,
  }
}

// ═══════════════════════════════════════════════════════════════
// MARK PROPERTY AS SOLD
// ═══════════════════════════════════════════════════════════════

export async function markPropertySold(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Duhet të jesh i loguar.' }
  }

  const userId = Number(session.user.id)
  const propertyId = Number(formData.get('propertyId'))

  if (!Number.isSafeInteger(propertyId) || propertyId <= 0) {
    return { success: false, error: 'Prona nuk është e vlefshme.' }
  }

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      sanity_id: true,
      listed_by_id: true,
      primary_agent_id: true,
      agents: {
        where: { status: 'ACTIVE', agent_id: userId },
        select: { agent_id: true },
      },
    },
  })

  if (!property) {
    return { success: false, error: 'Prona nuk u gjet.' }
  }

  const role = session.user.role
  const isOwnerOrAdmin = role === 'ADMIN' || role === 'OWNER'
  const isLister = property.listed_by_id === userId
  const isPrimaryAgent = property.primary_agent_id === userId
  const isAssignedAgent = property.agents.length > 0

  if (!isOwnerOrAdmin && !isLister && !isPrimaryAgent && !isAssignedAgent) {
    return { success: false, error: 'Nuk ke leje për të ndryshuar këtë pronë.' }
  }

  if (property.status === 'SOLD') {
    return { success: false, error: 'Kjo pronë është shënuar tashmë si e shitur.' }
  }

  if (property.status === 'UNAVAILABLE') {
    return {
      success: false,
      error: 'Kjo pronë është tërhequr. Riktheje para se ta shënosh të shitur.',
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.property.update({
        where: { id: propertyId },
        data: { status: 'SOLD' },
      })

      await tx.propertyIntelligence.deleteMany({
        where: { property_id: propertyId },
      })

      await tx.auditLog.create({
        data: {
          user_id: userId,
          action: 'mark_sold',
          resource: 'property',
          resource_id: String(propertyId),
          old_values: { status: property.status },
          new_values: { status: 'SOLD' },
        },
      })
    })
  } catch (error) {
    console.error('markPropertySold error:', error)
    return { success: false, error: 'Veprimi dështoi.' }
  }

  try {
    await writeClient
      .patch(property.sanity_id)
      .set({ status: 'SOLD' })
      .commit()
  } catch (error) {
    console.error('Sanity sync failed for mark as sold:', error)
  }

  revalidatePath('/properties')
  revalidatePath(`/properties/${property.slug}`)
  revalidatePath('/account/listings')
  revalidatePath('/agent/my-properties')
  revalidatePath('/owner')
  revalidatePath('/admin')

  return { success: true, message: 'Prona u shënua si e shitur.' }
}

// ═══════════════════════════════════════════════════════════════
// MARK PROPERTY AS UNAVAILABLE
// ═══════════════════════════════════════════════════════════════

export async function markPropertyUnavailable(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Duhet të jesh i loguar.' }
  }

  const userId = Number(session.user.id)
  const propertyId = Number(formData.get('propertyId'))

  if (!Number.isSafeInteger(propertyId) || propertyId <= 0) {
    return { success: false, error: 'Prona nuk është e vlefshme.' }
  }

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      listed_by_id: true,
    },
  })

  if (!property) {
    return { success: false, error: 'Prona nuk u gjet.' }
  }

  const role = session.user.role
  const isOwnerOrAdmin = role === 'ADMIN' || role === 'OWNER'
  const isLister = property.listed_by_id === userId

  if (!isOwnerOrAdmin && !isLister) {
    return {
      success: false,
      error: 'Vetëm shitësi ose administrata mund ta tërheqë këtë pronë.',
    }
  }

  if (property.status === 'UNAVAILABLE') {
    return { success: false, error: 'Kjo pronë është tërhequr tashmë.' }
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.property.update({
        where: { id: propertyId },
        data: { status: 'UNAVAILABLE' },
      })

      await tx.auditLog.create({
        data: {
          user_id: userId,
          action: 'mark_unavailable',
          resource: 'property',
          resource_id: String(propertyId),
          old_values: { status: property.status },
          new_values: { status: 'UNAVAILABLE' },
        },
      })
    })
  } catch (error) {
    console.error('markPropertyUnavailable error:', error)
    return { success: false, error: 'Veprimi dështoi.' }
  }

  revalidatePath('/properties')
  revalidatePath(`/properties/${property.slug}`)
  revalidatePath('/account/listings')
  revalidatePath('/account/favorites')
  revalidatePath('/agent/my-properties')
  revalidatePath('/owner')
  revalidatePath('/admin')

  return {
    success: true,
    message: 'Prona u tërhoq nga platforma.',
  }
}

// ═══════════════════════════════════════════════════════════════
// RESTORE PROPERTY
// ═══════════════════════════════════════════════════════════════

export async function restoreProperty(formData: FormData) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Duhet të jesh i loguar.' }
  }

  const userId = Number(session.user.id)
  const propertyId = Number(formData.get('propertyId'))

  if (!Number.isSafeInteger(propertyId) || propertyId <= 0) {
    return { success: false, error: 'Prona nuk është e vlefshme.' }
  }

  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: {
      id: true,
      slug: true,
      status: true,
      listed_by_id: true,
      review_status: true,
      sanity_id: true,
      city: true,
      neighborhood: true,
      property_type: true,
      listing_type: true,
    },
  })

  if (!property) {
    return { success: false, error: 'Prona nuk u gjet.' }
  }

  const role = session.user.role
  const isOwnerOrAdmin = role === 'ADMIN' || role === 'OWNER'
  const isLister = property.listed_by_id === userId

  if (!isOwnerOrAdmin && !isLister) {
    return { success: false, error: 'Nuk ke leje për këtë veprim.' }
  }

  if (property.status === 'PUBLISHED') {
    return { success: false, error: 'Prona është tashmë publike.' }
  }

  if (property.review_status !== 'APPROVED') {
    return {
      success: false,
      error: 'Prona duhet të jetë e aprovuar për t\u2019u rikthyer në publik.',
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.property.update({
        where: { id: propertyId },
        data: { status: 'PUBLISHED' },
      })

      await tx.auditLog.create({
        data: {
          user_id: userId,
          action: 'restore_property',
          resource: 'property',
          resource_id: String(propertyId),
          old_values: { status: property.status },
          new_values: { status: 'PUBLISHED' },
        },
      })
    })
  } catch (error) {
    console.error('restoreProperty error:', error)
    return { success: false, error: 'Veprimi dështoi.' }
  }

  try {
    await writeClient
      .patch(property.sanity_id)
      .set({ status: 'PUBLISHED' })
      .commit()
  } catch (error) {
    console.error('Sanity sync failed for restore:', error)
  }

  // Queue intelligence refresh — market may have moved while offline
  try {
    await inngest.send({
      name: 'property/intelligence.requested',
      data: {
        propertyId,
        priority: 'normal',
        invalidateNearby: false,
      },
    })
    console.log(`📤 Queued intelligence for restored property ${propertyId}`)
  } catch (error) {
    console.error('Failed to queue intelligence on restore:', error)
  }

  revalidatePath('/properties')
  revalidatePath(`/properties/${property.slug}`)
  revalidatePath('/account/listings')
  revalidatePath('/agent/my-properties')

  return { success: true, message: 'Prona u rikthye në publik.' }
}