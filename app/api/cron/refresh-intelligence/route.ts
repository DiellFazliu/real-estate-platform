import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { generatePropertyIntelligence } from '@/lib/intelligence/generate'
import { buildMarketHistory } from '@/lib/intelligence/trend-engine'

const STALE_DAYS = 30

export async function GET(req: NextRequest) {
  // 1. Verify CRON secret
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = Date.now()
  console.log('🌙 [CRON] Starting nightly refresh...')

  try {
    // 1. Rebuild market history
    console.log('📊 [CRON] Building market history...')
    await buildMarketHistory()

    // 2. Find stale properties
    const staleDate = new Date()
    staleDate.setDate(staleDate.getDate() - STALE_DAYS)

    const staleProperties = await prisma.property.findMany({
      where: {
        status: 'PUBLISHED',
        review_status: 'APPROVED',
        OR: [
          { intelligence: null },
          {
            intelligence: {
              generated_at: { lt: staleDate },
            },
          },
        ],
      },
      select: { id: true, title: true },
      take: 100, // Max 100 për çdo run (rate limit)
    })

    console.log(`🔄 [CRON] Refreshing ${staleProperties.length} stale properties`)

    let success = 0
    let failed = 0

    for (const p of staleProperties) {
      try {
        await generatePropertyIntelligence(p.id)
        success++
        console.log(`   ✅ ${p.title}`)
      } catch (error) {
        failed++
        console.error(`   ❌ ${p.title}:`, error)
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

    return NextResponse.json({
      success: true,
      refreshed: success,
      failed,
      total: staleProperties.length,
      elapsed: `${elapsed}s`,
    })
  } catch (error) {
    console.error('❌ [CRON] Error:', error)
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}