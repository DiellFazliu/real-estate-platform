import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db/prisma'
import { serializeProperties } from '@/lib/utils/serialize'

// ═══════════════════════════════════════════════════════════════
// FEATURE MAP: URL key → boolean column
// ═══════════════════════════════════════════════════════════════

const FEATURE_MAP: Record<string, keyof Prisma.PropertyWhereInput> = {
  elevator: 'has_elevator',
  parking: 'has_parking',
  garden: 'has_garden',
  pool: 'has_pool',
  air_conditioning: 'has_air_conditioning',
  heating: 'has_heating',
  security: 'has_security',
  internet: 'has_internet',
}

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface PropertiesSearchParams {
  q?: string
  city?: string
  neighborhood?: string
  minPrice?: string
  maxPrice?: string
  bedrooms?: string
  bathrooms?: string
  type?: string
  propertyType?: string
  features?: string
  sort?: string
}

export interface PropertiesSearchResult {
  properties: ReturnType<typeof serializeProperties>
  total: number
  hasStructuredFilters: boolean
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function parseNum(value?: string): number | undefined {
  if (!value) return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

function buildOrderBy(
  sort?: string
): Prisma.PropertyOrderByWithRelationInput[] {
  switch (sort) {
    case 'price_asc':
      return [{ price: 'asc' }, { published_at: 'desc' }]
    case 'price_desc':
      return [{ price: 'desc' }, { published_at: 'desc' }]
    case 'area_asc':
      return [{ area: 'asc' }, { published_at: 'desc' }]
    case 'area_desc':
      return [{ area: 'desc' }, { published_at: 'desc' }]
    default:
      return [{ featured: 'desc' }, { published_at: 'desc' }]
  }
}

function buildWhere(
  params: PropertiesSearchParams
): Prisma.PropertyWhereInput {
  const where: Prisma.PropertyWhereInput = {
    status: 'PUBLISHED',
    review_status: 'APPROVED',
  }

  // ─── Location ────────────────────────────────────────────
  if (params.city) {
    where.city = { equals: params.city, mode: 'insensitive' }
  }
  if (params.neighborhood) {
    where.neighborhood = { equals: params.neighborhood, mode: 'insensitive' }
  }

  // ─── Rooms ───────────────────────────────────────────────
  const bedrooms = parseNum(params.bedrooms)
  if (bedrooms !== undefined) where.bedrooms = { gte: bedrooms }

  const bathrooms = parseNum(params.bathrooms)
  if (bathrooms !== undefined) where.bathrooms = { gte: bathrooms }

  // ─── Type ────────────────────────────────────────────────
  if (params.type) where.listing_type = params.type
  if (params.propertyType) where.property_type = params.propertyType

  // ─── Price ───────────────────────────────────────────────
  const minPrice = parseNum(params.minPrice)
  const maxPrice = parseNum(params.maxPrice)
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {}
    if (minPrice !== undefined) where.price.gte = minPrice
    if (maxPrice !== undefined) where.price.lte = maxPrice
  }

  // ─── Features ────────────────────────────────────────────
  if (params.features) {
    const list = params.features.split(',').filter(Boolean)
    const conditions: Prisma.PropertyWhereInput[] = []
    for (const f of list) {
      const column = FEATURE_MAP[f]
      if (column) conditions.push({ [column]: true } as Prisma.PropertyWhereInput)
    }
    if (conditions.length > 0) where.AND = conditions
  }

  return where
}

/**
 * A "structured" filter is anything the AI parser or a manual form
 * produces that's more precise than free-text `q`. When any exists,
 * `q` is treated as informational only and skipped from the query.
 */
export function hasStructuredFilters(
  params: PropertiesSearchParams
): boolean {
  return Boolean(
    params.city ||
      params.neighborhood ||
      params.bedrooms ||
      params.bathrooms ||
      params.propertyType ||
      params.type ||
      params.minPrice ||
      params.maxPrice ||
      params.features
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN QUERY
// ═══════════════════════════════════════════════════════════════

export async function searchProperties(
  params: PropertiesSearchParams,
  options: { take?: number } = {}
): Promise<PropertiesSearchResult> {
  const { take = 250 } = options

  const where = buildWhere(params)

  // Only use `q` as free-text search when no structured filters exist.
  // Prevents "apartament 5 dhoma në Prishtinë" from matching every
  // listing whose title contains "apartament".
  if (params.q && !hasStructuredFilters(params)) {
    where.OR = [
      { title: { contains: params.q, mode: 'insensitive' } },
      { city: { contains: params.q, mode: 'insensitive' } },
      { neighborhood: { contains: params.q, mode: 'insensitive' } },
      { location: { contains: params.q, mode: 'insensitive' } },
    ]
  }

  const [dbProperties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy: buildOrderBy(params.sort),
      take,
    }),
    prisma.property.count({ where }),
  ])

  return {
    properties: serializeProperties(dbProperties),
    total,
    hasStructuredFilters: hasStructuredFilters(params),
  }
}