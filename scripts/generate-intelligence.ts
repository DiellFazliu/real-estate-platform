// ═══════════════════════════════════════════════════════════════
// LOAD ENV FIRST
// ═══════════════════════════════════════════════════════════════

import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { existsSync } from 'fs'

for (const file of ['.env.local', '.env']) {
  const path = resolve(process.cwd(), file)
  if (existsSync(path)) {
    dotenv.config({ path, override: true })
    console.log(`✅ Env loaded: ${file}`)
    break
  }
}

// ═══════════════════════════════════════════════════════════════
// IMPORTS (pas dotenv)
// ═══════════════════════════════════════════════════════════════

import { prisma } from '../lib/db/prisma'
import { buildMarketHistory } from '../lib/intelligence/trend-engine'
import { generateAllIntelligence } from '../lib/intelligence/generate'

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main() {
  const overallStart = Date.now()

  console.log('\n')
  console.log('═══════════════════════════════════════════════════════════')
  console.log('🧠 REVA INTELLIGENCE GENERATOR')
  console.log('═══════════════════════════════════════════════════════════')
  console.log('')

  try {
    // ═══════════════════════════════════════════════════════════
    // STEP 1: Build Market History
    // ═══════════════════════════════════════════════════════════
    console.log('📊 STEP 1: Building market history...')
    console.log('─'.repeat(60))

    const historyStart = Date.now()
    const historyCount = await buildMarketHistory()
    const historyTime = ((Date.now() - historyStart) / 1000).toFixed(1)

    console.log(`⏱️  Time: ${historyTime}s`)
    console.log('')

    // ═══════════════════════════════════════════════════════════
    // STEP 2: Generate Intelligence
    // ═══════════════════════════════════════════════════════════
    console.log('🧠 STEP 2: Generating intelligence for all properties...')
    console.log('─'.repeat(60))

    const intelStart = Date.now()
    await generateAllIntelligence()
    const intelTime = ((Date.now() - intelStart) / 1000).toFixed(1)

    console.log(`⏱️  Time: ${intelTime}s`)
    console.log('')

    // ═══════════════════════════════════════════════════════════
    // SUMMARY
    // ═══════════════════════════════════════════════════════════
    const total = await prisma.propertyIntelligence.count()
    const totalMarket = await prisma.marketHistory.count()
    const overallTime = ((Date.now() - overallStart) / 1000).toFixed(1)

    console.log('═══════════════════════════════════════════════════════════')
    console.log('✅ COMPLETE!')
    console.log('═══════════════════════════════════════════════════════════')
    console.log(`   📊 Market History: ${totalMarket} records`)
    console.log(`   🧠 Intelligence:   ${total} properties`)
    console.log(`   ⏱️  Total Time:     ${overallTime}s`)
    console.log('═══════════════════════════════════════════════════════════')
    console.log('')
  } catch (error: any) {
    console.error('')
    console.error('═══════════════════════════════════════════════════════════')
    console.error('❌ ERROR:')
    console.error('═══════════════════════════════════════════════════════════')
    console.error(error.message)
    console.error('')
    if (error.stack) {
      console.error(error.stack)
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()