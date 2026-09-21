'use server'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { writeClient } from '@/lib/sanity/write-client'
import { propertySubmitSchema } from '@/lib/validation/property'
import { checkRateLimit } from '@/lib/rate-limit'
import { revalidatePath } from 'next/cache'

export async function submitProperty(formData: FormData) {
  try {
    // 1. AUTHENTICATE
    const session = await auth()
    if (!session?.user) {
      return { success: false, error: 'Duhet të jesh i loguar' }
    }

    // 2. CHECK SELLER STATUS
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

    // 3. RATE LIMITING
    const rateCheck = checkRateLimit(session.user.id, 3)
    if (!rateCheck.allowed) {
      return {
        success: false,
        error: 'Keni arritur limitin e 3 listimeve në 24 orë',
      }
    }

    // 4. VALIDATE
    const rawData = {
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
      floor: formData.get('floor')
        ? Number(formData.get('floor'))
        : undefined,
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

      // Boolean features
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

    const parsed = propertySubmitSchema.safeParse(rawData)

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      const firstError =
        Object.values(fieldErrors)[0]?.[0] || 'Të dhëna të pavlefshme'
      return {
        success: false,
        error: firstError,
        details: fieldErrors,
      }
    }

    const data = parsed.data

    // 5. CHECK DUPLICATE
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

    // 6. GENERATE SLUG
    const slug = generateSlug(data.title) + '-' + Date.now()

    // 7. CALCULATE PRICE PER M2
    const pricePerM2 = data.area ? data.price / data.area : undefined

    // 8. CREATE IN SANITY
    // 8. CREATE IN SANITY
// 8. CREATE IN SANITY
let sanityProperty
try {
  // Gjenero _id me format të saktë (lowercase + alphanumeric)
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 10)
  const sanityId = `property-${timestamp}-${randomStr}`

  console.log('📝 Duke krijuar dokument me _id:', sanityId)

  sanityProperty = await writeClient.create({
    _id: sanityId,
    _type: 'property',
    title: data.title,
    slug: { current: slug },
    description: data.description,
    price: data.price,
    pricePerM2: pricePerM2,
    status: 'DRAFT',
    reviewStatus: 'PENDING_REVIEW',
    source: 'USER',
    listedBy: user.email,
    listingType: data.listingType,
    propertyType: data.propertyType,

    // LOCATION
    location: data.location,
    city: data.city,
    neighborhood: data.neighborhood,
    postalCode: data.postalCode,
    latitude: data.latitude,
    longitude: data.longitude,
    distanceFromCenter: data.distanceFromCenter,

    // CHARACTERISTICS
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

    // FEATURES
    hasElevator: data.hasElevator,
    hasParking: data.hasParking,
    hasGarden: data.hasGarden,
    hasPool: data.hasPool,
    hasAirConditioning: data.hasAirConditioning,
    hasHeating: data.hasHeating,
    hasSecurity: data.hasSecurity,
    hasInternet: data.hasInternet,
    features: data.features,

    // CONTACT
    contactPhone: data.contactPhone,
    contactEmail: data.contactEmail,

    // IMAGES me _key
    images: data.images.map((id: string, index: number) => ({
      _type: 'image',
      _key: `img-${index}-${timestamp}-${Math.random().toString(36).substring(2, 8)}`,
      asset: { _type: 'reference', _ref: id },
    })),

    featured: false,
  })

  console.log('✅ Dokument i krijuar në Sanity:', sanityProperty._id)
} catch (error) {
  console.error('❌ Sanity create error:', error)
  return { success: false, error: 'Gabim gjatë ruajtjes në CMS' }
}

    // 9. CREATE IN POSTGRESQL
    const dbProperty = await prisma.property.create({
      data: {
        sanity_id: sanityProperty._id,
        slug: slug,
        title: data.title,
        price: data.price,
        price_per_m2: pricePerM2,
        status: 'DRAFT',
        review_status: 'PENDING_REVIEW',
        source: 'USER',
        listing_type: data.listingType,
        listed_by_id: parseInt(session.user.id),

        // LOCATION
        location: data.location,
        city: data.city,
        neighborhood: data.neighborhood,
        postal_code: data.postalCode,
        latitude: data.latitude,
        longitude: data.longitude,
        distance_from_center: data.distanceFromCenter,

        // CHARACTERISTICS
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

        // FEATURES
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

    // 10. NOTIFY OWNERS
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

    // 11. REVALIDATE
    revalidatePath('/properties')
    revalidatePath('/account/listings')
    revalidatePath('/owner/properties/pending')

    return {
      success: true,
      message:
        'Prona u dërgua për review. Do të njoftoheni kur të aprovohet.',
      propertyId: dbProperty.id,
    }
  } catch (error) {
    console.error('Submit error:', error)
    return { success: false, error: 'Gabim i brendshëm' }
  }
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80)
}

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

  if (!Number.isSafeInteger(propertyId) || propertyId <= 0) {
    return { success: false, error: 'Prona nuk është e vlefshme.' }
  }

  if (decision !== 'APPROVED' && decision !== 'REJECTED') {
    return { success: false, error: 'Vendimi i review nuk është i vlefshëm.' }
  }

  if (decision === 'REJECTED' && (rejectionReason.length < 10 || rejectionReason.length > 1000)) {
    return {
      success: false,
      error: 'Arsyeja e refuzimit duhet të ketë nga 10 deri në 1000 karaktere.',
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
    },
  })

  if (!property) {
    return { success: false, error: 'Kjo pronë nuk është më në pritje për review.' }
  }

  const approved = decision === 'APPROVED'
  const reviewerId = Number(session.user.id)

  if (!Number.isSafeInteger(reviewerId) || reviewerId <= 0) {
    return { success: false, error: 'Sesioni i përdoruesit nuk është i vlefshëm.' }
  }

  try {
    const sanityPatch = writeClient
      .patch(property.sanity_id)
      .set({
        reviewStatus: decision,
        status: approved ? 'PUBLISHED' : 'DRAFT',
      })

    if (approved) {
      sanityPatch.unset(['rejectionReason'])
    } else {
      sanityPatch.set({ rejectionReason })
    }

    await sanityPatch.commit()

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
        },
      })

      if (updated.count !== 1) {
        throw new Error('Property has already been reviewed')
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
          },
        },
      })
    })
  } catch (error) {
    console.error('Property review error:', error)
    return { success: false, error: 'Review nuk u ruajt. Ju lutemi provoni përsëri.' }
  }

  revalidatePath('/owner/properties/pending')
  revalidatePath(`/owner/properties/${property.id}/review`)
  revalidatePath('/admin')
  revalidatePath('/admin/reviews')
  revalidatePath('/account/listings')
  revalidatePath('/properties')
  revalidatePath(`/properties/${property.slug}`)

  return {
    success: true,
    message: approved ? 'Prona u aprovua.' : 'Prona u refuzua dhe shitësi u njoftua.',
  }
}

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

  if (![propertyId, agentId, assignerId].every((value) => Number.isSafeInteger(value) && value > 0)) {
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
          link: '/agent/properties',
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

  return { success: true, message: `${agent.name || agent.email} u caktua si agjent.` }
}
