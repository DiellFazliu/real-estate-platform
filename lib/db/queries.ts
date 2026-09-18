import { prisma } from './prisma'
import { serializeProperties } from '@/lib/utils/serialize'

/**
 * Të gjitha query-t për pronat nga PostgreSQL
 * Përdoret nga Server Components
 */

// ═══════════════════════════════════════════════════════════════
// FEATURED PROPERTIES
// ═══════════════════════════════════════════════════════════════

export async function getFeaturedProperties(limit = 3) {
  const properties = await prisma.property.findMany({
    where: {
      status: 'PUBLISHED',
      review_status: 'APPROVED',
      featured: true,
    },
    orderBy: { published_at: 'desc' },
    take: limit,
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      price_per_m2: true,
      city: true,
      neighborhood: true,
      location: true,
      bedrooms: true,
      bathrooms: true,
      area: true,
      property_type: true,
      listing_type: true,
      primary_image_url: true,
      featured: true,
      status: true,
    },
  })

  return serializeProperties(properties)
}

// ═══════════════════════════════════════════════════════════════
// RENT PROPERTIES
// ═══════════════════════════════════════════════════════════════

export async function getRentProperties(limit = 6) {
  const properties = await prisma.property.findMany({
    where: {
      status: 'PUBLISHED',
      review_status: 'APPROVED',
      listing_type: 'rent',
    },
    orderBy: [{ featured: 'desc' }, { published_at: 'desc' }],
    take: limit,
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      price_per_m2: true,
      city: true,
      neighborhood: true,
      location: true,
      bedrooms: true,
      bathrooms: true,
      area: true,
      property_type: true,
      listing_type: true,
      primary_image_url: true,
      featured: true,
      status: true,
    },
  })

  return serializeProperties(properties)
}

// ═══════════════════════════════════════════════════════════════
// ALL PROPERTIES (Listing page)
// ═══════════════════════════════════════════════════════════════

export async function getAllProperties(filters?: {
  q?: string
  city?: string
  minPrice?: number
  maxPrice?: number
  bedrooms?: number
  listingType?: string
  take?: number
  skip?: number
}) {
  const where: any = {
    status: 'PUBLISHED',
    review_status: 'APPROVED',
  }

  if (filters?.q) {
    where.OR = [
      { title: { contains: filters.q, mode: 'insensitive' } },
      { city: { contains: filters.q, mode: 'insensitive' } },
      { neighborhood: { contains: filters.q, mode: 'insensitive' } },
    ]
  }

  if (filters?.city) {
    where.city = { contains: filters.city, mode: 'insensitive' }
  }

  if (filters?.bedrooms) {
    where.bedrooms = { gte: filters.bedrooms }
  }

  if (filters?.listingType) {
    where.listing_type = filters.listingType
  }

  if (filters?.minPrice || filters?.maxPrice) {
    where.price = {}
    if (filters.minPrice) where.price.gte = filters.minPrice
    if (filters.maxPrice) where.price.lte = filters.maxPrice
  }

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { published_at: 'desc' }],
      take: filters?.take || 24,
      skip: filters?.skip || 0,
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        price_per_m2: true,
        city: true,
        neighborhood: true,
        location: true,
        bedrooms: true,
        bathrooms: true,
        area: true,
        property_type: true,
        listing_type: true,
        primary_image_url: true,
        featured: true,
        status: true,
      },
    }),
    prisma.property.count({ where }),
  ])

  return {
    properties: serializeProperties(properties),
    total,
  }
}

// ═══════════════════════════════════════════════════════════════
// PROPERTY BY SLUG (Detail page)
// ═══════════════════════════════════════════════════════════════

export async function getPropertyBySlug(slug: string) {
  const property = await prisma.property.findUnique({
    where: { slug },
    include: {
      primary_agent: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          image: true,
        },
      },
    },
  })

  return property
}

// Check if property is favorited by user
export async function isPropertyFavorite(
  userId: number,
  propertyId: number
) {
  return await prisma.favorite.findUnique({
    where: {
      user_id_property_id: {
        user_id: userId,
        property_id: propertyId,
      },
    },
    select: {
      id: true,
    },
  })
}