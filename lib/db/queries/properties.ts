import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db/prisma'
import { serializeProperties } from '@/lib/utils/serialize'

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

export const DEFAULT_PAGE_SIZE = 30

// ═══════════════════════════════════════════════════════════════
// FEATURE MAP
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
  page?: string
}

export interface PropertiesSearchResult {
  properties: ReturnType<typeof serializeProperties>
  total: number
  page: number
  pageSize: number
  totalPages: number
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

function parsePage(value?: string): number {
  const n = parseInt(value || '1', 10)
  return Number.isFinite(n) && n > 0 ? n : 1
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

  if (params.city) {
    where.city = { equals: params.city, mode: 'insensitive' }
  }
  if (params.neighborhood) {
    where.neighborhood = { equals: params.neighborhood, mode: 'insensitive' }
  }

  const bedrooms = parseNum(params.bedrooms)
  if (bedrooms !== undefined) where.bedrooms = { gte: bedrooms }

  const bathrooms = parseNum(params.bathrooms)
  if (bathrooms !== undefined) where.bathrooms = { gte: bathrooms }

  if (params.type) where.listing_type = params.type
  if (params.propertyType) where.property_type = params.propertyType

  const minPrice = parseNum(params.minPrice)
  const maxPrice = parseNum(params.maxPrice)
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {}
    if (minPrice !== undefined) where.price.gte = minPrice
    if (maxPrice !== undefined) where.price.lte = maxPrice
  }

  if (params.features) {
    const list = params.features.split(',').filter(Boolean)
    const conditions: Prisma.PropertyWhereInput[] = []
    for (const f of list) {
      const column = FEATURE_MAP[f]
      if (column) {
        conditions.push({ [column]: true } as Prisma.PropertyWhereInput)
      }
    }
    if (conditions.length > 0) where.AND = conditions
  }

  return where
}

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
  options: { pageSize?: number } = {}
): Promise<PropertiesSearchResult> {
  const { pageSize = DEFAULT_PAGE_SIZE } = options

  const where = buildWhere(params)

  // Free-text fallback only when no structured filters
  if (params.q && !hasStructuredFilters(params)) {
    where.OR = [
      { title: { contains: params.q, mode: 'insensitive' } },
      { city: { contains: params.q, mode: 'insensitive' } },
      { neighborhood: { contains: params.q, mode: 'insensitive' } },
      { location: { contains: params.q, mode: 'insensitive' } },
    ]
  }

  const page = parsePage(params.page)
  const skip = (page - 1) * pageSize

  const [dbProperties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy: buildOrderBy(params.sort),
      skip,
      take: pageSize,
    }),
    prisma.property.count({ where }),
  ])

  return {
    properties: serializeProperties(dbProperties),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    hasStructuredFilters: hasStructuredFilters(params),
  }
}