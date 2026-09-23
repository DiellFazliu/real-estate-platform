import { createClient } from '@sanity/client'
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { existsSync } from 'fs'

// ═══════════════════════════════════════════════════════════════
// LOAD ENV
// ═══════════════════════════════════════════════════════════════

for (const file of ['.env.local', '.env']) {
  const path = resolve(process.cwd(), file)
  if (existsSync(path)) {
    dotenv.config({ path, override: true })
    break
  }
}

const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2026-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

const prisma = new PrismaClient()

// ═══════════════════════════════════════════════════════════════
// MAIN FUNCTION
// ═══════════════════════════════════════════════════════════════

async function syncHeroSlides() {
  console.log('\n🔄 Syncing hero slides...\n')

  // ═══════════════════════════════════════════════════════════
  // 1. FETCH SLIDES NGA SANITY
  // ═══════════════════════════════════════════════════════════
  const slides = await sanity.fetch(`
    *[_type == "heroSlide"] {
      _id,
      title,
      subtitle,
      price,
      description,
      badge,
      order,
      isActive,
      "imageUrl": image.asset->url,
      "propertyRef": property._ref
    }
  `)

  console.log(`📦 Found ${slides.length} hero slides\n`)

  // ═══════════════════════════════════════════════════════════
  // 2. FETCH TË GJITHA PROPERTIES PËR LOOKUP
  // ═══════════════════════════════════════════════════════════
  const allProperties = await prisma.property.findMany({
    select: {
      id: true,
      sanity_id: true,
      slug: true,
      title: true,
    },
  })

  console.log(`📦 Found ${allProperties.length} properties in DB\n`)

  // ═══════════════════════════════════════════════════════════
  // 3. DEBUG - SHFAQ PROPERTIES NË DB
  // ═══════════════════════════════════════════════════════════
  console.log('═══════════════════════════════════════════════════════════')
  console.log('🔍 PROPERTIES NË DATABASE:')
  console.log('═══════════════════════════════════════════════════════════')
  allProperties.forEach((p, i) => {
    console.log(`  ${i + 1}. sanity_id: "${p.sanity_id}"`)
    console.log(`     title: "${p.title}"`)
    console.log(`     slug: "${p.slug}"`)
    console.log(`     id: ${p.id}`)
    console.log('')
  })
  console.log('═══════════════════════════════════════════════════════════\n')

  // ═══════════════════════════════════════════════════════════
  // 4. DEBUG - SHFAQ SLIDES NGA SANITY
  // ═══════════════════════════════════════════════════════════
  console.log('═══════════════════════════════════════════════════════════')
  console.log('🔍 HERO SLIDES NGA SANITY:')
  console.log('═══════════════════════════════════════════════════════════')
  slides.forEach((s: any, i: number) => {
    console.log(`  ${i + 1}. _id: "${s._id}"`)
    console.log(`     title: "${s.title}"`)
    console.log(`     propertyRef: "${s.propertyRef || 'NULL'}"`)
    console.log('')
  })
  console.log('═══════════════════════════════════════════════════════════\n')

  // ═══════════════════════════════════════════════════════════
  // 5. SYNC ÇDO SLIDE
  // ═══════════════════════════════════════════════════════════
  let created = 0
  let updated = 0
  let failed = 0

  for (const slide of slides) {
    try {
      console.log(`\n📝 Processing: "${slide.title}"`)

      // ⭐ Lookup property nga propertyRef
      let property_id: number | null = null

      if (slide.propertyRef) {
        console.log(`   🔍 Looking for property with sanity_id: "${slide.propertyRef}"`)

        const property = await prisma.property.findUnique({
          where: { sanity_id: slide.propertyRef },
          select: { id: true, title: true, slug: true },
        })

        if (property) {
          property_id = property.id
          console.log(`   ✅ FOUND: "${property.title}" (id: ${property_id}, slug: ${property.slug})`)
        } else {
          console.log(`   ❌ NOT FOUND in DB`)
          console.log(`   💡 Available sanity_ids in DB:`)
          allProperties.forEach((p) => {
            console.log(`      - "${p.sanity_id}"`)
          })
        }
      } else {
        console.log(`   ⚠️  No propertyRef in Sanity slide`)
      }

      const metadata = {
        sanity_id: slide._id,
        title: slide.title || 'Untitled',
        subtitle: slide.subtitle || null,
        price: slide.price || null,
        description: slide.description || null,
        badge: slide.badge || null,
        image_url: slide.imageUrl || null,
        property_id,
        order: slide.order || 0,
        is_active: slide.isActive !== false,
        source: 'SANITY',
      }

      const existing = await prisma.heroSlide.findUnique({
        where: { sanity_id: slide._id },
      })

      if (existing) {
        await prisma.heroSlide.update({
          where: { sanity_id: slide._id },
          data: metadata,
        })
        updated++
        console.log(`   🔄 Updated (property_id: ${property_id})`)
      } else {
        await prisma.heroSlide.create({ data: metadata })
        created++
        console.log(`   ✨ Created (property_id: ${property_id})`)
      }
    } catch (error: any) {
      failed++
      console.error(`   ❌ Failed: ${slide.title} - ${error.message}`)
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 6. SUMMARY
  // ═══════════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(60))
  console.log('✅ SYNC COMPLETED!')
  console.log('═'.repeat(60))
  console.log(`   ✨ Created: ${created}`)
  console.log(`   🔄 Updated: ${updated}`)
  console.log(`   ❌ Failed:  ${failed}`)
  console.log(`   📊 Total:   ${slides.length}`)
  console.log('═'.repeat(60) + '\n')
}

syncHeroSlides()
  .catch(console.error)
  .finally(() => prisma.$disconnect())