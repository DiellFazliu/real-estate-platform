import { prisma } from '@/lib/db/prisma'
import { analyzePrice, findComparables } from './price-engine'
import { analyzeTrend } from './trend-engine'
import { analyzeLocation } from './location-engine'
import { detectAnomalies } from './anomaly-engine'
import { generateAISummary } from './ai-summary'

// ═══════════════════════════════════════════════════════════════
// GENERATE PËR NJË PRONË
// ═══════════════════════════════════════════════════════════════

export async function generatePropertyIntelligence(propertyId: number) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  })

  if (!property) throw new Error(`Property ${propertyId} not found`)

  // 1. Price Analysis
  const priceAnalysis = await analyzePrice(propertyId)

  // 2. Comparables
  const comparables = await findComparables(propertyId, 10)

  // 3. Trend
  const trend = await analyzeTrend(
    property.city || '',
    property.neighborhood,
    property.property_type,
    property.listing_type
  )

  // 4. Location
  const location = analyzeLocation(property)

  // 5. Anomalies
  const warnings = detectAnomalies(property, priceAnalysis)

  // 6. AI Summary (Groq)
  const aiSummary = await generateAISummary({
    property,
    priceAnalysis,
    trend,
    location,
    comparables,
  })

  // 7. Upsert
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
// GENERATE PËR TË GJITHA - OPTIMIZED ME PROGRESS
// ═══════════════════════════════════════════════════════════════

export async function generateAllIntelligence() {
  const startTime = Date.now()

  const properties = await prisma.property.findMany({
    where: {
      status: 'PUBLISHED',
      review_status: 'APPROVED',
    },
    select: { id: true, title: true },
  })

  console.log(`📊 ${properties.length} properties to analyze`)
  console.log('')

  let success = 0
  let failed = 0

  for (let i = 0; i < properties.length; i++) {
    const p = properties[i]

    try {
      await generatePropertyIntelligence(p.id)
      success++

      // Log progress çdo 10 pronë
      if (success % 10 === 0 || success === properties.length) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
        const percent = Math.round((success / properties.length) * 100)
        const remaining = properties.length - success
        const avgTime = (Date.now() - startTime) / success
        const eta = ((remaining * avgTime) / 1000).toFixed(0)

        console.log(
          `   ✅ ${success}/${properties.length} (${percent}%) - ${elapsed}s - ETA: ${eta}s`
        )
      }
    } catch (error: any) {
      failed++
      console.error(`   ❌ Failed #${p.id} (${p.title}): ${error.message}`)
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log('')
  console.log(`✅ Intelligence: ${success} success, ${failed} failed in ${elapsed}s`)
}