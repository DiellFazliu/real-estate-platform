'use server'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { client } from '@/lib/sanity/client'
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
      propertyType: formData.get('propertyType') as string,
      listingType: formData.get('listingType') as string,
      bedrooms: formData.get('bedrooms')
        ? Number(formData.get('bedrooms'))
        : undefined,
      bathrooms: formData.get('bathrooms')
        ? Number(formData.get('bathrooms'))
        : undefined,
      area: formData.get('area') ? Number(formData.get('area')) : undefined,
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
      const firstError = Object.values(fieldErrors)[0]?.[0] || 'Të dhëna të pavlefshme'
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

    // 7. CREATE IN SANITY
    let sanityProperty
    try {
      sanityProperty = await client.create({
        _type: 'property',
        title: data.title,
        slug: { current: slug },
        description: data.description,
        price: data.price,
        status: 'DRAFT',
        reviewStatus: 'PENDING_REVIEW',
        source: 'USER',
        listedBy: user.email,
        location: data.location,
        city: data.city,
        propertyType: data.propertyType,
        listingType: data.listingType,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        area: data.area,
        features: data.features,
        featured: false,
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        latitude: data.latitude,
        longitude: data.longitude,
        images: data.images.map((id: string) => ({
          _type: 'image',
          asset: { _type: 'reference', _ref: id },
        })),
      })
    } catch (error) {
      console.error('Sanity create error:', error)
      return { success: false, error: 'Gabim gjatë ruajtjes në CMS' }
    }

    // 8. CREATE IN POSTGRESQL
    const dbProperty = await prisma.property.create({
      data: {
        sanity_id: sanityProperty._id,
        slug: slug,
        title: data.title,
        price: data.price,
        status: 'PUBLISHED',
        review_status: 'PENDING_REVIEW',
        source: 'USER',
        listed_by_id: parseInt(session.user.id),
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        area: data.area,
        city: data.city,
        location: data.location,
        property_type: data.propertyType,
        latitude: data.latitude,
        longitude: data.longitude,
      },
    })

    // 9. NOTIFY OWNERS
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
          message: `${user.name} listoi "${data.title}" në ${data.city}`,
          link: '/owner/properties/pending',
        },
      })
    }

    // 10. REVALIDATE
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

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80)
}