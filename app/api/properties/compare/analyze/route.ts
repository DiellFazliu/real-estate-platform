import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { z } from 'zod'

import { prisma } from '@/lib/db/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const requestSchema = z.object({
  ids: z
    .array(z.coerce.number().int().positive())
    .min(2)
    .max(4),

  focus: z
    .enum(['general', 'buying', 'renting', 'investment'])
    .default('general'),

  priorities: z
    .array(
      z.enum([
        'price',
        'space',
        'bedrooms',
        'location',
        'property_type',
        'amenities',
        'condition',
      ]),
    )
    .max(4)
    .default([]),
})

type Focus = z.infer<typeof requestSchema>['focus']
type Priority = z.infer<typeof requestSchema>['priorities'][number]

type Property = {
  id: number
  slug: string
  title: string
  price: number | null
  price_per_m2: number | null
  listing_type: string | null
  property_type: string | null
  city: string | null
  neighborhood: string | null
  location: string | null
  bedrooms: number | null
  bathrooms: number | null
  area: number | null
  balconies: number | null
  floor: number | null
  total_floors: number | null
  year_built: number | null
  renovation_year: number | null
  condition: string | null
  orientation: string | null
  furnished: boolean | null
  energy_class: string | null
  has_elevator: boolean | null
  has_parking: boolean | null
  has_garden: boolean | null
  has_pool: boolean | null
  has_air_conditioning: boolean | null
  has_heating: boolean | null
  has_security: boolean | null
  has_internet: boolean | null
  features: unknown
}

const DEFAULT_SUMMARY =
  'Krahasimi u bazua në të dhënat e publikuara të pronave dhe prioritetet e zgjedhura.'

const DEFAULT_HEADLINE = 'Analiza e pronave'

const DEFAULT_EXPLANATION =
  'Shihni arsyet kryesore dhe dallimet më poshtë.'

const aiResultSchema = z.object({
  recommendation: z
    .object({
      propertyId: z
        .union([z.number().int(), z.null()])
        .optional()
        .default(null),
      headline: z.string().optional().default(''),
      explanation: z.string().optional().default(''),
    })
    .optional()
    .default({
      propertyId: null,
      headline: '',
      explanation: '',
    }),

  summary: z.string().optional().default(''),

  keyReasons: z
    .array(
      z.object({
        propertyId: z.number().int(),
        title: z.string().optional().default(''),
        explanation: z.string().optional().default(''),
      }),
    )
    .optional()
    .default([]),

  comparisonHighlights: z
    .array(
      z.object({
        dimension: z.string().optional().default(''),
        propertyValues: z
          .array(
            z.object({
              propertyId: z.number().int(),
              value: z.string().optional().default(''),
              emphasis: z
                .enum(['positive', 'neutral', 'negative', 'important'])
                .optional()
                .default('neutral'),
            }),
          )
          .optional()
          .default([]),
        takeaway: z.string().optional().default(''),
      }),
    )
    .optional()
    .default([]),

  tradeoffs: z
    .array(
      z.object({
        propertyIds: z.array(z.number().int()).optional().default([]),
        title: z.string().optional().default(''),
        explanation: z.string().optional().default(''),
      }),
    )
    .optional()
    .default([]),

  considerations: z.array(z.string()).optional().default([]),
  uncertainty: z.array(z.string()).optional().default([]),
})

type AIResult = z.infer<typeof aiResultSchema>

type AnalysisPayload = {
  recommendation: {
    propertyId: number | null
    headline: string
    explanation: string
  }
  summary: string
  keyReasons: Array<{
    propertyId: number
    title: string
    explanation: string
  }>
  comparisonHighlights: Array<{
    dimension: string
    propertyValues: Array<{
      propertyId: number
      value: string
      emphasis: 'positive' | 'neutral' | 'negative' | 'important'
    }>
    takeaway: string
  }>
  tradeoffs: Array<{
    propertyIds: number[]
    title: string
    explanation: string
  }>
  considerations: string[]
  uncertainty: string[]
}

function listingLabel(value: string | null) {
  if (value === 'sale') return 'Në shitje'
  if (value === 'rent') return 'Me qira'
  return value ?? 'Nuk është deklaruar'
}

function conditionLabel(value: string | null): string | null {
  if (!value) return null

  const key = value.trim().toLowerCase()

  const map: Record<string, string> = {
    new: 'I ri',
    brand_new: 'I ri',
    excellent: 'Shumë i mirë',
    very_good: 'Shumë i mirë',
    good: 'I mirë',
    fair: 'I pranueshëm',
    average: 'Mesatar',
    needs_renovation: 'Kërkon renovim',
    renovation: 'Kërkon renovim',
    under_construction: 'Në ndërtim',
    renovated: 'I renovuar',
    old: 'I vjetër',
    'i ri': 'I ri',
    'i mirë': 'I mirë',
    'shumë i mirë': 'Shumë i mirë',
    'i pranueshëm': 'I pranueshëm',
    mesatar: 'Mesatar',
    'kërkon renovim': 'Kërkon renovim',
    'në ndërtim': 'Në ndërtim',
    'i renovuar': 'I renovuar',
    'i vjetër': 'I vjetër',
  }

  return map[key] ?? value
}

function mentionsPricePerM2(text: string): boolean {
  if (!text) return false

  const patterns = [
    /çmim(?:i|in|it|et)?\s+për\s+m²/i,
    /çmim(?:i|in|it|et)?\s+për\s+metër\s+katror/i,
    /€\s*[\d.,]+\s*(?:\/\s*m²|\s+për\s+m²)/i,
    /[\d.,]+\s*€\s*(?:\/\s*m²|\s+për\s+m²)/i,
    /[\d.,]+\s*€\s*\/\s*m²/i,
    /€\s*\/\s*m²/i,
  ]

  return patterns.some((p) => p.test(text))
}

const SOFT_WORD_PATTERNS: RegExp[] = [
  /\barsyesh/i,
  /\bmjaftuesh/i,
  /\bp[ëe]rshtatsh/i,
  /\bideal/i,
  /\bperfekt/i,
]

function containsSoftWord(text: string): boolean {
  if (!text) return false
  return SOFT_WORD_PATTERNS.some((p) => p.test(text))
}

/**
 * Field-name scrubber.
 *
 * The AI occasionally leaks camelCase field names from the AI context
 * JSON into prose ("TotalPrice është 58 000 €", "AreaM2 është 81").
 * Replace them with their Albanian prose equivalents.
 */
function scrubFieldNames(text: string): string {
  if (!text) return text

  return text
    .replace(/\bTotalPrice\b/gi, 'çmimi total')
    .replace(/\bPricePerM2\b/gi, 'çmimi për m²')
    .replace(/\bAreaM2\b/gi, 'sipërfaqja')
    .replace(/\bareaM2\b/g, 'sipërfaqja')
    .replace(/\brawType\b/gi, '')
    .replace(/\blisting_type\b/gi, 'lloji i transaksionit')
    .replace(/\bproperty_type\b/gi, 'lloji i pronës')
    .replace(/\benergy_class\b/gi, 'klasa e energjisë')
    .replace(/\badditionalFeatures\b/gi, '')
    .replace(/\bhas_[a-z_]+\b/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Strip quotes around translated condition labels.
 * "Gjendja është \"Shumë i mirë\"" → "Gjendja është Shumë i mirë"
 *
 * We only strip quotes around our own translated labels so we never
 * touch legitimate quoted content.
 */
const CONDITION_LABELS = [
  'I ri',
  'Shumë i mirë',
  'I mirë',
  'I pranueshëm',
  'Mesatar',
  'Kërkon renovim',
  'Në ndërtim',
  'I renovuar',
  'I vjetër',
]

function stripConditionQuotes(text: string): string {
  if (!text) return text

  let result = text

  for (const label of CONDITION_LABELS) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    result = result.replace(
      new RegExp(`["""'']${escaped}["""'']`, 'g'),
      label,
    )
  }

  return result
}

/**
 * Detect a false "larger area" comparative claim.
 *
 * Pattern observed: "AreaM2 është 81, më i madh se zyra (59 m²)
 * dhe shtëpia (121 m²)". 81 is not larger than 121.
 *
 * Heuristic:
 *   - text asserts the recommended is "më i madh" / "më e madhe"
 *   - text cites two or more "NN m²" values
 *   - at least one of the cited values (excluding the recommended's
 *     own area) is larger than the recommended's actual area
 */
function containsAreaOverstatement(
  text: string,
  recommended: Property,
): boolean {
  if (!text) return false
  if (!/m[ëe]\s+(i|e)\s+madh/i.test(text)) return false
  if (recommended.area == null) return false

  const cited: number[] = []
  for (const m of text.matchAll(/(\d+(?:[.,]\d+)?)\s*m²/g)) {
    const n = Number(m[1].replace(',', '.'))
    if (Number.isFinite(n)) cited.push(n)
  }

  const compared = cited.filter((v) => v !== recommended.area)

  return compared.some((v) => v > (recommended.area ?? 0))
}

/**
 * Remove hallucinated location-quality descriptors.
 *
 * Patterns like "lagje e re me cilësi të lartë ndërtimi" describe
 * characteristics that are never in the property data. We drop the
 * entire clause, then clean up whitespace.
 */
const LOCATION_QUALITY_CLAUSES: RegExp[] = [
  /\bn[ëe]\s+nj[ëe]\s+lagje\s+t[ëe]\s+re\s+me\s+[^.,;!?]+/gi,
  /\bn[ëe]\s+nj[ëe]\s+lagje\s+t[ëe]\s+re\b/gi,
  /\bn[ëe]\s+nj[ëe]\s+lagje\s+elitare\b/gi,
  /\bn[ëe]\s+nj[ëe]\s+lagje\s+t[ëe]\s+qet[ëe]\b/gi,
  /\bn[ëe]\s+nj[ëe]\s+zon[ëe]\s+elitare\b/gi,
  /\bn[ëe]\s+nj[ëe]\s+zon[ëe]\s+t[ëe]\s+k[ëe]rkuar\b/gi,
  /\bme\s+cil[ëe]si\s+t[ëe]\s+lart[ëe]\s+nd[ëe]rtimi\b/gi,
  /\bme\s+cil[ëe]si\s+t[ëe]\s+mir[ëe]\s+nd[ëe]rtimi\b/gi,
  /\bn[ëe]\s+nj[ëe]\s+ambient\s+t[ëe]\s+qet[ëe]\b/gi,
  /\bn[ëe]\s+nj[ëe]\s+ambient\s+elitar\b/gi,
  /\bprestigjioz[ea]?\b/gi,
  /\bekskluziv[ea]?\b/gi,
]

function scrubLocationQualityClaims(text: string): string {
  if (!text) return text

  let result = text

  for (const p of LOCATION_QUALITY_CLAUSES) {
    result = result.replace(p, '')
  }

  return result
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/,\s*\./g, '.')
    .replace(/\.\s*\./g, '.')
    .trim()
}

function scrubProseIds(
  text: string,
  properties: Property[],
): string {
  if (!text) return text

  let result = text

  for (const property of properties) {
    const idStr = String(property.id)

    const patterns: RegExp[] = [
      new RegExp(`\\bPron[ëa]?\\s+${idStr}\\b`, 'gi'),
      new RegExp(`\\bID(?:-ja)?\\s*[:\\-]?\\s*${idStr}\\b`, 'gi'),
      new RegExp(`#${idStr}\\b`, 'g'),
      new RegExp(`\\(${idStr}\\)`, 'g'),
    ]

    for (const re of patterns) {
      result = result.replace(re, property.title)
    }
  }

  return result
}

function buildAllowedPlaceVocabulary(
  properties: Property[],
): Set<string> {
  const context = buildAIContext(properties)
  const json = JSON.stringify(context)

  const allowed = new Set<string>()

  for (const raw of json.split(/[^\p{L}\p{N}]+/u)) {
    const clean = raw.toLowerCase()
    if (clean.length > 2) allowed.add(clean)
  }

  for (const common of [
    'në', 'ne', 'tek', 'afër', 'drejt', 'mbi', 'nën',
    'qyteti', 'lagjja', 'zona', 'rruga',
  ]) {
    allowed.add(common)
  }

  return allowed
}

function scrubInventedPlaces(
  text: string,
  allowedPlaces: Set<string>,
): string {
  if (!text) return text

  const prepPattern =
    /\b(në|ne|tek|nëpër|afër|drejt|mbi|nën)\s+(\p{Lu}\p{L}+)/gu

  return text
    .replace(prepPattern, (match, _prep, word: string) => {
      const normalized = word.toLowerCase()
      if (allowedPlaces.has(normalized)) return match
      return ''
    })
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim()
}

function buildAmenities(property: Property) {
  const definitions = [
    ['has_parking', 'Parking'],
    ['has_elevator', 'Ashensor'],
    ['has_garden', 'Kopsht'],
    ['has_pool', 'Pishinë'],
    ['has_air_conditioning', 'Klimë'],
    ['has_heating', 'Ngrohje'],
    ['has_security', 'Siguri'],
    ['has_internet', 'Internet'],
  ] as const

  return definitions
    .filter(([field]) => property[field] === true)
    .map(([, label]) => label)
}

function focusLabel(focus: Focus) {
  if (focus === 'buying') return 'Blerje'
  if (focus === 'renting') return 'Qira'
  if (focus === 'investment') return 'Investim'
  return 'Vendim i përgjithshëm'
}

function priorityLabel(priority: string) {
  const labels: Record<string, string> = {
    price: 'Çmimi',
    space: 'Hapësira',
    bedrooms: 'Dhomat e gjumit',
    location: 'Lokacioni',
    property_type: 'Lloji i pronës',
    amenities: 'Komoditetet',
    condition: 'Gjendja',
  }
  return labels[priority] ?? priority
}

function buildAIContext(properties: Property[]) {
  return properties.map((property) => ({
    id: property.id,
    title: property.title,

    transaction: {
      type: listingLabel(property.listing_type),
      rawType: property.listing_type,
      totalPrice: property.price,
      pricePerM2: property.price_per_m2,
    },

    property: {
      type: property.property_type,
      areaM2: property.area,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      balconies: property.balconies,
      floor: property.floor,
      totalFloors: property.total_floors,
      condition: conditionLabel(property.condition),
      yearBuilt: property.year_built,
      renovationYear: property.renovation_year,
      furnished: property.furnished,
      orientation: property.orientation,
      energyClass: property.energy_class,
    },

    location: {
      city: property.city,
      neighborhood: property.neighborhood,
      location: property.location,
    },

    amenities: buildAmenities(property),

    additionalFeatures: property.features,
  }))
}

function formatPriorityList(priorities: string[]) {
  if (priorities.length === 0) {
    return 'Nuk janë zgjedhur prioritete specifike.'
  }
  return priorities.map(priorityLabel).join(', ')
}

function buildFallback(
  properties: Property[],
  focus: Focus,
  priorities: string[],
): AnalysisPayload {
  const largest = properties
    .filter((p) => p.area != null)
    .sort((a, b) => (b.area ?? 0) - (a.area ?? 0))[0]

  const mostBedrooms = properties
    .filter((p) => p.bedrooms != null)
    .sort((a, b) => (b.bedrooms ?? 0) - (a.bedrooms ?? 0))[0]

  const saleProperties = properties.filter((p) => p.listing_type === 'sale')
  const rentalProperties = properties.filter((p) => p.listing_type === 'rent')

  const sameTransactionType =
    new Set(properties.map((p) => p.listing_type)).size <= 1

  const keyReasons: AnalysisPayload['keyReasons'] = []

  for (const priority of priorities) {
    if (priority === 'space' && largest) {
      keyReasons.push({
        propertyId: largest.id,
        title: 'Hapësira më e madhe',
        explanation: `${largest.title} ka sipërfaqen më të madhe të deklaruar: ${largest.area} m².`,
      })
    }

    if (priority === 'bedrooms' && mostBedrooms) {
      keyReasons.push({
        propertyId: mostBedrooms.id,
        title: 'Më shumë dhoma gjumi',
        explanation: `${mostBedrooms.title} ka numrin më të lartë të dhomave të gjumit të deklaruara: ${mostBedrooms.bedrooms}.`,
      })
    }

    if (priority === 'price' && properties.length > 0) {
      const sortedByPrice = properties
        .filter((p) => p.price != null)
        .sort((a, b) => (a.price ?? 0) - (b.price ?? 0))

      if (sortedByPrice.length > 0) {
        const cheapest = sortedByPrice[0]
        keyReasons.push({
          propertyId: cheapest.id,
          title: 'Çmimi total më i ulët',
          explanation: sameTransactionType
            ? `${cheapest.title} ka çmimin total më të ulët të deklaruar: €${cheapest.price?.toLocaleString()}.`
            : `${cheapest.title} ka çmimin total më të ulët të deklaruar, por pronat kanë lloje të ndryshme transaksioni dhe çmimet nuk janë drejtpërdrejt të krahasueshme.`,
        })
      }
    }

    if (priority === 'location' && properties.length > 0) {
      keyReasons.push({
        propertyId: properties[0].id,
        title: 'Lokacioni duhet të krahasohet',
        explanation:
          'Pronat kanë lokacione të deklaruara dhe nuk ka informacion të mjaftueshëm për të përcaktuar objektivisht se cili lokacion është më i përshtatshëm për ju.',
      })
    }

    if (priority === 'property_type' && properties.length > 0) {
      keyReasons.push({
        propertyId: properties[0].id,
        title: 'Llojet e pronave',
        explanation:
          'Lloji i pronës ndryshon mes listimeve dhe duhet të vlerësohet në lidhje me qëllimin tuaj.',
      })
    }

    if (priority === 'amenities' && properties.length > 0) {
      keyReasons.push({
        propertyId: properties[0].id,
        title: 'Komoditetet',
        explanation:
          'Komoditetet e deklaruara ndryshojnë mes pronave; krahasimi duhet të bazohet vetëm në ato që janë të listuara.',
      })
    }

    if (priority === 'condition' && properties.length > 0) {
      keyReasons.push({
        propertyId: properties[0].id,
        title: 'Gjendja',
        explanation:
          'Gjendja e deklaruara e pronave duhet të krahasohet pa supozuar kosto ose nevoja shtesë që nuk janë publikuar.',
      })
    }

    if (keyReasons.length >= 3) break
  }

  if (keyReasons.length === 0 && largest) {
    keyReasons.push({
      propertyId: largest.id,
      title: 'Hapësira',
      explanation: `${largest.title} ka sipërfaqen më të madhe të deklaruar: ${largest.area} m².`,
    })
  }

  if (
    keyReasons.length < 2 &&
    mostBedrooms &&
    !keyReasons.some(
      (r) =>
        r.propertyId === mostBedrooms.id &&
        r.title === 'Më shumë dhoma gjumi',
    )
  ) {
    keyReasons.push({
      propertyId: mostBedrooms.id,
      title: 'Dhomat e gjumit',
      explanation: `${mostBedrooms.title} ka ${mostBedrooms.bedrooms} dhoma gjumi të deklaruara.`,
    })
  }

  let recommendationPropertyId: number | null = null
  let recommendationHeadline = 'Krahasimi kërkon më shumë kontekst'
  let recommendationExplanation =
    'Nuk ka informacion të mjaftueshëm për të dhënë një rekomandim të vetëm pa bërë supozime për preferencat tuaja.'

  if (focus === 'buying' && saleProperties.length === 0) {
    recommendationHeadline = 'Asnjë pronë në shitje'
    recommendationExplanation =
      'Të gjitha pronat e përzgjedhura janë të listuara për qira, jo për shitje. Për një vendim blerjeje, konsideroni të kërkoni në listën e pronave në shitje.'
  }

  if (focus === 'renting' && rentalProperties.length === 0) {
    recommendationHeadline = 'Asnjë pronë në qira'
    recommendationExplanation =
      'Të gjitha pronat e përzgjedhura janë të listuara për shitje, jo për qira. Për një vendim qiraje, konsideroni të kërkoni në listën e pronave me qira.'
  }

  if (focus === 'buying' && saleProperties.length === 1) {
    recommendationPropertyId = saleProperties[0].id
    recommendationHeadline = 'E vetmja pronë e listuar për blerje'
    recommendationExplanation = `${saleProperties[0].title} është e vetmja nga pronat e përzgjedhura që është e listuar për shitje. Pronat me qira nuk janë alternativa direkte për një vendim blerjeje.`
  }

  if (focus === 'renting' && rentalProperties.length === 1) {
    recommendationPropertyId = rentalProperties[0].id
    recommendationHeadline = 'E vetmja pronë e listuar për qira'
    recommendationExplanation = `${rentalProperties[0].title} është e vetmja nga pronat e përzgjedhura që është e listuar për qira. Pronat në shitje nuk janë alternativa direkte për një vendim qiraje.`
  }

  const summary =
    properties.length > 1 && !sameTransactionType
      ? 'Pronat ndryshojnë edhe në llojin e transaksionit, prandaj çmimi i shitjes dhe çmimi i qirasë nuk duhet të krahasohen si të njëjtat njësi. Dallimet në hapësirë, dhoma, lokacion dhe karakteristika mund të krahasohen nga të dhënat e publikuara.'
      : 'Pronat ofrojnë kombinime të ndryshme të çmimit, hapësirës, lokacionit dhe karakteristikave. Zgjedhja varet nga qëllimi dhe prioritetet e përcaktuara.'

  const considerations: string[] = []

  if (priorities.includes('price') && !sameTransactionType) {
    considerations.push(
      'Çmimi i shitjes dhe çmimi mujor i qirasë nuk janë njësi të drejtpërdrejta krahasimi.',
    )
  }

  if (focus === 'investment') {
    considerations.push(
      'Nuk ka të dhëna të mjaftueshme për të vlerësuar kthimin financiar, të ardhurat nga qiraja, vlerësimin e ardhshëm ose kostot e investimit.',
    )
  }

  if (
    properties.some(
      (p) => p.city && p.location && p.city !== p.location,
    )
  ) {
    considerations.push(
      'Disa fusha të lokacionit mund të përfaqësojnë nivele të ndryshme të adresës; ato nuk duhet të interpretohen si të njëjta.',
    )
  }

  const uncertainty = [
    'Analiza AI nuk ishte e disponueshme në këtë kërkesë; rezultatet bazohen vetëm në të dhënat e publikuara.',
  ]

  return {
    recommendation: {
      propertyId: recommendationPropertyId,
      headline: recommendationHeadline,
      explanation: recommendationExplanation,
    },
    summary,
    keyReasons: keyReasons.slice(0, 3),
    comparisonHighlights: [],
    tradeoffs: [],
    considerations: considerations.slice(0, 2),
    uncertainty: uncertainty.slice(0, 2),
  }
}

function sanitizeAIResult(
  raw: AIResult,
  properties: Property[],
  focus: Focus,
  priorities: Priority[],
): AnalysisPayload | null {
  const allowedIds = new Set(properties.map((p) => p.id))
  const isAllowed = (id: number) => allowedIds.has(id)

  const priceIsFocus = priorities.includes('price')
  const pricePerM2IsForbidden =
    priceIsFocus && focus !== 'investment'

  const allowedPlaces = buildAllowedPlaceVocabulary(properties)

  const clean = (text: string): string => {
    if (!text) return text
    return scrubLocationQualityClaims(
      scrubInventedPlaces(
        stripConditionQuotes(
          scrubFieldNames(
            scrubProseIds(text, properties),
          ),
        ),
        allowedPlaces,
      ),
    )
  }

  const keyReasons = raw.keyReasons
    .filter((r) => {
      if (!isAllowed(r.propertyId)) return false
      if (!r.title.trim() || !r.explanation.trim()) return false
      if (containsSoftWord(r.title)) return false
      if (containsSoftWord(r.explanation)) return false

      // Reject reasons whose prose contradicts the actual area data.
      const recommended = properties.find((p) => p.id === r.propertyId)
      if (recommended) {
        if (
          containsAreaOverstatement(r.title, recommended) ||
          containsAreaOverstatement(r.explanation, recommended)
        ) {
          return false
        }
      }

      if (pricePerM2IsForbidden) {
        const combined = `${r.title} ${r.explanation}`
        if (mentionsPricePerM2(combined)) return false
      }

      return true
    })
    .slice(0, 3)
    .map((r) => ({
      propertyId: r.propertyId,
      title: clean(r.title.trim()),
      explanation: clean(r.explanation.trim()),
    }))

  const comparisonHighlights = raw.comparisonHighlights
    .map((h) => ({
      dimension: h.dimension.trim(),
      propertyValues: h.propertyValues
        .filter(
          (v) => isAllowed(v.propertyId) && v.value.trim().length > 0,
        )
        .slice(0, 4),
      takeaway: h.takeaway.trim(),
    }))
    .filter((h) => {
      if (
        h.dimension.length === 0 ||
        h.propertyValues.length === 0 ||
        h.takeaway.length === 0
      ) {
        return false
      }

      if (containsSoftWord(h.takeaway)) return false

      if (
        pricePerM2IsForbidden &&
        mentionsPricePerM2(h.dimension)
      ) {
        return false
      }

      return true
    })
    .slice(0, 3)
    .map((h) => ({
      dimension: clean(h.dimension),
      propertyValues: h.propertyValues.map((v) => ({
        propertyId: v.propertyId,
        value: v.value,
        emphasis: v.emphasis,
      })),
      takeaway: clean(h.takeaway),
    }))

  const tradeoffs = raw.tradeoffs
    .map((t) => ({
      propertyIds: t.propertyIds.filter(isAllowed).slice(0, 4),
      title: clean(t.title.trim()),
      explanation: clean(t.explanation.trim()),
    }))
    .filter(
      (t) =>
        t.propertyIds.length > 0 &&
        t.title.length > 0 &&
        t.explanation.length > 0,
    )
    .slice(0, 2)

  const considerations = raw.considerations
    .map((c) => clean(c.trim()))
    .filter((c) => c.length > 0)
    .slice(0, 2)

  const uncertainty = raw.uncertainty
    .map((u) => clean(u.trim()))
    .filter(
      (u) =>
        u.length > 0 &&
        !/AI nuk ishte i disponueshëm/i.test(u),
    )
    .slice(0, 2)

  const recommendationId =
    raw.recommendation.propertyId !== null &&
    isAllowed(raw.recommendation.propertyId)
      ? raw.recommendation.propertyId
      : null

  const headline = clean(raw.recommendation.headline.trim())
  let explanation = clean(raw.recommendation.explanation.trim())

  if (recommendationId !== null) {
    const recommended = properties.find((p) => p.id === recommendationId)

    if (
      recommended &&
      containsAreaOverstatement(explanation, recommended)
    ) {
      explanation = `${recommended.title} është propozuar bazuar në të dhënat e publikuara.`
    }
  }

  let summary = clean(raw.summary.trim())
  if (containsSoftWord(summary)) {
    summary = ''
  }

  if (
    headline.length === 0 &&
    explanation.length === 0 &&
    summary.length === 0 &&
    keyReasons.length === 0
  ) {
    return null
  }

  return {
    recommendation: {
      propertyId: recommendationId,
      headline: headline.length > 0 ? headline : DEFAULT_HEADLINE,
      explanation:
        explanation.length > 0 ? explanation : DEFAULT_EXPLANATION,
    },
    summary: summary.length > 0 ? summary : DEFAULT_SUMMARY,
    keyReasons,
    comparisonHighlights,
    tradeoffs,
    considerations,
    uncertainty,
  }
}

function aiDeclaredNoMatch(analysis: AnalysisPayload): boolean {
  if (analysis.recommendation.propertyId !== null) return false

  return /asnj[ëe]?\s+pron|nuk\s+ka\s+pron/i.test(
    analysis.recommendation.headline,
  )
}

function mergeWithFallback(
  ai: AnalysisPayload,
  fb: AnalysisPayload,
): AnalysisPayload {
  const noMatch = aiDeclaredNoMatch(ai)

  const recommendation =
    ai.recommendation.propertyId !== null ||
    ai.recommendation.headline !== DEFAULT_HEADLINE
      ? ai.recommendation
      : fb.recommendation

  const summary =
    ai.summary !== DEFAULT_SUMMARY ? ai.summary : fb.summary

  const keyReasons =
    ai.keyReasons.length > 0
      ? ai.keyReasons
      : noMatch
        ? []
        : fb.keyReasons

  const comparisonHighlights =
    ai.comparisonHighlights.length > 0
      ? ai.comparisonHighlights
      : noMatch
        ? []
        : fb.comparisonHighlights

  const tradeoffs =
    ai.tradeoffs.length > 0
      ? ai.tradeoffs
      : noMatch
        ? []
        : fb.tradeoffs

  const considerations =
    ai.considerations.length > 0
      ? ai.considerations
      : fb.considerations

  const uncertainty = ai.uncertainty

  return {
    recommendation,
    summary,
    keyReasons,
    comparisonHighlights,
    tradeoffs,
    considerations,
    uncertainty,
  }
}

async function analyzeWithAI(
  properties: Property[],
  focus: Focus,
  priorities: Priority[],
): Promise<AnalysisPayload | null> {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    return null
  }

  const groq = new Groq({ apiKey })

  const prompt = `
Ti je motori i analizës së vendimeve për Villaron, një platformë për prona të paluajtshme.

Qëllimi yt është të analizosh pronat e përzgjedhura dhe të ndihmosh përdoruesin të kuptojë dallimet, kompromiset dhe përshtatshmërinë sipas qëllimit dhe prioriteteve të tij.

==================================================
GJUHA — RREGULL ABSOLUT
==================================================

I GJITHË TEKSTI I GJENERUAR DUHET TË JETË NË SHQIP.

Kjo vlen për çdo fushë tekstuale.

Mos shkruaj në anglisht. Titujt e pronave mbeten saktësisht siç janë dhënë.

==================================================
MOS Cito EMRAT E FUSHAVE — RREGULL ABSOLUT
==================================================

NUK DUHET të shkruash KURRË emrat teknikë të fushave në tekstin e gjeneruar.

Shembuj të ndaluar:
- "TotalPrice është 58 000 €"
- "AreaM2 është 81"
- "PricePerM2 është..."
- "listing_type është..."
- "has_parking është..."

Variantet e saktë:
- "Çmimi total është 58 000 €."
- "Sipërfaqja është 81 m²."
- "Lloji i transaksionit është shitje."

==================================================
MOS VENDOS VLERA NË THONJËZA — RREGULL I RËNDËSISHËM
==================================================

Kur përshkruan gjendjen, klasën e energjisë, ose tipin, përdor gjuhë natyrore pa thonjëza.

Shembuj të ndaluar:
- 'Gjendja e listuar është "Shumë i mirë".'
- 'Klasa energjetike është "A+".'

Shembuj të saktë:
- "Gjendja e listuar është shumë e mirë."
- "Klasa energjetike është A+."

==================================================
FJALË TË NDALUARA — RREGULL I DETYRUAR
==================================================

KËTO fjalë NUK DUHET TË SHFAQEN KURRË në output:

- "i arsyeshëm", "e arsyeshme"
- "i mjaftueshëm", "e mjaftueshme"
- "i përshtatshëm", "e përshtatshme"
- "ideal", "ideale"
- "perfekt", "perfekte"
- "zgjedhja më e përshtatshme"

Në vend të tyre, jep numrin ose faktin konkret.

==================================================
KUR PRONA FITUESE NUK FITON ÇMIMIN — SHUMË E RËNDËSISHME
==================================================

Kur "Çmimi" është ndër prioritetet dhe prona e rekomanduar NUK ka çmimin total më të ulët, explanation NUK DUHET TË THOTË se prioriteti i çmimit është përmbushur.

RREGULLI:
- Nëse prona e rekomanduar NUK ka çmimin më të ulët, explanation DUHET të përmendë që çmimi nuk është më i ulëti dhe të përmendë cilën pronë e ka më të ulët.
- Nëse prona e rekomanduar NUK ka sipërfaqen më të madhe, explanation DUHET ta përmendë këtë.
- Nëse prona e rekomanduar NUK ka numrin më të lartë të dhomave, explanation DUHET ta përmendë këtë.

==================================================
MOS SHPIK KARAKTERISTIKA TË LOKACIONIT — RREGULL ABSOLUT
==================================================

NUK DUHET të përshkruash KURRË karakteristika të një lokacioni që nuk shfaqen në PROPERTY DATA.

Shembuj të ndaluar:
- "lagje e re me cilësi të lartë ndërtimi"
- "lagje elitare"
- "zonë e qetë"
- "lagje e kërkuar"
- "ambient prestigjioz"
- "zonë ekskluzive"

Nëse nuk ka të dhëna për karakteristikat e lokacionit, MOS PËRSHKRUAJ ATË.

==================================================
MOS SHPIK EMRAT E LOKACIONEVE — RREGULL ABSOLUT
==================================================

Kur i referohesh lokacionit, përdor VETËM vlerat që shfaqen në PROPERTY DATA.

==================================================
NDALIM ID-SH NË TEKST
==================================================

NUK DUHET të shkruash KURRË numrin identifikues (id) të një prone në tekst.

==================================================
NDALIM HALLUCINIMI — SHUMË KRITIKE
==================================================

Mund të përmendësh VETËM fakte që shfaqen drejtpërdrejt në PROPERTY DATA.

MOS PËRDOR NJOHURI TË JASHTME:
- Mos supozo se një lagje është "qendrore", "e qetë", "elitare".
- Mos vlerëso distancat, aksesin, shkollat, transportin.

==================================================
PARIMET E ANALIZËS
==================================================

- Analizo gjithmonë pronat, edhe kur ato janë shumë të ndryshme.
- Përdor prioritetet e zgjedhura nga përdoruesi.
- Mos shpik asnjë fakt.
- Mos krijo pikëzim 0-100.

==================================================
KUFIJTË E FAKTEVE
==================================================

Mos pretendo ose nxirr nga supozimi:
- rritje të ardhshme të çmimit
- fitim financiar
- ROI, yield
- taksa, kosto renovimi, kosto mirëmbajtjeje
- vlerë rishitjeje, kërkesë të tregut
- kthim të investimit

==================================================
LLOJI I TRANSAKSIONIT
==================================================

"sale" / "Në shitje" = pronë për blerje.
"rent" / "Me qira" = pronë për qira.

Mos krahaso çmim shitjeje me çmim mujor qiraje.

Nëse fokusi është BLERJE dhe asnjë pronë nuk është në shitje:
- propertyId: null
- headline: "Asnjë pronë në shitje"
- keyReasons, comparisonHighlights, tradeoffs: [] bosh

Nëse fokusi është QIRA dhe asnjë pronë nuk është me qira:
- propertyId: null
- headline: "Asnjë pronë në qira"
- keyReasons, comparisonHighlights, tradeoffs: [] bosh

==================================================
PRIORITETET
==================================================

Fokusi i përdoruesit:
${focusLabel(focus)}

Prioritetet:
${formatPriorityList(priorities)}

==================================================
RREGULL ABSOLUT PËR "ÇMIMI"
==================================================

Nëse "Çmimi" është ndër prioritetet:

1. Përdor ÇMIMIN TOTAL (transaction.totalPrice).
2. ÇMIMI PËR M² ËSHTË I NDALUAR në output.
3. NUK DUHET të bësh krahasime për çmimin për m².
4. Për vlerë ndaj hapësirës, përdor vetëm sipërfaqen në m².

==================================================
REKOMANDIMI
==================================================

Rekomandimi duhet të përdorë emrin e saktë të llojit të pronës:
- "apartment" → "ky apartament", "kjo banesë"
- "house" → "kjo shtëpi"
- "villa" → "kjo vilë"
- "land" → "kjo tokë"
- "commercial" → "ky lokal"
- "office" → "kjo zyrë"

==================================================
PROPERTY DATA
==================================================

${JSON.stringify(buildAIContext(properties), null, 2)}

==================================================
OUTPUT — RREGULLA TË DETYRUESHME
==================================================

Kthe VETËM një objekt JSON valid.

Të gjitha fushat kryesore duhet të ekzistojnë gjithmonë.

ASNJËHERË mos e lër jashtë:
- comparisonHighlights
- tradeoffs
- considerations
- uncertainty

Mos e ndërprit JSON-in para se të përfundojë objekti.

BUXHETI I TEKSTIT:
- headline: max 12 fjalë
- explanation: max 2 fjali të shkurtra
- summary: max 2 fjali të shkurtra
- keyReasons: 1-3
- comparisonHighlights: max 2
- tradeoffs: max 2
- considerations: max 2
- uncertainty: max 2

Struktura:

{
  "recommendation": {
    "propertyId": 123,
    "headline": "titull i shkurtër në shqip",
    "explanation": "maksimumi 2 fjali në shqip"
  },
  "summary": "maksimumi 2 fjali në shqip",
  "keyReasons": [
    {
      "propertyId": 123,
      "title": "arsye e shkurtër në shqip",
      "explanation": "evidencë konkrete"
    }
  ],
  "comparisonHighlights": [
    {
      "dimension": "Çmimi total",
      "propertyValues": [
        {
          "propertyId": 123,
          "value": "233 000 €",
          "emphasis": "positive"
        }
      ],
      "takeaway": "përfundim i shkurtër"
    }
  ],
  "tradeoffs": [],
  "considerations": [],
  "uncertainty": []
}

RREGULLAT:

- recommendation.propertyId: ID nga PROPERTY DATA ose null.
- Çdo tekst në shqip.
- Çdo pretendim i bazuar në PROPERTY DATA.
- Çdo propertyId ekziston në PROPERTY DATA.
`

  const response = await groq.chat.completions.create({
    model:
      process.env.PROPERTY_COMPARE_MODEL ??
      'openai/gpt-oss-120b',

    messages: [
      {
        role: 'system',
        content:
          'You are a real-estate decision-support engine. You always reply with a single valid JSON object matching the requested schema. All human-readable text must be in Albanian. Never truncate the JSON. Never write camelCase field names (TotalPrice, AreaM2, pricePerM2, listing_type) or numeric property IDs in prose. Never put condition, energy class, or transaction type values in quotes. Only reference locations that appear verbatim in the property data, and never invent characteristics of a location (no "lagje e re", "elitare", "prestigjioze", "cilësi e lartë ndërtimi"). When a recommended property does not satisfy one of the user priorities, disclose this honestly as a trade-off rather than spinning it as a strength, and name the failed priority in the recommendation explanation. Never use soft marketing words like "i arsyeshëm", "i mjaftueshëm", "i përshtatshëm", "ideal", "perfekt", or "zgjedhja më e përshtatshme". Never invent amenities, energy classes, conditions, locations, or features. When the user prioritises price, compare total listed price only and NEVER mention price per square meter. Match grammatical gender and noun to the actual property_type.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],

    temperature: 0.2,
    max_completion_tokens: 2000,
    reasoning_effort: 'low',
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content

  if (!content) {
    return null
  }

  let json: unknown
  try {
    json = JSON.parse(content)
  } catch {
    const firstBrace = content.indexOf('{')
    const lastBrace = content.lastIndexOf('}')
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      return null
    }
    try {
      json = JSON.parse(content.slice(firstBrace, lastBrace + 1))
    } catch {
      return null
    }
  }

  const parsed = aiResultSchema.safeParse(json)

  if (!parsed.success) {
    console.error(
      'AI comparison output failed schema validation:',
      parsed.error.flatten(),
    )
    return null
  }

  return sanitizeAIResult(parsed.data, properties, focus, priorities)
}

export async function POST(request: NextRequest) {
  try {
    const parsed = requestSchema.safeParse(await request.json())

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Të dhënat e krahasimit nuk janë valide.',
        },
        { status: 400 },
      )
    }

    const { ids, focus, priorities } = parsed.data

    const dbProperties = await prisma.property.findMany({
      where: {
        id: { in: ids },
        status: 'PUBLISHED',
        review_status: 'APPROVED',
      },
      select: {
        id: true,
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
        balconies: true,
        floor: true,
        total_floors: true,
        year_built: true,
        renovation_year: true,
        condition: true,
        orientation: true,
        furnished: true,
        energy_class: true,
        has_elevator: true,
        has_parking: true,
        has_garden: true,
        has_pool: true,
        has_air_conditioning: true,
        has_heating: true,
        has_security: true,
        has_internet: true,
        features: true,
      },
    })

    if (dbProperties.length !== ids.length) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Një ose më shumë prona nuk janë më të disponueshme për krahasim.',
        },
        { status: 400 },
      )
    }

    const properties = ids.map((id) => {
      const property = dbProperties.find((item) => item.id === id)!

      return {
        ...property,
        price: property.price == null ? null : Number(property.price),
        price_per_m2:
          property.price_per_m2 == null
            ? null
            : Number(property.price_per_m2),
      }
    }) as Property[]

    const fallback = buildFallback(properties, focus, priorities)

    try {
      const ai = await analyzeWithAI(properties, focus, priorities)

      if (ai) {
        const merged = mergeWithFallback(ai, fallback)

        return NextResponse.json({
          success: true,
          source: 'ai',
          properties,
          analysis: merged,
        })
      }

      return NextResponse.json({
        success: true,
        source: 'fallback',
        properties,
        analysis: fallback,
      })
    } catch (error) {
      console.error(
        'Property comparison AI error; using fallback:',
        error,
      )

      return NextResponse.json({
        success: true,
        source: 'fallback',
        properties,
        analysis: fallback,
      })
    }
  } catch (error) {
    console.error('Property comparison request error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Analiza e krahasimit nuk mund të përfundonte.',
      },
      { status: 500 },
    )
  }
}