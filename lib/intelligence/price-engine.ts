import { prisma } from '@/lib/db/prisma'
import type { Prisma } from '@prisma/client'

export interface PriceAnalysis {
  price_per_m2: number | null
  comparable_average: number | null
  comparable_median: number | null
  comparable_count: number
  price_difference_pct: number | null
  market_position: 'BELOW' | 'AT' | 'ABOVE' | null
  percentile: number | null
}

export interface ComparableProperty {
  id: number
  slug: string
  title: string
  price: number
  area: number
  price_per_m2: number
  bedrooms: number | null
  bathrooms: number | null
  year_built: number | null
  neighborhood: string | null
  primary_image_url: string | null
  match_score: number
}

interface ComparableSourceProperty {
  id: number
  city: string | null
  neighborhood: string | null
  property_type: string | null
  listing_type: string
  area: number | null
  bedrooms: number | null
  year_built: number | null
  has_parking: boolean
  has_elevator: boolean
  floor: number | null
}

// ═══════════════════════════════════════════════════════════════
// CALCULATE PRICE PER M2
// ═══════════════════════════════════════════════════════════════

export function calcPricePerM2(price: number, area: number | null): number | null {
  if (!area || area <= 0) return null
  return Math.round((price / area) * 100) / 100
}

// ═══════════════════════════════════════════════════════════════
// FIND COMPARABLES (ML-inspired scoring)
// ═══════════════════════════════════════════════════════════════

export async function findComparables(
  propertyId: number,
  limit: number = 10,
  sourceProperty?: ComparableSourceProperty,
): Promise<ComparableProperty[]> {
  const property = sourceProperty ?? await prisma.property.findUnique({
    where: { id: propertyId },
    select: {
      id: true,
      city: true,
      neighborhood: true,
      property_type: true,
      listing_type: true,
      area: true,
      bedrooms: true,
      year_built: true,
      has_parking: true,
      has_elevator: true,
      floor: true,
    },
  })

  if (!property || !property.area) return []

  // Build query
  const where: Prisma.PropertyWhereInput = {
    id: { not: propertyId },
    status: 'PUBLISHED',
    review_status: 'APPROVED',
    listing_type: property.listing_type,
    area: {
      gte: Math.round(property.area * 0.7),
      lte: Math.round(property.area * 1.3),
    },
  }

  if (property.city) where.city = property.city

  const candidates = await prisma.property.findMany({
    where,
    take: Math.min(100, Math.max(30, limit * 10)),
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      area: true,
      bedrooms: true,
      bathrooms: true,
      year_built: true,
      neighborhood: true,
      property_type: true,
      has_parking: true,
      has_elevator: true,
      floor: true,
      primary_image_url: true,
    },
  })

  // Score each candidate
  const scored = candidates
    .map((c) => ({
      ...c,
      price: Number(c.price),
      match_score: calculateMatchScore(property, c),
    }))
    .filter((c) => c.area && c.area > 0)
    .sort((a, b) => b.match_score - a.match_score)
    .slice(0, limit)

  return scored.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    price: c.price,
    area: c.area!,
    price_per_m2: Math.round((c.price / c.area!) * 100) / 100,
    bedrooms: c.bedrooms,
    bathrooms: c.bathrooms,
    year_built: c.year_built,
    neighborhood: c.neighborhood,
    primary_image_url: c.primary_image_url,
    match_score: c.match_score,
  }))
}

// ═══════════════════════════════════════════════════════════════
// MATCH SCORE (ML-inspired weights)
// ═══════════════════════════════════════════════════════════════

function calculateMatchScore(current: any, candidate: any): number {
  let score = 0

  // Same neighborhood: +30
  if (current.neighborhood && current.neighborhood === candidate.neighborhood) {
    score += 30
  }

  // Same property type: +20
  if (current.property_type === candidate.property_type) {
    score += 20
  }

  // Similar area: +15 (proportional)
  if (current.area && candidate.area) {
    const diff = Math.abs(current.area - candidate.area) / current.area
    score += Math.max(0, 15 * (1 - diff))
  }

  // Similar bedrooms: +10
  if (current.bedrooms && candidate.bedrooms) {
    const diff = Math.abs(current.bedrooms - candidate.bedrooms)
    if (diff === 0) score += 10
    else if (diff === 1) score += 5
  }

  // Similar construction age: +10
  if (current.year_built && candidate.year_built) {
    const ageDiff = Math.abs(current.year_built - candidate.year_built)
    score += Math.max(0, 10 * (1 - ageDiff / 20))
  }

  // Same parking: +5
  if (current.has_parking === candidate.has_parking) score += 5

  // Same elevator: +5
  if (current.has_elevator === candidate.has_elevator) score += 5

  // Similar floor: +5
  if (current.floor && candidate.floor) {
    const diff = Math.abs(current.floor - candidate.floor)
    score += Math.max(0, 5 * (1 - diff / 10))
  }

  return Math.round(score * 100) / 100
}

// ═══════════════════════════════════════════════════════════════
// PRICE ANALYSIS
// ═══════════════════════════════════════════════════════════════

export async function analyzePrice(propertyId: number): Promise<PriceAnalysis> {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  })

  if (!property || !property.area) {
    return {
      price_per_m2: null,
      comparable_average: null,
      comparable_median: null,
      comparable_count: 0,
      price_difference_pct: null,
      market_position: null,
      percentile: null,
    }
  }

  const currentPrice = Number(property.price)
  const currentPriceM2 = calcPricePerM2(currentPrice, property.area)
  const comparables = await findComparables(propertyId, 20)

  if (comparables.length === 0 || !currentPriceM2) {
    return {
      price_per_m2: currentPriceM2,
      comparable_average: null,
      comparable_median: null,
      comparable_count: 0,
      price_difference_pct: null,
      market_position: null,
      percentile: null,
    }
  }

  const prices = comparables.map((c) => c.price_per_m2)
  const average = prices.reduce((a, b) => a + b, 0) / prices.length

  const sorted = [...prices].sort((a, b) => a - b)
  const median =
    sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)]

  const diffPct = ((currentPriceM2 - average) / average) * 100

  let position: 'BELOW' | 'AT' | 'ABOVE'
  if (diffPct < -5) position = 'BELOW'
  else if (diffPct > 5) position = 'ABOVE'
  else position = 'AT'

  const belowCount = prices.filter((p) => p < currentPriceM2).length
  const percentile = (belowCount / prices.length) * 100

  return {
    price_per_m2: currentPriceM2,
    comparable_average: Math.round(average * 100) / 100,
    comparable_median: Math.round(median * 100) / 100,
    comparable_count: comparables.length,
    price_difference_pct: Math.round(diffPct * 10) / 10,
    market_position: position,
    percentile: Math.round(percentile),
  }
}