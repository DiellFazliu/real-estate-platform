import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { PrismaClient } from '@prisma/client'

// Load env
dotenv.config({ path: resolve(process.cwd(), '.env') })

const prisma = new PrismaClient()

// ═══════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
}

function log(emoji: string, message: string, color = COLORS.reset) {
  console.log(`${color}${emoji}  ${message}${COLORS.reset}`)
}

function header(text: string) {
  console.log('')
  console.log(COLORS.cyan + '═'.repeat(60) + COLORS.reset)
  console.log(COLORS.cyan + COLORS.bright + `  ${text}` + COLORS.reset)
  console.log(COLORS.cyan + '═'.repeat(60) + COLORS.reset)
  console.log('')
}

function section(text: string) {
  console.log('')
  console.log(COLORS.blue + '─'.repeat(60) + COLORS.reset)
  console.log(COLORS.blue + `  ${text}` + COLORS.reset)
  console.log(COLORS.blue + '─'.repeat(60) + COLORS.reset)
  console.log('')
}

// ═══════════════════════════════════════════════════════════════
// 1. KRIJO OSE MERR NJË PRONË TESTUESE
// ═══════════════════════════════════════════════════════════════

async function getOrCreateTestProperty() {
  section('1️⃣  GJEJ OSE KRIJO PRONË TESTUESE')

  // Provo të gjesh një pronë ekzistuese
  let property = await prisma.property.findFirst({
    where: {
      status: 'PUBLISHED',
      review_status: 'APPROVED',
      city: 'Prishtina',
      property_type: 'apartment',
    },
    select: {
      id: true,
      title: true,
      city: true,
      neighborhood: true,
      property_type: true,
      listing_type: true,
      price: true,
      area: true,
    },
  })

  if (property) {
    log('✅', `Përdor pronë ekzistuese: ${property.title}`, COLORS.green)
    console.log(`   ID: ${property.id}`)
    console.log(`   City: ${property.city}`)
    console.log(`   Neighborhood: ${property.neighborhood}`)
    console.log(`   Type: ${property.property_type}`)
    console.log(`   Listing: ${property.listing_type}`)
    console.log(`   Price: €${property.price}`)
    console.log(`   Area: ${property.area} m²`)
    return property
  }

  // Nëse nuk ka, krijo një të re
  log('⚠️ ', 'Nuk u gjet pronë ekzistuese. Duke krijuar një të re...', COLORS.yellow)

  const user = await prisma.user.findFirst({
    where: { role: { name: 'OWNER' } },
    select: { id: true, email: true },
  })

  if (!user) {
    throw new Error('Nuk u gjet përdorues OWNER')
  }

  const newProperty = await prisma.property.create({
    data: {
      sanity_id: `test-${Date.now()}`,
      slug: `test-property-${Date.now()}`,
      title: 'Test Apartment për Intelligence',
      price: 180000,
      price_per_m2: 1500,
      status: 'PUBLISHED',
      review_status: 'APPROVED',
      listing_type: 'sale',
      source: 'OWNER',
      city: 'Prishtina',
      neighborhood: 'Qendra',
      property_type: 'apartment',
      bedrooms: 3,
      bathrooms: 2,
      area: 120,
      latitude: 42.6629,
      longitude: 21.1655,
      listed_by_id: user.id,
      published_at: new Date(),
    },
  })

  log('✅', `U krijua pronë e re: ${newProperty.title}`, COLORS.green)
  return newProperty
}

// ═══════════════════════════════════════════════════════════════
// 2. GJENERO INTELLIGENCE PËR PRONËN
// ═══════════════════════════════════════════════════════════════

async function generateIntelligenceForProperty(propertyId: number) {
  section('2️⃣  GJENERO INTELLIGENCE')

  log('🔄', `Duke gjeneruar inteligjencën për pronën ${propertyId}...`, COLORS.yellow)

  const startTime = Date.now()

  try {
    // Import dinamik për shmangur problemet
    const { generatePropertyIntelligence } = await import(
      '../lib/intelligence/generate'
    )

    const intelligence = await generatePropertyIntelligence(propertyId, {
      skipAI: false, // ME AI
    })

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)

    log('✅', `Inteligjenca u gjenerua në ${duration}s`, COLORS.green)
    return intelligence
  } catch (error: any) {
    log('❌', `Gabim: ${error.message}`, COLORS.red)
    console.error(error)
    return null
  }
}

// ═══════════════════════════════════════════════════════════════
// 3. VERIFIKO INTELLIGENCE NË DB
// ═══════════════════════════════════════════════════════════════

async function verifyIntelligenceInDB(propertyId: number) {
  section('3️⃣  VERIFIKO INTELLIGENCE NË DB')

  const intelligence = await prisma.propertyIntelligence.findUnique({
    where: { property_id: propertyId },
  })

  if (!intelligence) {
    log('❌', 'Nuk u gjet intelligence në DB!', COLORS.red)
    return false
  }

  log('✅', 'Intelligence u gjet në DB:', COLORS.green)
  console.log('')
  console.log(`   📊 Price per m²:      ${intelligence.price_per_m2 || 'N/A'}`)
  console.log(`   📊 Comparable avg:    ${intelligence.comparable_average || 'N/A'}`)
  console.log(`   📊 Comparable count:  ${intelligence.comparable_count || 0}`)
  console.log(`   📊 Price diff %:      ${intelligence.price_difference_pct || 'N/A'}%`)
  console.log(`   📊 Market position:   ${intelligence.market_position || 'N/A'}`)
  console.log(`   📊 Percentile:        ${intelligence.percentile || 'N/A'}`)
  console.log(`   📈 Trend direction:   ${intelligence.trend_direction || 'N/A'}`)
  console.log(`   📈 Trend 12m:         ${intelligence.trend_pct_12m || 'N/A'}%`)
  console.log(`   📈 Trend 5y:          ${intelligence.trend_pct_5y || 'N/A'}%`)
  console.log(`   📍 Location score:    ${intelligence.location_score || 'N/A'}`)
  console.log('')

  if (intelligence.ai_summary) {
    log('🤖', 'AI Summary:', COLORS.cyan)
    console.log(COLORS.gray)
    console.log(`   "${intelligence.ai_summary}"`)
    console.log(COLORS.reset)
  } else {
    log('⚠️ ', 'AI Summary nuk u gjenerua (rate limit ose error)', COLORS.yellow)
  }

  return true
}

// ═══════════════════════════════════════════════════════════════
// 4. GJENJ PRONAT PËRRETH
// ═══════════════════════════════════════════════════════════════

async function findNearbyProperties(property: any) {
  section('4️⃣  GJENJ PRONAT PËRRETH')

  // ⭐ Kërko prona pa filtër intelligence
  const nearby = await prisma.property.findMany({
    where: {
      id: { not: property.id },
      status: 'PUBLISHED',
      review_status: 'APPROVED',
      city: property.city,
      property_type: property.property_type,
      listing_type: property.listing_type,
      // intelligence: { isNot: null }, // ← HEQ KËTË
    },
    select: {
      id: true,
      title: true,
      price: true,
      area: true,
      city: true,
      neighborhood: true,
      intelligence: {
        select: {
          price_per_m2: true,
          generated_at: true,
        },
      },
    },
    take: 10,
  })

  if (nearby.length === 0) {
    log('ℹ️ ', `Nuk u gjetën prona të afërta në ${property.city}`, COLORS.yellow)
    return []
  }

  log('✅', `U gjetën ${nearby.length} prona të afërta:`, COLORS.green)
  console.log('')

  for (const p of nearby) {
    const intel = p.intelligence
    const intelStatus = intel ? `✅ ${intel.generated_at?.toLocaleDateString()}` : '❌ Pa intelligence'
    
    console.log(`   • #${p.id} ${p.title.substring(0, 45)}...`)
    console.log(`     €${p.price} | ${p.area}m² | ${intelStatus}`)
  }

  return nearby
}

// ═══════════════════════════════════════════════════════════════
// 5. TEST INVALIDATION
// ═══════════════════════════════════════════════════════════════

async function testInvalidation(property: any, nearby: any[]) {
  section('5️⃣  TEST INVALIDATION PËR PRONAT PËRRETH')

  if (nearby.length === 0) {
    log('ℹ️ ', 'Nuk ka prona përreth për invalidation', COLORS.yellow)
    return
  }

  log('🔄', `Duke invaliduar ${nearby.length} prona përreth...`, COLORS.yellow)

  // Ruaj inteligjencën e vjetër
  const oldIntelligence = new Map<number, any>()
  for (const p of nearby) {
    oldIntelligence.set(p.id, p.intelligence)
  }

  try {
    // Import dinamik
    const { invalidateNearbyIntelligence } = await import(
      '../lib/intelligence/invalidate-nearby'
    )

    const result = await invalidateNearbyIntelligence({
      propertyId: property.id,
      city: property.city,
      neighborhood: property.neighborhood,
      property_type: property.property_type,
      listing_type: property.listing_type,
    })

    log('✅', `Invalidation përfundoi: ${result.invalidated} prona`, COLORS.green)
    console.log('')

    // Verifiko që inteligjenca u fshi
    let deletedCount = 0
    for (const p of nearby) {
      const intel = await prisma.propertyIntelligence.findUnique({
        where: { property_id: p.id },
      })
      if (!intel) {
        deletedCount++
        log('🗑️ ', `#${p.id} intelligence u fshi`, COLORS.green)
      } else {
        log('⚠️ ', `#${p.id} intelligence NUK u fshi`, COLORS.yellow)
      }
    }

    console.log('')
    log('📊', `Total: ${deletedCount}/${nearby.length} u fshinë`, COLORS.cyan)
  } catch (error: any) {
    log('❌', `Gabim: ${error.message}`, COLORS.red)
    console.error(error)
  }
}

// ═══════════════════════════════════════════════════════════════
// 6. TEST CASCADE (NËSE KA)
// ═══════════════════════════════════════════════════════════════

async function testCascadeRegeneration(propertyId: number) {
  section('6️⃣  TEST CASCADE REGENERATION')

  log('ℹ️ ', 'Cascade regeneration ndodh në background (Inngest)', COLORS.cyan)
  log('ℹ️ ', 'Kontrollo Inngest Dashboard: http://localhost:8288', COLORS.cyan)
  console.log('')
  log('🔄', 'Prit 30 sekonda dhe verifiko...', COLORS.yellow)

  await new Promise((r) => setTimeout(r, 5000))

  // Verifiko nëse inteligjenca u ri-gjenerua
  const regenerated = await prisma.propertyIntelligence.count({
    where: {
      property: {
        status: 'PUBLISHED',
        review_status: 'APPROVED',
      },
    },
  })

  log('📊', `Total intelligence në DB: ${regenerated}`, COLORS.cyan)
}

// ═══════════════════════════════════════════════════════════════
// 7. RAPORT FINAL
// ═══════════════════════════════════════════════════════════════

async function finalReport() {
  header('📊 RAPORT FINAL')

  const totalProperties = await prisma.property.count({
    where: {
      status: 'PUBLISHED',
      review_status: 'APPROVED',
    },
  })

  const withIntelligence = await prisma.propertyIntelligence.count()

  const withAI = await prisma.propertyIntelligence.count({
    where: {
      ai_summary: { not: null },
    },
  })

  const latestIntelligence = await prisma.propertyIntelligence.findFirst({
    orderBy: { generated_at: 'desc' },
    select: {
      generated_at: true,
      property_id: true,
    },
  })

  console.log(COLORS.cyan)
  console.log('┌─────────────────────────────────────────────────────────┐')
  console.log('│                    STATISTIKA                           │')
  console.log('├─────────────────────────────────────────────────────────┤')
  console.log(`│  📊 Total properties:        ${String(totalProperties).padEnd(28)} │`)
  console.log(`│  ✅ Me intelligence:         ${String(withIntelligence).padEnd(28)} │`)
  console.log(`│  🤖 Me AI summary:           ${String(withAI).padEnd(28)} │`)
  console.log(`│  ⏱️  Më e fundit:            ${String(latestIntelligence?.generated_at?.toLocaleString() || 'N/A').padEnd(28)} │`)
  console.log('└─────────────────────────────────────────────────────────┘')
  console.log(COLORS.reset)
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main() {
  header('🧪 TEST INTELLIGENCE FLOW')

  const startTime = Date.now()

  try {
    // 1. Merr ose krijo pronë
    const property = await getOrCreateTestProperty()

    // 2. Gjenero intelligence
    const intelligence = await generateIntelligenceForProperty(property.id)

    // 3. Verifiko në DB
    const verified = await verifyIntelligenceInDB(property.id)

    if (!verified) {
      log('❌', 'Inteligjenca NUK u ruajt në DB!', COLORS.red)
      return
    }

    // 4. Gjej pronat përreth
    const nearby = await findNearbyProperties(property)

    // 5. Test invalidation
    await testInvalidation(property, nearby)

    // 6. Test cascade
    await testCascadeRegeneration(property.id)

    // 7. Raport final
    await finalReport()

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)

    console.log('')
    log('🎉', `TEST PËRFUNDOI NË ${duration}s`, COLORS.green)
    console.log('')
  } catch (error: any) {
    log('❌', `FATAL ERROR: ${error.message}`, COLORS.red)
    console.error(error)
    process.exit(1)
  }
}

main()
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })