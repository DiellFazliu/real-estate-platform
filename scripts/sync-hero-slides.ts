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

  // 1. FETCH SLIDES NGA SANITY
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

  // 2. SYNC ÇDO SLIDE
  let created = 0
  let updated = 0
  let failed = 0

  for (const slide of slides) {
    try {
      let property_id: number | null = null

      if (slide.propertyRef) {
        const property = await prisma.property.findUnique({
          where: { sanity_id: slide.propertyRef },
          select: { id: true },
        })

        if (property) {
          property_id = property.id
        } else {
          console.log(
            `   ⚠️  Slide "${slide.title}": propertyRef "${slide.propertyRef}" nuk u gjet në Prisma`
          )
        }
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
      } else {
        await prisma.heroSlide.create({ data: metadata })
        created++
      }
    } catch (error: any) {
      failed++
      console.error(`   ❌ Failed: ${slide.title} - ${error.message}`)
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 3. CLEANUP — FSHI SLIDES QË NUK EKZISTOJNË MË NË SANITY
  // ═══════════════════════════════════════════════════════════
  const sanitySlideIds = slides.map((s: any) => s._id)

  // 3a. Fshi slides që janë fshirë/unpublished në Sanity
  const deletedOrphaned = await prisma.heroSlide.deleteMany({
    where: {
      sanity_id: {
        notIn: sanitySlideIds,
      },
    },
  })

  // 3b. Fshi slides që në Sanity NUK kanë propertyRef (invalid slide)
  const slidesWithoutPropertyRef = slides
    .filter((s: any) => !s.propertyRef)
    .map((s: any) => s._id)

  const deletedInvalid = await prisma.heroSlide.deleteMany({
    where: {
      sanity_id: { in: slidesWithoutPropertyRef },
    },
  })

  console.log(`\n🗑️  Cleanup:`)
  console.log(`   - Fshirë slides orfan (jo në Sanity): ${deletedOrphaned.count}`)
  console.log(`   - Fshirë slides pa propertyRef:       ${deletedInvalid.count}`)

  // ═══════════════════════════════════════════════════════════
  // 4. SUMMARY
  // ═══════════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(60))
  console.log('✅ SYNC COMPLETED!')
  console.log('═'.repeat(60))
  console.log(`   ✨ Created: ${created}`)
  console.log(`   🔄 Updated: ${updated}`)
  console.log(`   ❌ Failed:  ${failed}`)
  console.log(`   🗑️  Deleted: ${deletedOrphaned.count + deletedInvalid.count}`)
  console.log(`   📊 Total:   ${slides.length}`)
  console.log('═'.repeat(60) + '\n')
}

syncHeroSlides()
  .catch(console.error)
  .finally(() => prisma.$disconnect())