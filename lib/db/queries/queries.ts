import { prisma } from '../prisma'
import { unstable_cache } from 'next/cache'
import { serializeProperties } from '@/lib/utils/serialize'

// ═══════════════════════════════════════════════════════════════
// FALLBACK IMAGES
// ═══════════════════════════════════════════════════════════════

const FALLBACK_IMAGES: Record<string, string> = {
  apartment: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
  house: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80',
  villa: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
  studio: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800&q=80',
  penthouse: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80',
  commercial: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
  office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
  default: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
}

// Statuset që shfaqen në listat publike
const VISIBLE_STATUSES = ['PUBLISHED', 'SOLD'] as const

function getFallbackImage(propertyType: string | null): string {
  if (!propertyType) return FALLBACK_IMAGES.default
  return FALLBACK_IMAGES[propertyType] || FALLBACK_IMAGES.default
}

function hasValidImage(url: string | null | undefined): boolean {
  if (!url) return false
  if (typeof url !== 'string') return false
  if (!url.startsWith('http')) return false
  return true
}

function ensureImage(property: any): any {
  if (hasValidImage(property.primary_image_url)) {
    return property
  }

  return {
    ...property,
    primary_image_url: getFallbackImage(property.property_type),
  }
}

// ═══════════════════════════════════════════════════════════════
// FEATURED PROPERTIES
// ═══════════════════════════════════════════════════════════════

const getFeaturedPropertiesCached = unstable_cache(
  async (limit: number) => {
    const properties = await prisma.property.findMany({
      where: {
        status: { in: [...VISIBLE_STATUSES] },
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

    return serializeProperties(properties.map(ensureImage))
  },
  ['public-featured-properties'],
  { revalidate: 60 },
)

export async function getFeaturedProperties(limit = 6) {
  return getFeaturedPropertiesCached(limit)
}

// ═══════════════════════════════════════════════════════════════
// RENT PROPERTIES
// ═══════════════════════════════════════════════════════════════

const getRentPropertiesCached = unstable_cache(
  async (limit: number) => {
    const properties = await prisma.property.findMany({
      where: {
        status: { in: [...VISIBLE_STATUSES] },
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

    return serializeProperties(properties.map(ensureImage))
  },
  ['public-rent-properties'],
  { revalidate: 60 },
)

export async function getRentProperties(limit = 6) {
  return getRentPropertiesCached(limit)
}

// ═══════════════════════════════════════════════════════════════
// ALL PROPERTIES
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
    status: { in: [...VISIBLE_STATUSES] },
    review_status: 'APPROVED',
  }

  if (filters?.q) {
    where.OR = [
      { title: { contains: filters.q, mode: 'insensitive' } },
      { city: { contains: filters.q, mode: 'insensitive' } },
      { neighborhood: { contains: filters.q, mode: 'insensitive' } },
      { location: { contains: filters.q, mode: 'insensitive' } },
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

  const take = filters?.take || 100
  const skip = filters?.skip || 0

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { published_at: 'desc' }],
      take,
      skip,
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
    properties: serializeProperties(properties.map(ensureImage)),
    total,
  }
}

// ═══════════════════════════════════════════════════════════════
// PROPERTY BY SLUG
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

  if (!property) return null

  return ensureImage(property)
}

// ═══════════════════════════════════════════════════════════════
// IS FAVORITE
// ═══════════════════════════════════════════════════════════════

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