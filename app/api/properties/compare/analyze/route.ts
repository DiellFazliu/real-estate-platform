import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { z } from 'zod'

import { prisma } from '@/lib/db/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/* ──────────────────────────────────────────────────────────────
   Request schema
   ────────────────────────────────────────────────────────────── */

const requestSchema = z.object({
  ids: z
    .array(z.coerce.number().int().positive())
    .min(2)
    .max(4),

  focus: z
    .enum(['general', 'buying', 'renting'])
    .default('general'),

  priorities: z
    .array(
      z.enum([
        'price',
        'space',
        'bedrooms',
        'amenities',
        'condition',
      ]),
    )
    .max(4)
    .default([]),
})

type Focus = z.infer<typeof requestSchema>['focus']
type Priority = z.infer<typeof requestSchema>['priorities'][number]

/* ──────────────────────────────────────────────────────────────
   Domain types
   ────────────────────────────────────────────────────────────── */

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

type Dimension = {
  key: string
  label: string
  priorityRelevant: boolean
  values: Array<{
    propertyId: number
    display: string
    isWinner: boolean
  }>
  winnerIds: number[]
}

type AnalysisPayload = {
  recommendation: {
    propertyId: number | null
    headline: string
    narrative: string
  }
  comparison: Dimension[]
  strengths: string[]
  tradeoffs: string[]
  caveats: string[]
}

/* ──────────────────────────────────────────────────────────────
   Label helpers
   ────────────────────────────────────────────────────────────── */

function focusLabel(focus: Focus) {
  if (focus === 'buying') return 'Blerje'
  if (focus === 'renting') return 'Qira'
  return 'Krahasim i përgjithshëm'
}

function priorityLabel(priority: Priority) {
  const map: Record<Priority, string> = {
    price: 'Çmimi',
    space: 'Hapësira',
    bedrooms: 'Dhomat e gjumit',
    amenities: 'Komoditetet',
    condition: 'Gjendja',
  }
  return map[priority]
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

function conditionRank(value: string | null): number {
  if (!value) return 0

  const key = value.trim().toLowerCase()

  const map: Record<string, number> = {
    new: 6,
    brand_new: 6,
    renovated: 5,
    excellent: 5,
    very_good: 5,
    good: 4,
    fair: 3,
    average: 3,
    'i ri': 6,
    'i renovuar': 5,
    'shumë i mirë': 5,
    'i mirë': 4,
    'i pranueshëm': 3,
    mesatar: 3,
    under_construction: 2,
    'në ndërtim': 2,
    needs_renovation: 1,
    renovation: 1,
    old: 1,
    'kërkon renovim': 1,
    'i vjetër': 1,
  }

  return map[key] ?? 0
}

const AMENITY_FIELDS = [
  'has_parking',
  'has_elevator',
  'has_garden',
  'has_pool',
  'has_air_conditioning',
  'has_heating',
  'has_security',
  'has_internet',
] as const

const AMENITY_LABELS: Record<typeof AMENITY_FIELDS[number], string> = {
  has_parking: 'Parking',
  has_elevator: 'Ashensor',
  has_garden: 'Kopsht',
  has_pool: 'Pishinë',
  has_air_conditioning: 'Klimë',
  has_heating: 'Ngrohje',
  has_security: 'Siguri',
  has_internet: 'Internet',
}

function countAmenities(property: Property): number {
  return AMENITY_FIELDS.filter((f) => property[f] === true).length
}

function formatPrice(price: number | null): string {
  if (price == null) return '—'
  return `€${price.toLocaleString('de-DE')}`
}

/* ──────────────────────────────────────────────────────────────
   Deterministic dimension computation
   ────────────────────────────────────────────────────────────── */

function computeDimensions(
  properties: Property[],
  priorities: Priority[],
): Dimension[] {
  const dimensions: Dimension[] = []

  // Price — lowest wins
  const priced = properties.filter((p) => p.price != null)
  if (priced.length > 0) {
    const min = Math.min(...priced.map((p) => p.price!))
    const winnerIds = priced
      .filter((p) => p.price === min)
      .map((p) => p.id)

    dimensions.push({
      key: 'price',
      label: 'Çmimi',
      priorityRelevant: priorities.includes('price'),
      values: properties.map((p) => ({
        propertyId: p.id,
        display: formatPrice(p.price),
        isWinner: winnerIds.includes(p.id),
      })),
      winnerIds,
    })
  }

  // Area — largest wins
  const withArea = properties.filter((p) => p.area != null)
  if (withArea.length > 0) {
    const max = Math.max(...withArea.map((p) => p.area!))
    const winnerIds = withArea
      .filter((p) => p.area === max)
      .map((p) => p.id)

    dimensions.push({
      key: 'area',
      label: 'Sipërfaqja',
      priorityRelevant: priorities.includes('space'),
      values: properties.map((p) => ({
        propertyId: p.id,
        display: p.area != null ? `${p.area} m²` : '—',
        isWinner: winnerIds.includes(p.id),
      })),
      winnerIds,
    })
  }

  // Bedrooms — most wins
  const withBedrooms = properties.filter((p) => p.bedrooms != null)
  if (withBedrooms.length > 0) {
    const max = Math.max(...withBedrooms.map((p) => p.bedrooms!))
    const winnerIds = withBedrooms
      .filter((p) => p.bedrooms === max)
      .map((p) => p.id)

    dimensions.push({
      key: 'bedrooms',
      label: 'Dhomat e gjumit',
      priorityRelevant: priorities.includes('bedrooms'),
      values: properties.map((p) => ({
        propertyId: p.id,
        display: p.bedrooms != null ? `${p.bedrooms}` : '—',
        isWinner: winnerIds.includes(p.id),
      })),
      winnerIds,
    })
  }

  // Condition — highest rank wins
  const withCondition = properties.filter((p) => p.condition != null)
  if (withCondition.length > 0) {
    const ranked = withCondition.map((p) => ({
      id: p.id,
      rank: conditionRank(p.condition),
    }))
    const maxRank = Math.max(...ranked.map((r) => r.rank))

    if (maxRank > 0) {
      const winnerIds = ranked
        .filter((r) => r.rank === maxRank)
        .map((r) => r.id)

      dimensions.push({
        key: 'condition',
        label: 'Gjendja',
        priorityRelevant: priorities.includes('condition'),
        values: properties.map((p) => ({
          propertyId: p.id,
          display: conditionLabel(p.condition) ?? '—',
          isWinner: winnerIds.includes(p.id),
        })),
        winnerIds,
      })
    }
  }

  // Amenities — most wins
  const counts = properties.map((p) => ({
    id: p.id,
    count: countAmenities(p),
  }))
  const maxAmenities = Math.max(...counts.map((c) => c.count))

  if (maxAmenities > 0) {
    const winnerIds = counts
      .filter((c) => c.count === maxAmenities)
      .map((c) => c.id)

    dimensions.push({
      key: 'amenities',
      label: 'Komoditetet',
      priorityRelevant: priorities.includes('amenities'),
      values: properties.map((p) => {
        const count = counts.find((c) => c.id === p.id)!.count
        return {
          propertyId: p.id,
          display: count > 0 ? `${count}` : '—',
          isWinner: winnerIds.includes(p.id),
        }
      }),
      winnerIds,
    })
  }

  return dimensions
}

/* ──────────────────────────────────────────────────────────────
   Recommendation (deterministic)
   ────────────────────────────────────────────────────────────── */

function pickRecommendation(
  properties: Property[],
  dimensions: Dimension[],
  priorities: Priority[],
  focus: Focus,
): Property | null {
  // Filter by transaction type when focus is buying/renting.
  let candidates = properties

  if (focus === 'buying') {
    const sale = properties.filter((p) => p.listing_type === 'sale')
    if (sale.length > 0) candidates = sale
    else return null
  }

  if (focus === 'renting') {
    const rent = properties.filter((p) => p.listing_type === 'rent')
    if (rent.length > 0) candidates = rent
    else return null
  }

  if (priorities.length === 0) {
    // No priorities: pick the property that wins the most dimensions.
    const scores = new Map<number, number>()
    for (const p of candidates) scores.set(p.id, 0)

    for (const dim of dimensions) {
      for (const id of dim.winnerIds) {
        if (scores.has(id)) {
          scores.set(id, (scores.get(id) ?? 0) + 1)
        }
      }
    }

    const sorted = [...candidates].sort(
      (a, b) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0),
    )

    const top = scores.get(sorted[0].id) ?? 0
    if (top === 0) return candidates[0]

    return sorted[0]
  }

  // Score by priority wins, tie-break by priority order.
  const scores = new Map<number, number>()
  for (const p of candidates) scores.set(p.id, 0)

  const priorityDimensions = priorities
    .map((priority) => {
      const key =
        priority === 'space' ? 'area' : priority === 'bedrooms' ? 'bedrooms' : priority
      return dimensions.find((d) => d.key === key)
    })
    .filter((d): d is Dimension => Boolean(d))

  for (const dim of priorityDimensions) {
    for (const id of dim.winnerIds) {
      if (scores.has(id)) {
        scores.set(id, (scores.get(id) ?? 0) + 1)
      }
    }
  }

  const sorted = [...candidates].sort((a, b) => {
    const scoreDiff = (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0)
    if (scoreDiff !== 0) return scoreDiff

    // Tie: check first priority dimension for a winner.
    if (priorityDimensions.length > 0) {
      const first = priorityDimensions[0]
      const aWins = first.winnerIds.includes(a.id)
      const bWins = first.winnerIds.includes(b.id)
      if (aWins !== bWins) return aWins ? -1 : 1
    }

    return 0
  })

  return sorted[0] ?? null
}

/* ──────────────────────────────────────────────────────────────
   Strengths / trade-offs / caveats
   ────────────────────────────────────────────────────────────── */

const DIMENSION_STRENGTH_LABEL: Record<string, string> = {
  price: 'Çmimi më i ulët',
  area: 'Sipërfaqja më e madhe',
  bedrooms: 'Më shumë dhoma gjumi',
  condition: 'Gjendja më e mirë',
  amenities: 'Më shumë komoditete',
}

const DIMENSION_TRADEOFF_LABEL: Record<string, string> = {
  price: 'Çmim më i lartë',
  area: 'Sipërfaqe më e vogël',
  bedrooms: 'Më pak dhoma gjumi',
  condition: 'Gjendje më e dobët',
  amenities: 'Më pak komoditete',
}

function computeStrengths(
  recommended: Property,
  dimensions: Dimension[],
): string[] {
  const out: string[] = []

  for (const dim of dimensions) {
    if (dim.winnerIds.includes(recommended.id)) {
      const label = DIMENSION_STRENGTH_LABEL[dim.key]
      if (label) out.push(label)
    }
  }

  return out.slice(0, 3)
}

function computeTradeoffs(
  recommended: Property,
  dimensions: Dimension[],
): string[] {
  const out: string[] = []

  for (const dim of dimensions) {
    if (
      dim.winnerIds.length > 0 &&
      !dim.winnerIds.includes(recommended.id)
    ) {
      const label = DIMENSION_TRADEOFF_LABEL[dim.key]
      if (label) out.push(label)
    }
  }

  return out.slice(0, 3)
}

function computeCaveats(properties: Property[]): string[] {
  const caveats: string[] = []

  const missingCondition = properties.filter((p) => p.condition == null)
  if (missingCondition.length > 0) {
    caveats.push(
      `${missingCondition.length} pronë/pronat nuk kanë gjendjen e deklaruar.`,
    )
  }

  const missingArea = properties.filter((p) => p.area == null)
  if (missingArea.length > 0) {
    caveats.push(
      `${missingArea.length} pronë/pronat nuk kanë sipërfaqen e deklaruar.`,
    )
  }

  const mixedTransaction =
    new Set(properties.map((p) => p.listing_type)).size > 1
  if (mixedTransaction) {
    caveats.push(
      'Pronat përfshijnë lloje të ndryshme transaksioni (shitje dhe qira).',
    )
  }

  return caveats.slice(0, 2)
}

/* ──────────────────────────────────────────────────────────────
   Deterministic headline / narrative (fallback + baseline)
   ────────────────────────────────────────────────────────────── */

function deterministicHeadline(
  recommended: Property | null,
  strengths: string[],
  focus: Focus,
): string {
  if (!recommended) {
    if (focus === 'buying') return 'Asnjë pronë në shitje'
    if (focus === 'renting') return 'Asnjë pronë në qira'
    return 'Analiza e pronave'
  }

  if (strengths.length === 0) {
    return `Zgjedhja: ${recommended.title}`
  }

  return strengths[0]
}

function deterministicNarrative(
  recommended: Property | null,
  strengths: string[],
  tradeoffs: string[],
  focus: Focus,
): string {
  if (!recommended) {
    if (focus === 'buying') {
      return 'Të gjitha pronat e përzgjedhura janë me qira, jo në shitje. Konsideroni kërkimin në listën e pronave në shitje.'
    }
    if (focus === 'renting') {
      return 'Të gjitha pronat e përzgjedhura janë në shitje, jo me qira. Konsideroni kërkimin në listën e pronave me qira.'
    }
    return 'Krahasimi bazohet në të dhënat e publikuara.'
  }

  const parts: string[] = []

  if (strengths.length > 0) {
    parts.push(
      `${recommended.title} ${strengths
        .slice(0, 2)
        .map((s) => s.toLowerCase())
        .join(' dhe ')}.`,
    )
  }

  if (tradeoffs.length > 0) {
    parts.push(
      `Kompromisi kryesor: ${tradeoffs
        .slice(0, 2)
        .map((t) => t.toLowerCase())
        .join(' dhe ')}.`,
    )
  }

  if (parts.length === 0) {
    return `${recommended.title} është zgjedhur bazuar në të dhënat e publikuara.`
  }

  return parts.join(' ')
}

/* ──────────────────────────────────────────────────────────────
   AI polish — writes only headline + narrative
   ────────────────────────────────────────────────────────────── */

const aiPolishSchema = z.object({
  headline: z.string().optional().default(''),
  narrative: z.string().optional().default(''),
})

const BANNED_AI_PATTERNS: RegExp[] = [
  /\barsyesh/i,
  /\bmjaftuesh/i,
  /\bp[ëe]rshtatsh/i,
  /\bideal/i,
  /\bperfekt/i,
  /\bTotalPrice\b/i,
  /\bAreaM2\b/i,
  /\bPricePerM2\b/i,
  /\bhas_[a-z_]+/i,
  /lagje\s+e\s+re/i,
  /lagje\s+elitare/i,
  /zon[ëe]\s+elitare/i,
  /prestigjioz/i,
  /ekskluziv/i,
  /cil[ëe]si\s+t[ëe]\s+lart/i,
  /\d{3,}\s*m²\s*(dhe|,)\s*\d+/i, // "81 m² dhe 121 m²" as a factual claim
]

function containsBanned(text: string): boolean {
  if (!text) return false
  return BANNED_AI_PATTERNS.some((p) => p.test(text))
}

type AIPolish = {
  headline: string
  narrative: string
}

async function polishWithAI(
  recommended: Property,
  allProperties: Property[],
  strengths: string[],
  tradeoffs: string[],
  priorities: Priority[],
  focus: Focus,
): Promise<AIPolish | null> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return null

  const groq = new Groq({ apiKey })

  const otherTitles = allProperties
    .filter((p) => p.id !== recommended.id)
    .map((p) => p.title)
    .join(' | ')

  const priorityList =
    priorities.length > 0
      ? priorities.map(priorityLabel).join(', ')
      : 'asnjë prioritet i zgjedhur'

  const prompt = `
Je asistent për Villaron, një platformë pronash në Kosovë.

Detyra jote: shkruaj NJË fjali titulli dhe NJË paragraf të shkurtër narrative për rekomandimin e një prone.

TË DHËNAT E VËRTETA (të llogaritura nga baza e të dhënave — nuk mund t'i ndryshosh):

Prona e rekomanduar: ${recommended.title}
- Çmimi: ${formatPrice(recommended.price)}
- Sipërfaqja: ${recommended.area ?? '—'} m²
- Dhomat: ${recommended.bedrooms ?? '—'}
- Gjendja: ${conditionLabel(recommended.condition) ?? '—'}

Pronat e tjera: ${otherTitles}

Prioritetet e përdoruesit: ${priorityList}
Fokusi: ${focusLabel(focus)}

Përparësitë e pronës së rekomanduar: ${strengths.join(', ') || 'asnjë'}
Kompromiset: ${tradeoffs.join(', ') || 'asnjë'}

RREGULLA:
1. Gjuha shqipe standarde.
2. headline: max 8 fjalë, përmbledh pse kjo pronë rekomandohet.
3. narrative: max 2 fjali të shkurtra, shpjegon arsyetimin.
4. MOS shpik asnjë fakt. Vetëm ato që janë dhënë më sipër.
5. MOS përdor fjalët: "arsyeshëm", "mjaftueshëm", "përshtatshëm", "ideal", "perfekt".
6. MOS përmend zona, lagje, ose cilësi ndërtimi.
7. MOS përdor emra fushash teknike (TotalPrice, AreaM2).
8. MOS vendos vlera në thonjëza.
9. Nëse kompromiset janë të pranishme, përmendi ato në narrative.
10. Kthe VETËM JSON të vlefshëm.

Format:
{
  "headline": "...",
  "narrative": "..."
}
`

  try {
    const response = await groq.chat.completions.create({
      model:
        process.env.PROPERTY_COMPARE_MODEL ??
        'openai/gpt-oss-120b',
      messages: [
        {
          role: 'system',
          content:
            'You write short Albanian real-estate recommendation text. You always reply with a single valid JSON object. All text is in Albanian. Never invent facts.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_completion_tokens: 800,
      reasoning_effort: 'low',
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) return null

    let json: unknown
    try {
      json = JSON.parse(content)
    } catch {
      const first = content.indexOf('{')
      const last = content.lastIndexOf('}')
      if (first === -1 || last === -1) return null
      try {
        json = JSON.parse(content.slice(first, last + 1))
      } catch {
        return null
      }
    }

    const parsed = aiPolishSchema.safeParse(json)
    if (!parsed.success) return null

    return {
      headline: parsed.data.headline.trim(),
      narrative: parsed.data.narrative.trim(),
    }
  } catch (error) {
    console.error('Groq polish error:', error)
    return null
  }
}

/* ──────────────────────────────────────────────────────────────
   POST handler
   ────────────────────────────────────────────────────────────── */

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

    // ─── Deterministic core ────────────────────────────────────
    const dimensions = computeDimensions(properties, priorities)
    const recommended = pickRecommendation(
      properties,
      dimensions,
      priorities,
      focus,
    )
    const strengths = recommended
      ? computeStrengths(recommended, dimensions)
      : []
    const tradeoffs = recommended
      ? computeTradeoffs(recommended, dimensions)
      : []
    const caveats = computeCaveats(properties)

    // Baseline: deterministic text.
    let headline = deterministicHeadline(
      recommended,
      strengths,
      focus,
    )
    let narrative = deterministicNarrative(
      recommended,
      strengths,
      tradeoffs,
      focus,
    )
    let source: 'ai' | 'fallback' = 'fallback'

    // ─── Optional AI polish ────────────────────────────────────
    if (recommended) {
      const polished = await polishWithAI(
        recommended,
        properties,
        strengths,
        tradeoffs,
        priorities,
        focus,
      )

      if (polished) {
        const headlineOk =
          polished.headline.length > 0 &&
          polished.headline.length <= 80 &&
          !containsBanned(polished.headline)

        const narrativeOk =
          polished.narrative.length > 0 &&
          polished.narrative.length <= 400 &&
          !containsBanned(polished.narrative)

        if (headlineOk) {
          headline = polished.headline
          source = 'ai'
        }

        if (narrativeOk) {
          narrative = polished.narrative
          source = 'ai'
        }
      }
    }

    const analysis: AnalysisPayload = {
      recommendation: {
        propertyId: recommended?.id ?? null,
        headline,
        narrative,
      },
      comparison: dimensions,
      strengths,
      tradeoffs,
      caveats,
    }

    return NextResponse.json({
      success: true,
      source,
      properties,
      analysis,
    })
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