import { prisma } from '@/lib/db/prisma'
import { analyzePrice, findComparables } from './price-engine'
import { analyzeTrend } from './trend-engine'
import { analyzeLocation } from './location-engine'
import { detectAnomalies } from './anomaly-engine'
import { generateAISummary } from './ai-summary'

// ═══════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════

// Delay midis kërkesave Groq (në ms)
// 1000 tokens/min ÷ 400 tokens/summary = 2.5 summaries/min
// 60,000 ms ÷ 2.5 = 24,000 ms = 24 sekonda
const GROQ_DELAY_MS = 25000 // 25 sekonda midis summaries

// Delay midis batches
const BATCH_DELAY_MS = 1000 // 1 sekondë midis çdo prone

// Max retries për rate limit
const MAX_RETRIES = 5
const RETRY_DELAY_MS = 65000 // 65 sekonda kur merr 429

// ═══════════════════════════════════════════════════════════════
// HELPER: SLEEP
// ═══════════════════════════════════════════════════════════════

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ═══════════════════════════════════════════════════════════════
// HELPER: PARSE RETRY AFTER
// ═══════════════════════════════════════════════════════════════

function parseRetryAfter(error: any): number {
  // Nëse error ka retry after
  if (error?.retryAfter) {
    return error.retryAfter * 1000
  }

  // Nëse mesazhi ka "Please try again in Xs"
  const match = error?.message?.match(/try again in ([\d.]+)s/)
  if (match) {
    return Math.ceil(parseFloat(match[1])) * 1000
  }

  // Default
  return RETRY_DELAY_MS
}

// ═══════════════════════════════════════════════════════════════
// GENERATE INTELLIGENCE PËR NJË PRONË (me Retry)
// ═══════════════════════════════════════════════════════════════

export async function generatePropertyIntelligence(
  propertyId: number,
  options: { skipAI?: boolean } = {}
) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  })

  if (!property) throw new Error(`Property ${propertyId} not found`)

  // 1. Price Analysis (ML)
  const priceAnalysis = await analyzePrice(propertyId)

  // 2. Comparables (ML)
  const comparables = await findComparables(propertyId, 10)

  // 3. Trend (ML)
  const trend = await analyzeTrend(
    property.city || '',
    property.neighborhood,
    property.property_type,
    property.listing_type
  )

  // 4. Location (Rule-based)
  const location = analyzeLocation(property)

  // 5. Anomalies (Rule-based)
  const warnings = detectAnomalies(property, priceAnalysis)

  // ═══════════════════════════════════════════════════════════
  // 6. AI Summary (Groq) - me Retry Logic
  // ═══════════════════════════════════════════════════════════
  let aiSummary: string | null = null

  if (!options.skipAI) {
    aiSummary = await generateAISummaryWithRetry({
      property,
      priceAnalysis,
      trend,
      location,
      comparables,
    })
  }

  // 7. Upsert në DB
  const intelligence = await prisma.propertyIntelligence.upsert({
    where: { property_id: propertyId },
    update: {
      price_per_m2: priceAnalysis.price_per_m2,
      comparable_average: priceAnalysis.comparable_average,
      comparable_median: priceAnalysis.comparable_median,
      comparable_count: priceAnalysis.comparable_count,
      price_difference_pct: priceAnalysis.price_difference_pct,
      market_position: priceAnalysis.market_position,
      percentile: priceAnalysis.percentile,
      trend_direction: trend.trend_direction,
      trend_pct_12m: trend.trend_pct_12m,
      trend_pct_5y: trend.trend_pct_5y,
      trend_confidence: trend.trend_confidence,
      location_score: location.location_score,
      location_insights: location as any,
      ai_summary: aiSummary,
      warnings: warnings as any,
      updated_at: new Date(),
    },
    create: {
      property_id: propertyId,
      price_per_m2: priceAnalysis.price_per_m2,
      comparable_average: priceAnalysis.comparable_average,
      comparable_median: priceAnalysis.comparable_median,
      comparable_count: priceAnalysis.comparable_count,
      price_difference_pct: priceAnalysis.price_difference_pct,
      market_position: priceAnalysis.market_position,
      percentile: priceAnalysis.percentile,
      trend_direction: trend.trend_direction,
      trend_pct_12m: trend.trend_pct_12m,
      trend_pct_5y: trend.trend_pct_5y,
      trend_confidence: trend.trend_confidence,
      location_score: location.location_score,
      location_insights: location as any,
      ai_summary: aiSummary,
      warnings: warnings as any,
    },
  })

  return intelligence
}

// ═══════════════════════════════════════════════════════════════
// AI SUMMARY ME RETRY
// ═══════════════════════════════════════════════════════════════

async function generateAISummaryWithRetry(input: any): Promise<string | null> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const summary = await generateAISummary(input)

      // Delay para kërkesës tjetër
      await sleep(GROQ_DELAY_MS)

      return summary
    } catch (error: any) {
      const isRateLimit =
        error?.message?.includes('rate_limit') ||
        error?.message?.includes('429') ||
        error?.status === 429

      if (isRateLimit && attempt < MAX_RETRIES) {
        const delay = parseRetryAfter(error)
        console.log(`   ⏳ Rate limit (attempt ${attempt}/${MAX_RETRIES}) - duke pritur ${delay / 1000}s...`)
        await sleep(delay)
        continue
      }

      // Nëse nuk është rate limit ose kemi mbaruar attempts
      console.error(`   ❌ AI error (attempt ${attempt}):`, error.message)

      if (attempt < MAX_RETRIES) {
        await sleep(5000)
        continue
      }

      return null
    }
  }

  return null
}

// ═══════════════════════════════════════════════════════════════
// GENERATE ALL - ME DELAY + RESUME
// ═══════════════════════════════════════════════════════════════

export async function generateAllIntelligence(options: {
  skipAI?: boolean
  onlyMissing?: boolean
  maxProperties?: number
} = {}) {
  const { skipAI = false, onlyMissing = false, maxProperties } = options

  const startTime = Date.now()

  // Build where clause
  const where: any = {
    status: 'PUBLISHED',
    review_status: 'APPROVED',
  }

  if (onlyMissing) {
    where.intelligence = null
  }

  const properties = await prisma.property.findMany({
    where,
    select: { id: true, title: true },
    take: maxProperties,
  })

  console.log(`📊 ${properties.length} properties to analyze`)
  console.log(`⏱️  Delay: ${GROQ_DELAY_MS / 1000}s midis summaries`)
  console.log(`🔄 Retry: ${MAX_RETRIES} attempts`)
  console.log('')

  let success = 0
  let failed = 0
  let skipped = 0

  // Estimated time
  if (!skipAI) {
    const estimatedTime = (properties.length * (GROQ_DELAY_MS + 2000)) / 1000 / 60
    console.log(`⏱️  Koha e vlerësuar: ${estimatedTime.toFixed(1)} minuta (${(estimatedTime / 60).toFixed(1)} orë)`)
    console.log('')
  }

  for (let i = 0; i < properties.length; i++) {
    const p = properties[i]
    const startItem = Date.now()

    try {
      await generatePropertyIntelligence(p.id, { skipAI })

      success++

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0)
      const itemTime = ((Date.now() - startItem) / 1000).toFixed(1)
      const percent = Math.round((success / properties.length) * 100)
      const remaining = properties.length - success
      const avgTime = (Date.now() - startTime) / success
      const eta = ((remaining * avgTime) / 1000 / 60).toFixed(0)

      // Log çdo pronë
      console.log(
        `   ✅ ${success}/${properties.length} (${percent}%) | ${p.title} | ${itemTime}s | ETA: ${eta}min`
      )
    } catch (error: any) {
      failed++
      console.error(`   ❌ Failed #${p.id}: ${error.message}`)
    }

    // Delay midis pronave (për të mos mbingarkuar DB)
    if (!skipAI) {
      // Delay tashmë aplikohet brenda generateAISummaryWithRetry
      // Ky është delay shtesë për siguri
    } else {
      // Pa AI, shumë i shpejtë
      await sleep(BATCH_DELAY_MS)
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1)

  console.log('')
  console.log('═══════════════════════════════════════════════════')
  console.log(`✅ PËRFUNDOI!`)
  console.log('═══════════════════════════════════════════════════')
  console.log(`   ✅ Success: ${success}`)
  console.log(`   ❌ Failed:  ${failed}`)
  console.log(`   ⏱️  Koha:    ${elapsed} minuta`)
  console.log('═══════════════════════════════════════════════════')
  console.log('')
}