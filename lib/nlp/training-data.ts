import { prisma } from '@/lib/db/prisma'

// ═══════════════════════════════════════════════════════════════
// CACHE PËR TRAINING DATA
// ═══════════════════════════════════════════════════════════════

let cachedCities: string[] = []
let cachedNeighborhoods: string[] = []
let cachedFeatures: string[] = []
let cachedPropertyTypes: string[] = []
let lastFetch = 0

const CACHE_TTL = 5 * 60 * 1000 // 5 minuta

// ═══════════════════════════════════════════════════════════════
// MERR TË DHËNAT NGA DATABAZA
// ═══════════════════════════════════════════════════════════════

export async function getTrainingData() {
  const now = Date.now()

  // Kthe nga cache nëse është fresh
  if (now - lastFetch < CACHE_TTL && cachedCities.length > 0) {
    return {
      cities: cachedCities,
      neighborhoods: cachedNeighborhoods,
      features: cachedFeatures,
      propertyTypes: cachedPropertyTypes,
    }
  }

  // Fetch nga DB
  const properties = await prisma.property.findMany({
    where: { status: 'PUBLISHED' },
    select: {
      city: true,
      neighborhood: true,
      features: true,
      property_type: true,
    },
  })

  // Ekstrakto unique values
  const cities = new Set<string>()
  const neighborhoods = new Set<string>()
  const features = new Set<string>()
  const propertyTypes = new Set<string>()

  for (const p of properties) {
    if (p.city) cities.add(p.city)
    if (p.neighborhood) neighborhoods.add(p.neighborhood)
    if (p.features) p.features.forEach((f) => features.add(f))
    if (p.property_type) propertyTypes.add(p.property_type)
  }

  cachedCities = Array.from(cities)
  cachedNeighborhoods = Array.from(neighborhoods)
  cachedFeatures = Array.from(features)
  cachedPropertyTypes = Array.from(propertyTypes)
  lastFetch = now

  return {
    cities: cachedCities,
    neighborhoods: cachedNeighborhoods,
    features: cachedFeatures,
    propertyTypes: cachedPropertyTypes,
  }
}

// ═══════════════════════════════════════════════════════════════
// KRIJO PROMPT DINAMIK
// ═══════════════════════════════════════════════════════════════

export async function buildDynamicPrompt() {
  const data = await getTrainingData()

  const citiesList = data.cities.join(', ') || 'Prishtina, Prizren, Peja'
  const neighborhoodsList = data.neighborhoods.join(', ') || 'Qendra, Dardania'
  const featuresList = data.features.join(', ') || 'elevator, parking, garden, pool'
  const typesList = data.propertyTypes.join(', ') || 'apartment, house, villa'

  return `You are a real estate search parser for Kosovo platform.

Extract filters from user query. Return ONLY JSON.

AVAILABLE VALUES IN DATABASE:
- Cities: ${citiesList}
- Neighborhoods: ${neighborhoodsList}
- Features: ${featuresList}
- Property Types: ${typesList}

Fields (omit if not present):
- bedrooms: number
- bathrooms: number
- minPrice: number (EUR)
- maxPrice: number (EUR)
- city: string (MUST match one of the cities above)
- neighborhood: string (MUST match one of the neighborhoods above)
- propertyType: apartment | house | villa | penthouse | studio | land | commercial | office
- listingType: sale | rent
- features: array (MUST match features above)
- keywords: array (translated to ENGLISH)
- confidence: number 0-1

TRANSLATE ALBANIAN TO ENGLISH:
luksoz = luxury
i bukur = beautiful
i qetë = quiet
modern = modern
i madh = large
i vogël = small
afër qendrës = near center
me pamje = with view
i re = new
i vjetër = old

EXAMPLES:
"3 bedroom apartment in Prishtina under 200k"
→ {"bedrooms":3,"city":"Prishtina","maxPrice":200000,"propertyType":"apartment","confidence":0.95}

"2 banjo me ashensor nën 150 mijë"
→ {"bathrooms":2,"maxPrice":150000,"features":["elevator"],"confidence":0.9}

"luksoz me pamje"
→ {"features":["view"],"keywords":["luxury"],"confidence":0.7}

"shtëpi me kopsht"
→ {"propertyType":"house","features":["garden"],"confidence":0.9}

Return ONLY valid JSON. No markdown.`
}

// ═══════════════════════════════════════════════════════════════
// CLEAR CACHE (për testing)
// ═══════════════════════════════════════════════════════════════

export function clearTrainingCache() {
  cachedCities = []
  cachedNeighborhoods = []
  cachedFeatures = []
  cachedPropertyTypes = []
  lastFetch = 0
}