import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { z } from 'zod'

import { prisma } from '@/lib/db/prisma'

export const runtime = 'nodejs'

const prioritySchema = z.enum(['price', 'space', 'location', 'bedrooms', 'amenities'])

const requestSchema = z.object({
  ids: z.array(z.coerce.number().int().positive()).min(2).max(4),
  priorities: z.array(prioritySchema).min(1).max(4),
})

const insightSchema = z.object({
  summary: z.string().min(1).max(500),
  mainTradeoff: z.string().min(1).max(500),
  propertyExplanations: z.array(z.object({
    propertyId: z.number().int().positive(),
    explanation: z.string().min(1).max(300),
  })).min(1).max(4),
  dataIssues: z.array(z.object({
    field: z.string().min(1).max(100),
    issue: z.string().min(1).max(500),
    severity: z.enum(['low', 'medium', 'high']),
  })).max(5),
  verify: z.array(z.object({
    topic: z.string().min(1).max(160),
    reason: z.string().min(1).max(500),
  })).max(6),
})

type Priority = z.infer<typeof prioritySchema>
type DataIssue = z.infer<typeof insightSchema>['dataIssues'][number]
type DimensionScore = { priority: Priority; score: number | null; note?: string }
type RankingItem = { propertyId: number; rank: number | null; score: number | null; dimensions: DimensionScore[] }
type DeterministicResult = { ranking: RankingItem[]; dataIssues: DataIssue[] }

const amenityFields = [
  'has_elevator',
  'has_parking',
  'has_garden',
  'has_pool',
  'has_air_conditioning',
  'has_heating',
  'has_security',
  'has_internet',
] as const

const residentialTypes = new Set(['house', 'villa', 'apartment', 'residential'])

function buildDataIssues(properties: any[]): DataIssue[] {
  const issues: DataIssue[] = []
  const currentYear = new Date().getFullYear()

  for (const property of properties) {
    const locationParts = [property.location, property.neighborhood, property.city]
      .filter(Boolean)
      .map((value) => String(value).trim().toLowerCase())

    if (
      locationParts.some((value) => value.includes('new york')) &&
      property.city &&
      !String(property.city).toLowerCase().includes('new york')
    ) {
      issues.push({
        field: 'Lokacioni',
        issue: `${property.title} ka informacion lokacioni që nuk përputhet qartë mes fushave të listing-ut.`,
        severity: 'high',
      })
    }

    if (property.year_built != null && property.year_built > currentYear) {
      issues.push({
        field: 'Viti i ndërtimit',
        issue: `${property.title} ka një vit ndërtimi të ardhshëm të deklaruar (${property.year_built}).`,
        severity: 'high',
      })
    }

    if (
      property.renovation_year != null &&
      property.year_built != null &&
      property.renovation_year < property.year_built
    ) {
      issues.push({
        field: 'Viti i rinovimit',
        issue: `${property.title} ka një vit rinovimi (${property.renovation_year}) më të hershëm se viti i ndërtimit (${property.year_built}).`,
        severity: 'medium',
      })
    }

    if (property.area != null && Number(property.area) <= 0) {
      issues.push({
        field: 'Sipërfaqja',
        issue: `${property.title} ka një sipërfaqe jo të vlefshme të deklaruar.`,
        severity: 'high',
      })
    }

    if (property.price != null && Number(property.price) <= 0) {
      issues.push({
        field: 'Çmimi',
        issue: `${property.title} ka një çmim jo të vlefshëm të deklaruar.`,
        severity: 'high',
      })
    }
  }

  return issues.slice(0, 5)
}

function normalizeHigher(value: number, values: number[]) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  if (max === min) return 100
  return Math.round(((value - min) / (max - min)) * 100)
}

function normalizeLower(value: number, values: number[]) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  if (max === min) return 100
  return Math.round(((max - value) / (max - min)) * 100)
}

function calculateRanking(properties: any[], priorities: Priority[]): DeterministicResult {
  const dataIssues = buildDataIssues(properties)
  const mixedListingTypes = new Set(properties.map((property) => property.listing_type)).size > 1
  const cities = properties.map((property) => property.city).filter(Boolean)
  const sameCity = new Set(cities.map((city) => String(city).toLowerCase())).size <= 1

  // Price is comparable only within the same listing type.
  // Mixed sale/rental comparisons remain useful: the price dimension is
  // scored when at least two properties share the same listing type.
  const pricesByListingType = new Map<string, number[]>()

  for (const property of properties) {
    const value = Number(property.price)
    if (!Number.isFinite(value) || value <= 0) continue

    const listingType = String(property.listing_type ?? 'unknown').toLowerCase()
    const values = pricesByListingType.get(listingType) ?? []
    values.push(value)
    pricesByListingType.set(listingType, values)
  }

  const areaValues = properties
    .map((property) => Number(property.area))
    .filter((value) => Number.isFinite(value) && value > 0)

  const bedroomValues = properties
    .filter((property) => residentialTypes.has(String(property.property_type ?? '').toLowerCase()))
    .map((property) => Number(property.bedrooms))
    .filter((value) => Number.isFinite(value) && value >= 0)

  const amenityCounts = properties.map((property) =>
    amenityFields.reduce((count, field) => count + (property[field] === true ? 1 : 0), 0),
  )

  const ranking: RankingItem[] = properties.map((property) => {
    const dimensions: DimensionScore[] = priorities.map((priority) => {
      if (priority === 'price') {
        if (property.price == null || Number(property.price) <= 0) {
          return { priority, score: null, note: 'Çmimi nuk është deklaruar' }
        }

        const listingType = String(property.listing_type ?? 'unknown').toLowerCase()
        const comparablePrices = pricesByListingType.get(listingType) ?? []

        if (comparablePrices.length < 2) {
          return {
            priority,
            score: null,
            note: mixedListingTypes
              ? 'Nuk ka mjaft prona me të njëjtin lloj listimi'
              : 'Të dhëna të pamjaftueshme',
          }
        }

        return {
          priority,
          score: normalizeLower(Number(property.price), comparablePrices),
          note: mixedListingTypes ? 'Krahasuar brenda të njëjtit lloj listimi' : undefined,
        }
      }

      if (priority === 'space') {
        if (areaValues.length < 2 || property.area == null || Number(property.area) <= 0) {
          return { priority, score: null, note: 'Të dhëna të pamjaftueshme' }
        }
        return { priority, score: normalizeHigher(Number(property.area), areaValues) }
      }

      if (priority === 'location') {
        if (sameCity) return { priority, score: 100, note: 'I njëjti qytet' }
        return { priority, score: null, note: 'Nuk ka preferencë qyteti të specifikuar' }
      }

      if (priority === 'bedrooms') {
        const isResidential = residentialTypes.has(String(property.property_type ?? '').toLowerCase())
        if (!isResidential || bedroomValues.length < 2 || property.bedrooms == null) {
          return { priority, score: null, note: !isResidential ? 'Nuk aplikohet' : 'Të dhëna të pamjaftueshme' }
        }
        return { priority, score: normalizeHigher(Number(property.bedrooms), bedroomValues) }
      }

      const count = amenityCounts[properties.findIndex((item) => item.id === property.id)]
      return {
        priority,
        score: normalizeHigher(count, amenityCounts),
        note: `${count}/${amenityFields.length} komoditete të deklaruara`,
      }
    })

    const applicableScores = dimensions.map((item) => item.score).filter((score): score is number => score !== null)
    const score = applicableScores.length
      ? Math.round(applicableScores.reduce((sum, value) => sum + value, 0) / applicableScores.length)
      : null

    return {
      propertyId: property.id,
      rank: null,
      score,
      dimensions,
    }
  })

  ranking.sort((a, b) => {
    if (a.score === null && b.score === null) return 0
    if (a.score === null) return 1
    if (b.score === null) return -1
    return b.score - a.score
  })

  let nextRank = 1

  ranking.forEach((item) => {
    item.rank = item.score === null ? null : nextRank++
  })

  return { ranking, dataIssues }
}

function buildFallback(properties: any[], priorities: Priority[], deterministic: DeterministicResult) {
  const mixedListingTypes = new Set(properties.map((property) => property.listing_type)).size > 1
  const cities = Array.from(new Set(properties.map((property) => property.city).filter(Boolean)))
  const ranking = deterministic.ranking

  const top = ranking.find((item) => item.score !== null)
  const topProperty = properties.find((property) => property.id === top?.propertyId)

  const propertyExplanations = ranking.map((item) => {
    const property = properties.find((candidate) => candidate.id === item.propertyId)
    const strongest = [...item.dimensions]
      .filter((dimension) => dimension.score !== null)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0]
    const priorityLabel = strongest
      ? { price: 'çmimin', space: 'hapësirës', location: 'lokacionit', bedrooms: 'dhomave të gjumit', amenities: 'komoditeteve' }[strongest.priority]
      : 'prioriteteve'

    return {
      propertyId: item.propertyId,
      explanation: property && item.score !== null
        ? `Përputhja e llogaritur është ${item.score}%, me kontributin më të fortë nga ${priorityLabel}.`
        : 'Nuk ka mjaft të dhëna të krahasueshme për një përputhje të plotë.',
    }
  })

  let mainTradeoff = 'Pronat ndryshojnë në karakteristikat që lidhen me prioritetet e zgjedhura.'
  if (mixedListingTypes) {
    mainTradeoff = 'Ka lloje të ndryshme listimi; çmimet e shitjes dhe qirasë nuk trajtohen si e njëjta metrikë. Kur është e mundur, çmimi krahasohet vetëm brenda të njëjtit lloj listimi.'
  } else if (priorities.includes('location') && cities.length > 1) {
    mainTradeoff = `Pronat ndodhen në qytete të ndryshme (${cities.join(', ')}), ndaj lokacioni nuk renditet pa një qytet të preferuar.`
  } else if (topProperty && priorities.includes('space')) {
    mainTradeoff = `${topProperty.title} ka përputhje të lartë me kriteret e llogaritshme, por sipërfaqja duhet të lexohet së bashku me prioritetet e tjera.`
  }

  return {
    summary: topProperty && top?.score !== null
      ? `${topProperty.title} del i pari sipas përputhjes së llogaritur me prioritetet e zgjedhura.`
      : 'Krahasimi nuk ka mjaft të dhëna të krahasueshme për të dhënë një renditje të plotë.',
    mainTradeoff,
    propertyExplanations,
    ranking,
    dataIssues: deterministic.dataIssues,
    verify: deterministic.dataIssues.map((issue) => ({ topic: issue.field, reason: issue.issue })),
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = requestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Të dhënat e krahasimit nuk janë valide.' },
        { status: 400 },
      )
    }

    const { ids, priorities } = parsed.data

    const dbProperties = await prisma.property.findMany({
      where: {
        id: { in: ids },
        status: 'PUBLISHED',
        review_status: 'APPROVED',
      },
      select: {
        id: true,
        title: true,
        slug: true,
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

    if (dbProperties.length < 2) {
      return NextResponse.json(
        { success: false, error: 'Nuk ka mjaft prona valide për krahasim.' },
        { status: 400 },
      )
    }

    const properties = ids
      .map((id) => dbProperties.find((property) => property.id === id))
      .filter(Boolean)
      .map((property) => ({
        ...property,
        price: Number(property!.price),
        price_per_m2: property!.price_per_m2 !== null ? Number(property!.price_per_m2) : null,
      }))

    const deterministic = calculateRanking(properties, priorities)
    const fallback = buildFallback(properties, priorities, deterministic)
    const apiKey = process.env.GROQ_API_KEY

    if (!apiKey) {
      return NextResponse.json({ success: true, source: 'fallback', result: fallback })
    }

    const prompt = `
You are the AI explanation layer for Villaron's property comparison feature.

The application has ALREADY calculated the ranking and dimension scores deterministically.
Your job is ONLY to explain that result concisely and factually.

Reply ONLY in Albanian and return valid JSON matching the schema.

USER PRIORITIES:
${JSON.stringify(priorities)}

DETERMINISTIC RANKING:
${JSON.stringify(deterministic.ranking, null, 2)}

DATA ISSUES:
${JSON.stringify(deterministic.dataIssues, null, 2)}

PROPERTIES:
${JSON.stringify(properties, null, 2)}

RULES:
- Use only supplied property data and the deterministic ranking.
- Do not change the ranking, scores, or ranks.
- Do not invent facts.
- Do not calculate another score.
- Do not introduce market information, valuations, investment returns, rental yield, financing, maintenance costs, utility costs, legal conclusions, or unsupported location claims.
- Do not claim that one property is objectively better.
- Explain why each property's calculated result looks the way it does, using only visible differences in the supplied data.
- Keep the summary to 1-2 sentences.
- Keep the main trade-off to 1-2 sentences.
- Give one concise explanation per property.
- If listing types are mixed, explicitly say that sale and rental prices are not directly comparable. If a price score exists, explain that it was calculated only against properties with the same listing type. If a listing type has only one property, its price dimension remains unavailable.
- If cities differ and no preferred city was supplied, say that location was not numerically ranked.
- A null value means unavailable, not zero.
- Only report genuine data inconsistencies supplied by the deterministic data checks.

OUTPUT:
{
  "summary": "1-2 fjali.",
  "mainTradeoff": "1-2 fjali.",
  "propertyExplanations": [
    { "propertyId": 1, "explanation": "Shpjegim i shkurtër." }
  ],
  "dataIssues": [],
  "verify": []
}
`

    try {
      const groq = new Groq({ apiKey })
      const response = await groq.chat.completions.create({
        model: process.env.PROPERTY_COMPARE_MODEL ?? 'qwen/qwen3.8-27b',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      })

      const raw = response.choices[0]?.message?.content
      if (!raw) throw new Error('Empty comparison AI response')

      const modelResult = insightSchema.parse(JSON.parse(raw))
      const allowedIds = new Set(properties.map((property) => property.id))

      const propertyExplanations = modelResult.propertyExplanations.filter((item) => allowedIds.has(item.propertyId))
      const dataIssues = modelResult.dataIssues.length ? modelResult.dataIssues : deterministic.dataIssues
      const verify = modelResult.verify.length
        ? modelResult.verify
        : deterministic.dataIssues.map((issue) => ({ topic: issue.field, reason: issue.issue }))

      return NextResponse.json({
        success: true,
        source: 'ai',
        result: {
          ...modelResult,
          propertyExplanations,
          dataIssues,
          verify,
          ranking: deterministic.ranking,
        },
      })
    } catch (error) {
      console.error('Property comparison AI error; using fallback:', error)
      return NextResponse.json({ success: true, source: 'fallback', result: fallback })
    }
  } catch (error) {
    console.error('Property comparison request error:', error)
    return NextResponse.json(
      { success: false, error: 'Analiza e krahasimit nuk mund të përfundonte.' },
      { status: 500 },
    )
  }
}
