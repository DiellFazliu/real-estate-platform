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

import { prisma } from '../lib/db/prisma'
import { buildMarketHistory } from '../lib/intelligence/trend-engine'
import { generateAllIntelligence } from '../lib/intelligence/generate'

// ═══════════════════════════════════════════════════════════════
// PARSE ARGUMENTS
// ═══════════════════════════════════════════════════════════════

const args = process.argv.slice(2)
const options = {
  skipAI: args.includes('--skip-ai'),
  onlyMissing: args.includes('--only-missing'),
  skipHistory: args.includes('--skip-history'),
  maxProperties: (() => {
    const idx = args.indexOf('--max')
    return idx !== -1 ? parseInt(args[idx + 1]) : undefined
  })(),
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main() {
  const overallStart = Date.now()

  console.log('')
  console.log('═══════════════════════════════════════════════════════════')
  console.log('🧠 REVA INTELLIGENCE GENERATOR')
  console.log('═══════════════════════════════════════════════════════════')
  console.log('')
  console.log('📋 Options:')
  console.log(`   Skip AI:       ${options.skipAI ? '✅' : '❌'}`)
  console.log(`   Only Missing:  ${options.onlyMissing ? '✅' : '❌'}`)
  console.log(`   Skip History:  ${options.skipHistory ? '✅' : '❌'}`)
  console.log(`   Max:           ${options.maxProperties || 'unlimited'}`)
  console.log('')
  console.log('═══════════════════════════════════════════════════════════')
  console.log('')

  try {
    // ═══════════════════════════════════════════════════════════
    // STEP 1: Build Market History
    // ═══════════════════════════════════════════════════════════
    if (!options.skipHistory) {
      console.log('📊 STEP 1: Building market history...')
      console.log('─'.repeat(60))

      const historyStart = Date.now()
      const historyCount = await buildMarketHistory()
      const historyTime = ((Date.now() - historyStart) / 1000).toFixed(1)

      console.log(`⏱️  Time: ${historyTime}s`)
      console.log('')
    } else {
      console.log('⏩ Skipping market history (--skip-history)')
      console.log('')
    }

    // ═══════════════════════════════════════════════════════════
    // STEP 2: Generate Intelligence
    // ═══════════════════════════════════════════════════════════
    console.log('🧠 STEP 2: Generating intelligence...')
    console.log('─'.repeat(60))

    const intelStart = Date.now()
    await generateAllIntelligence({
      skipAI: options.skipAI,
      onlyMissing: options.onlyMissing,
      maxProperties: options.maxProperties,
    })
    const intelTime = ((Date.now() - intelStart) / 1000 / 60).toFixed(1)

    console.log(`⏱️  Time: ${intelTime} minuta`)
    console.log('')

    // ═══════════════════════════════════════════════════════════
    // SUMMARY
    // ═══════════════════════════════════════════════════════════
    const total = await prisma.propertyIntelligence.count()
    const totalMarket = await prisma.marketHistory.count()
    const overallTime = ((Date.now() - overallStart) / 1000 / 60).toFixed(1)

    console.log('═══════════════════════════════════════════════════════════')
    console.log('✅ COMPLETE!')
    console.log('═══════════════════════════════════════════════════════════')
    console.log(`   📊 Market History: ${totalMarket} records`)
    console.log(`   🧠 Intelligence:   ${total} properties`)
    console.log(`   ⏱️  Total Time:     ${overallTime} minuta`)
    console.log('═══════════════════════════════════════════════════════════')
    console.log('')
  } catch (error: any) {
    console.error('')
    console.error('❌ ERROR:')
    console.error(error.message)
    if (error.stack) {
      console.error(error.stack)
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()