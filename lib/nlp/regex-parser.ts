import type { ParsedQuery } from './types'
import { normalizeAlbanian, findBestMatch } from './normalize'
import {
  getCanonicalCity,
  getCanonicalNeighborhood,
  getCanonicalFeature,
  getCanonicalPropertyType,
  CITY_VARIANTS,
  NEIGHBORHOOD_VARIANTS,
  FEATURE_VARIANTS,
} from './dictionary-extended'

// ═══════════════════════════════════════════════════════════════
// MAIN FUNCTION
// ═══════════════════════════════════════════════════════════════

export function quickParse(query: string): ParsedQuery | null {
  const lower = normalizeAlbanian(query)
  const parsed: ParsedQuery = { keywords: [] }
  let hasFilter = false

  // ═══════════════════════════════════════════════════════════
  // 1. BEDROOMS
  // ═══════════════════════════════════════════════════════════
  const bedMatch = lower.match(
    /(\d+)\s*(bedroom|bed|bedrooms|dhome|dhome|dhoma|dhomat|sobe|soba|kamare)/i
  )
  if (bedMatch) {
    parsed.bedrooms = parseInt(bedMatch[1], 10)
    hasFilter = true
  }

  // ═══════════════════════════════════════════════════════════
  // 2. BATHROOMS
  // ═══════════════════════════════════════════════════════════
  const bathMatch = lower.match(
    /(\d+)\s*(bathroom|bath|bathrooms|banjo|banjо|banjot|tualet|wc|kupaon)/i
  )
  if (bathMatch) {
    parsed.bathrooms = parseInt(bathMatch[1], 10)
    hasFilter = true
  }

  // ═══════════════════════════════════════════════════════════
  // 3. MAX PRICE
  // ═══════════════════════════════════════════════════════════
  const maxPriceMatch = lower.match(
    /(?:under|below|nen|maks|max|deri|me pak se|up to|less than)\s*[$€]?\s*(\d+(?:[.,]\d+)?)\s*(miliona|milion|mije|mij|m|k)?/i
  )
  if (maxPriceMatch) {
    parsed.maxPrice = parsePrice(maxPriceMatch[1], maxPriceMatch[2])
    hasFilter = true
  }

  // ═══════════════════════════════════════════════════════════
  // 4. MIN PRICE
  // ═══════════════════════════════════════════════════════════
  const minPriceMatch = lower.match(
    /(?:over|above|mbi|min|nga|me shume se|more than)\s*[$€]?\s*(\d+(?:[.,]\d+)?)\s*(miliona|milion|mije|mij|m|k)?/i
  )
  if (minPriceMatch) {
    parsed.minPrice = parsePrice(minPriceMatch[1], minPriceMatch[2])
    hasFilter = true
  }

  // ═══════════════════════════════════════════════════════════
  // 5. CITY (me fuzzy matching)
  // ═══════════════════════════════════════════════════════════
  const words = lower.split(/\s+/)

  for (const word of words) {
    const city = getCanonicalCity(word)
    if (city) {
      parsed.city = city
      hasFilter = true
      break
    }
  }

  // Fuzzy matching për city
  if (!parsed.city) {
    const allCityVariants = Object.values(CITY_VARIANTS).flat()
    for (const word of words) {
      const match = findBestMatch(word, allCityVariants, 0.75)
      if (match) {
        const city = getCanonicalCity(match)
        if (city) {
          parsed.city = city
          hasFilter = true
          break
        }
      }
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 6. NEIGHBORHOOD
  // ═══════════════════════════════════════════════════════════
  for (const word of words) {
    const neighborhood = getCanonicalNeighborhood(word)
    if (neighborhood) {
      parsed.neighborhood = neighborhood
      hasFilter = true
      break
    }
  }

  // Fuzzy matching për neighborhood
  if (!parsed.neighborhood) {
    const allNeighborhoodVariants = Object.values(NEIGHBORHOOD_VARIANTS).flat()
    for (const word of words) {
      const match = findBestMatch(word, allNeighborhoodVariants, 0.75)
      if (match) {
        const neighborhood = getCanonicalNeighborhood(match)
        if (neighborhood) {
          parsed.neighborhood = neighborhood
          hasFilter = true
          break
        }
      }
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 7. PROPERTY TYPE
  // ═══════════════════════════════════════════════════════════
  for (const word of words) {
    const type = getCanonicalPropertyType(word)
    if (type) {
      parsed.propertyType = type as any
      hasFilter = true
      break
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 8. LISTING TYPE
  // ═══════════════════════════════════════════════════════════
  if (
    lower.includes('shitje') ||
    lower.includes('shitet') ||
    lower.includes('blerje') ||
    lower.includes('blej') ||
    lower.includes('sale')
  ) {
    parsed.listingType = 'sale'
    hasFilter = true
  } else if (
    lower.includes('qira') ||
    lower.includes('qera') ||
    lower.includes('qiramarrje') ||
    lower.includes('rent')
  ) {
    parsed.listingType = 'rent'
    hasFilter = true
  }

  // ═══════════════════════════════════════════════════════════
  // 9. FEATURES
  // ═══════════════════════════════════════════════════════════
  const foundFeatures: string[] = []
  for (const word of words) {
    const feature = getCanonicalFeature(word)
    if (feature && !foundFeatures.includes(feature)) {
      foundFeatures.push(feature)
    }
  }

  // Fuzzy matching për features
  if (foundFeatures.length === 0) {
    const allFeatureVariants = Object.values(FEATURE_VARIANTS).flat()
    for (const word of words) {
      if (word.length < 4) continue
      const match = findBestMatch(word, allFeatureVariants, 0.8)
      if (match) {
        const feature = getCanonicalFeature(match)
        if (feature && !foundFeatures.includes(feature)) {
          foundFeatures.push(feature)
        }
      }
    }
  }

  if (foundFeatures.length > 0) {
    parsed.features = foundFeatures
    hasFilter = true
  }[]

  // ═══════════════════════════════════════════════════════════
  // 10. KEYWORDS (të mbetura)
  // ═══════════════════════════════════════════════════════════
  const stopWords = [
    'nje', 'e', 'i', 'te', 'me', 'pa', 'per', 'ne', 'nga', 'deri',
    'me', 'dhe', 'ose', 'por', 'kjo', 'ky', 'ai', 'ajo', 'ato', 'ata',
    'eshte', 'jane', 'ishte', 'ishin', 'kam', 'ke', 'ka', 'kemi', 'keni',
    'kane', 'dua', 'do', 'deshiroj', 'shume', 'pak', 'mire', 'keq',
    'afer', 'larg', 'brenda', 'jashte',
  ]

  parsed.keywords = words
    .filter((w) => w.length > 2 && !stopWords.includes(w))
    .slice(0, 5)

  return hasFilter ? parsed : null
}

// ═══════════════════════════════════════════════════════════════
// HELPER
// ═══════════════════════════════════════════════════════════════

function parsePrice(numStr: string, unit?: string): number {
  let price = parseFloat(numStr.replace(',', '.'))
  const u = unit?.toLowerCase()

  if (u === 'k' || u === 'mije' || u === 'mij' || u === 'mijë') {
    price *= 1_000
  } else if (u === 'm' || u === 'milion' || u === 'miliona') {
    price *= 1_000_000
  }

  return Math.round(price)
}