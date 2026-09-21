import { prisma } from '@/lib/db/prisma'
import { Prisma } from '@prisma/client'
import { parseQuery } from './hybrid-parser'
import type { ParsedQuery, SearchResult } from './types'

export interface SearchOptions {
  page?: number
  limit?: number
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'relevance'
}

// ═══════════════════════════════════════════════════════════
// MAP: feature key → boolean column on Property
// ═══════════════════════════════════════════════════════════

const FEATURE_COLUMN_MAP: Record<
  string,
  keyof Prisma.PropertyWhereInput
> = {
  elevator: 'has_elevator',
  parking: 'has_parking',
  garden: 'has_garden',
  pool: 'has_pool',
  air_conditioning: 'has_air_conditioning',
  heating: 'has_heating',
  security: 'has_security',
  internet: 'has_internet',
}

// ═══════════════════════════════════════════════════════════
// MAIN SEARCH FUNCTION
// ═══════════════════════════════════════════════════════════

export async function searchProperties(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult> {
  const { page = 1, limit = 20, sortBy = 'newest' } = options
  const parseStart = Date.now()

  const parsed = await parseQuery(query)
  const parseTime = Date.now() - parseStart

  const where = buildPrismaWhere(parsed)
  const orderBy = buildOrderBy(sortBy)

  const queryStart = Date.now()

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        sanity_id: true,
        slug: true,
        title: true,
        price: true,
        price_per_m2: true,
        listing_type: true,
        property_type: true,
        city: true,
        neighborhood: true,
        location: true,
        bedrooms: true,
        bathrooms: true,
        area: true,
        floor: true,
        total_floors: true,
        primary_image_url: true,
        has_elevator: true,
        has_parking: true,
        has_garden: true,
        has_pool: true,
        has_air_conditioning: true,
        has_heating: true,
        has_security: true,
        has_internet: true,
        features: true,
        featured: true,
        published_at: true,
        created_at: true,
      },
    }),
    prisma.property.count({ where }),
  ])

  const queryTime = Date.now() - queryStart

  // Serialize Decimal → number so JSON works
  const serialized = properties.map((p) => ({
    ...p,
    price: Number(p.price),
    price_per_m2: p.price_per_m2 ? Number(p.price_per_m2) : null,
  }))

  return {
    properties: serialized,
    total,
    totalPages: Math.ceil(total / limit),
    parsed,
    meta: {
      parseTime,
      queryTime,
      totalTime: parseTime + queryTime,
    },
  }
}

// ═══════════════════════════════════════════════════════════
// BUILD PRISMA WHERE
// ═══════════════════════════════════════════════════════════

function buildPrismaWhere(parsed: ParsedQuery): Prisma.PropertyWhereInput {
  const where: Prisma.PropertyWhereInput = {
    status: 'PUBLISHED',
    review_status: 'APPROVED',
  }

  // Numeric
  if (parsed.bedrooms) where.bedrooms = { gte: parsed.bedrooms }
  if (parsed.bathrooms) where.bathrooms = { gte: parsed.bathrooms }

  if (parsed.minPrice || parsed.maxPrice) {
    where.price = {}
    if (parsed.minPrice) where.price.gte = parsed.minPrice
    if (parsed.maxPrice) where.price.lte = parsed.maxPrice
  }

  // Location
  if (parsed.city) {
    where.city = { equals: parsed.city, mode: 'insensitive' }
  }
  if (parsed.neighborhood) {
    where.neighborhood = { equals: parsed.neighborhood, mode: 'insensitive' }
  }

  // Type
  if (parsed.propertyType) where.property_type = parsed.propertyType
  if (parsed.listingType) where.listing_type = parsed.listingType

  // Features → boolean columns + array containment (belt and suspenders)
  if (parsed.features && parsed.features.length > 0) {
    const andConditions: Prisma.PropertyWhereInput[] = []

    for (const feature of parsed.features) {
      const column = FEATURE_COLUMN_MAP[feature]

      if (column) {
        // Use the boolean column (fast, indexed)
        andConditions.push({ [column]: true } as Prisma.PropertyWhereInput)
      } else {
        // Fallback: search the features array
        andConditions.push({ features: { has: feature } })
      }
    }

    if (andConditions.length > 0) {
      where.AND = andConditions
    }
  }

  // Keywords → search title + location only (no `description`)
  if (parsed.keywords && parsed.keywords.length > 0) {
    // Strip duplicates of already-captured filters
    const usefulKeywords = parsed.keywords.filter((kw) => {
      const k = kw.toLowerCase()
      if (parsed.city && k === parsed.city.toLowerCase()) return false
      if (parsed.propertyType && k.includes(parsed.propertyType)) return false
      return k.length > 2
    })

    if (usefulKeywords.length > 0) {
      where.OR = usefulKeywords.flatMap((kw) => [
        { title: { contains: kw, mode: 'insensitive' as const } },
        { city: { contains: kw, mode: 'insensitive' as const } },
        { neighborhood: { contains: kw, mode: 'insensitive' as const } },
        { location: { contains: kw, mode: 'insensitive' as const } },
      ])
    }
  }

  return where
}

function buildOrderBy(sortBy: string): Prisma.PropertyOrderByWithRelationInput[] {
  switch (sortBy) {
    case 'price_asc':
      return [{ price: 'asc' }]
    case 'price_desc':
      return [{ price: 'desc' }]
    case 'relevance':
      return [{ featured: 'desc' }, { published_at: 'desc' }]
    default:
      return [{ featured: 'desc' }, { created_at: 'desc' }]
  }
}