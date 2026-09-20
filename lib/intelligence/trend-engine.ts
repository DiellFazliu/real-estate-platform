import { prisma } from '@/lib/db/prisma'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface TrendAnalysis {
  trend_direction: 'UP' | 'DOWN' | 'STABLE' | null
  trend_pct_12m: number | null
  trend_pct_5y: number | null
  trend_confidence: number | null
  data_points: {
    year: number
    month: number | null
    avg_price_m2: number
    sample_size: number
  }[]
}

interface MarketHistoryRecord {
  id: number
  city: string
  neighborhood: string | null
  property_type: string | null
  listing_type: string
  year: number
  month: number | null
  avg_price_m2: number
  median_price_m2: number | null
  sample_size: number
  created_at: Date
}

// ═══════════════════════════════════════════════════════════════
// LINEAR REGRESSION
// ═══════════════════════════════════════════════════════════════

function linearRegression(points: { x: number; y: number }[]) {
  const n = points.length
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 }

  const sumX = points.reduce((a, p) => a + p.x, 0)
  const sumY = points.reduce((a, p) => a + p.y, 0)
  const sumXY = points.reduce((a, p) => a + p.x * p.y, 0)
  const sumX2 = points.reduce((a, p) => a + p.x * p.x, 0)

  const denominator = n * sumX2 - sumX * sumX
  if (denominator === 0) return { slope: 0, intercept: 0, r2: 0 }

  const slope = (n * sumXY - sumX * sumY) / denominator
  const intercept = (sumY - slope * sumX) / n

  const yMean = sumY / n
  const ssTotal = points.reduce((a, p) => a + Math.pow(p.y - yMean, 2), 0)
  const ssResidual = points.reduce(
    (a, p) => a + Math.pow(p.y - (slope * p.x + intercept), 2),
    0
  )
  const r2 = ssTotal > 0 ? 1 - ssResidual / ssTotal : 0

  return { slope, intercept, r2 }
}

// ═══════════════════════════════════════════════════════════════
// BUILD MARKET HISTORY - OPTIMIZED (Batch Insert)
// ═══════════════════════════════════════════════════════════════

export async function buildMarketHistory() {
  console.log('📊 Building market history from properties...')
  const startTime = Date.now()

  // 1. Merr të gjitha pronat
  const properties = await prisma.property.findMany({
    where: {
      status: { in: ['PUBLISHED', 'SOLD'] },
      review_status: 'APPROVED',
      area: { not: null },
      price: { gt: 0 },
      city: { not: null },
    },
    select: {
      price: true,
      area: true,
      city: true,
      neighborhood: true,
      property_type: true,
      listing_type: true,
      published_at: true,
      created_at: true,
    },
  })

  console.log(`📦 Found ${properties.length} properties`)

  // 2. Group në memorie (shumë i shpejtë, 0 queries)
  const groups = new Map<
    string,
    {
      prices: number[]
      year: number
      month: number
      key: {
        city: string
        neighborhood: string | null
        property_type: string | null
        listing_type: string
        year: number
        month: number
      }
    }
  >()

  for (const p of properties) {
    if (!p.area || !p.city) continue

    const priceM2 = Number(p.price) / p.area
    const date = p.published_at || p.created_at
    const year = date.getFullYear()
    const month = date.getMonth() + 1

    const key = `${p.city}|${p.neighborhood || ''}|${p.property_type || ''}|${p.listing_type}|${year}|${month}`

    if (!groups.has(key)) {
      groups.set(key, {
        prices: [],
        year,
        month,
        key: {
          city: p.city,
          neighborhood: p.neighborhood,
          property_type: p.property_type,
          listing_type: p.listing_type,
          year,
          month,
        },
      })
    }

    groups.get(key)!.prices.push(priceM2)
  }

  console.log(`📊 Created ${groups.size} market groups`)

  // 3. FSHIJ të gjitha regjistrimet e vjetra
  const deleted = await prisma.marketHistory.deleteMany({})
  console.log(`🗑️  Cleared ${deleted.count} old records`)

  // 4. Përgatit të gjitha regjistrimet
  const records: any[] = []

  for (const [, group] of groups) {
    const prices = group.prices.sort((a, b) => a - b)
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length
    const median =
      prices.length % 2 === 0
        ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
        : prices[Math.floor(prices.length / 2)]

    records.push({
      city: group.key.city,
      neighborhood: group.key.neighborhood,
      property_type: group.key.property_type,
      listing_type: group.key.listing_type,
      year: group.year,
      month: group.month,
      avg_price_m2: Math.round(avg * 100) / 100,
      median_price_m2: Math.round(median * 100) / 100,
      sample_size: prices.length,
    })
  }

  // 5. INSERT BATCH (100 në një herë)
  const batchSize = 100
  let inserted = 0

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize)
    await prisma.marketHistory.createMany({
      data: batch,
      skipDuplicates: true,
    })
    inserted += batch.length

    const percent = Math.round((inserted / records.length) * 100)
    console.log(`   ✅ ${inserted}/${records.length} (${percent}%)`)
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log(`✅ Created ${inserted} market history records in ${elapsed}s`)

  return inserted
}

// ═══════════════════════════════════════════════════════════════
// ANALYZE TREND
// ═══════════════════════════════════════════════════════════════

export async function analyzeTrend(
  city: string,
  neighborhood: string | null,
  propertyType: string | null,
  listingType: string
): Promise<TrendAnalysis> {
  const history: MarketHistoryRecord[] = await prisma.marketHistory.findMany({
    where: {
      city,
      ...(neighborhood && { neighborhood }),
      ...(propertyType && { property_type: propertyType }),
      listing_type: listingType,
    },
    orderBy: [{ year: 'asc' }, { month: 'asc' }],
  })

  if (history.length < 2) {
    return {
      trend_direction: null,
      trend_pct_12m: null,
      trend_pct_5y: null,
      trend_confidence: null,
      data_points: [],
    }
  }

  // Convert to x,y points
  const firstDate = history[0]
  const firstTimestamp = firstDate.year * 12 + (firstDate.month || 1)

  const points = history.map((h: MarketHistoryRecord) => ({
    x: h.year * 12 + (h.month || 1) - firstTimestamp,
    y: h.avg_price_m2,
  }))

  const { r2 } = linearRegression(points)

  const latest = history[history.length - 1]
  const now = latest.year * 12 + (latest.month || 1)

  // Find ~12 months ago
  const target12m = now - 12
  const data12m = history.find(
    (h: MarketHistoryRecord) => h.year * 12 + (h.month || 1) >= target12m
  )
  const trend_pct_12m = data12m
    ? ((latest.avg_price_m2 - data12m.avg_price_m2) / data12m.avg_price_m2) * 100
    : null

  // Find ~60 months ago
  const target5y = now - 60
  const data5y = history.find(
    (h: MarketHistoryRecord) => h.year * 12 + (h.month || 1) >= target5y
  )
  const trend_pct_5y = data5y
    ? ((latest.avg_price_m2 - data5y.avg_price_m2) / data5y.avg_price_m2) * 100
    : null

  // Direction
  let direction: 'UP' | 'DOWN' | 'STABLE'
  const recentTrend = trend_pct_12m || 0
  if (recentTrend > 2) direction = 'UP'
  else if (recentTrend < -2) direction = 'DOWN'
  else direction = 'STABLE'

  return {
    trend_direction: direction,
    trend_pct_12m: trend_pct_12m ? Math.round(trend_pct_12m * 10) / 10 : null,
    trend_pct_5y: trend_pct_5y ? Math.round(trend_pct_5y * 10) / 10 : null,
    trend_confidence: Math.round(r2 * 100) / 100,
    data_points: history.map((h: MarketHistoryRecord) => ({
      year: h.year,
      month: h.month,
      avg_price_m2: h.avg_price_m2,
      sample_size: h.sample_size,
    })),
  }
}