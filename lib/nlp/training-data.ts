import { prisma } from '@/lib/db/prisma'
import { getFewShotPrompt } from './few-shot-examples'
import { SQ_EN_DICTIONARY } from './albanian-dictionary'
import { ALBANIAN_GRAMMAR_RULES } from './albanian-grammar'

// ═══════════════════════════════════════════════════════════════
// CACHE
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

  if (now - lastFetch < CACHE_TTL && cachedCities.length > 0) {
    return {
      cities: cachedCities,
      neighborhoods: cachedNeighborhoods,
      features: cachedFeatures,
      propertyTypes: cachedPropertyTypes,
    }
  }

  const properties = await prisma.property.findMany({
    where: { status: 'PUBLISHED' },
    select: {
      city: true,
      neighborhood: true,
      features: true,
      property_type: true,
    },
  })

  const cities = new Set<string>()
  const neighborhoods = new Set<string>()
  const features = new Set<string>()
  const propertyTypes = new Set<string>()

  for (const p of properties) {
    if (p.city) cities.add(p.city)
    if (p.neighborhood) neighborhoods.add(p.neighborhood)
    if (p.features) p.features.forEach((f: string) => features.add(f))
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
// BUILD DYNAMIC PROMPT ME FJALOR + FEW-SHOT + GRAMMAR
// ═══════════════════════════════════════════════════════════════

export async function buildDynamicPrompt() {
  const data = await getTrainingData()

  const citiesList = data.cities.length > 0
    ? data.cities.join(', ')
    : 'Prishtina, Prizren, Peja, Gjakova, Ferizaj, Gjilan, Mitrovica'

  const neighborhoodsList = data.neighborhoods.length > 0
    ? data.neighborhoods.join(', ')
    : 'Qendra, Dardania, Dragodan, Ulpiana, Lakrishte, Arberia, Bregu i Diellit'

  const featuresList = data.features.length > 0
    ? data.features.join(', ')
    : 'elevator, parking, garden, pool, air_conditioning, heating, security, internet, view'

  const typesList = data.propertyTypes.length > 0
    ? data.propertyTypes.join(', ')
    : 'apartment, house, villa, penthouse, studio, land, commercial, office'

  const fewShot = getFewShotPrompt()

  // Fjalor i shkurtër për prompt
  const dictionarySample = Object.entries(SQ_EN_DICTIONARY)
    .slice(0, 150)
    .map(([sq, en]) => `${sq} = ${en}`)
    .join('\n')

  return `Ti je një parser i kërkimeve për pasuri të patundshme në Kosovë.

DETYRA: Nxirr filtrat e strukturuar nga kërkimi i përdoruesit në shqip ose anglisht.

KTHE VETËM JSON VALID. Asnjë markdown, asnjë shpjegim.

═══════════════════════════════════════════════════════════════
FUSHAT E MUNDSHME (omit nëse nuk gjenden)
═══════════════════════════════════════════════════════════════

- bedrooms: number (numri minimal i dhomave)
- bathrooms: number (numri minimal i banjove)
- minPrice: number (EUR)
- maxPrice: number (EUR)
- city: string (DUHET të përputhet me një nga qytetet më poshtë)
- neighborhood: string (DUHET të përputhet me një nga lagjet më poshtë)
- propertyType: apartment | house | villa | penthouse | studio | land | commercial | office
- listingType: sale | rent
- features: array (DUHET të përputhet me veçoritë më poshtë)
- keywords: array (fjalë të tjera të dobishme, PËRKTHE në ANGLISHT)
- confidence: number (0-1, sa i sigurt je)

═══════════════════════════════════════════════════════════════
QYTETET E KOSOVËS (cities)
═══════════════════════════════════════════════════════════════
${citiesList}

═══════════════════════════════════════════════════════════════
LAGJET E PRISHTINËS (neighborhoods)
═══════════════════════════════════════════════════════════════
${neighborhoodsList}

═══════════════════════════════════════════════════════════════
VEÇORITË (features)
═══════════════════════════════════════════════════════════════
${featuresList}

═══════════════════════════════════════════════════════════════
TIPET E PRONAVE (property types)
═══════════════════════════════════════════════════════════════
${typesList}

═══════════════════════════════════════════════════════════════
FJALOR SHQIP → ANGLISHT (most common words)
═══════════════════════════════════════════════════════════════
${dictionarySample}

═══════════════════════════════════════════════════════════════
RREGULLA GRAMATIKORE
═══════════════════════════════════════════════════════════════

1. NUMRAT SHQIP:
   një=1, dy=2, tre=3, tri=3, katër=4, pesë=5, gjashtë=6,
   shtatë=7, tetë=8, nëntë=9, dhjetë=10

2. ÇMIMET:
   - "200k" → 200000
   - "1.5m" → 1500000
   - "150 mijë" → 150000
   - "2 milion" → 2000000
   - "nën X" / "deri X" / "maks X" → maxPrice
   - "mbi X" / "min X" / "nga X" → minPrice

3. DHOMAT:
   - "3 dhome" / "3 dhoma" / "3 dhomat" → bedrooms: 3
   - "2 banjo" / "2 banjot" → bathrooms: 2
   - "2+1" → bedrooms: 2, bathrooms: 1

4. TRANSAKSIONI:
   - "shitje" / "shitet" / "blej" / "blerje" → listingType: sale
   - "qira" / "qera" / "qiramarrje" / "me qira" → listingType: rent

5. PAMJET:
   - "me pamje" / "me pamje panoramike" → features: ["view"]

6. LUKSOZ:
   - "luksoz" / "luksoze" / "luks" → keywords: ["luxury"]

═══════════════════════════════════════════════════════════════
SHEMBUJ (Few-Shot Examples)
═══════════════════════════════════════════════════════════════

${fewShot}

═══════════════════════════════════════════════════════════════
TANI PARSE KËRKIMIN E PËRDORUESIT
═══════════════════════════════════════════════════════════════

KTHE VETËM JSON VALID. Pa markdown. Pa shpjegim.`
}

// ═══════════════════════════════════════════════════════════════
// CLEAR CACHE
// ═══════════════════════════════════════════════════════════════

export function clearTrainingCache() {
  cachedCities = []
  cachedNeighborhoods = []
  cachedFeatures = []
  cachedPropertyTypes = []
  lastFetch = 0
}