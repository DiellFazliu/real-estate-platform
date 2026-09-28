import { createClient } from '@sanity/client'
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { existsSync } from 'fs'

// Load env
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

async function syncProperties() {
  console.log('\n🔄 Starting sync...\n')

  // ═══════════════════════════════════════════════════════════
  // 1. FETCH TË GJITHA PROPERTIES NGA SANITY
  // ═══════════════════════════════════════════════════════════
  const sanityProperties = await sanity.fetch(`
    *[_type == "property"] {
      _id,
      title,
      slug,
      description,
      price,
      pricePerM2,
      listingType,
      status,
      featured,
      location,
      neighborhood,
      city,
      postalCode,
      latitude,
      longitude,
      distanceFromCenter,
      propertyType,
      bedrooms,
      bathrooms,
      area,
      balconies,
      floor,
      totalFloors,
      yearBuilt,
      renovationYear,
      condition,
      orientation,
      furnished,
      hasElevator,
      hasParking,
      hasGarden,
      hasPool,
      hasAirConditioning,
      hasHeating,
      hasSecurity,
      hasInternet,
      features,
      energyClass,
      source,
      reviewStatus,
      listedBy,
      contactPhone,
      contactEmail,
      "primaryImageUrl": images[0].asset->url,
      _createdAt
    }
  `)

  console.log(`📦 Found ${sanityProperties.length} properties in Sanity\n`)

  if (sanityProperties.length === 0) {
    console.log('⚠️  No properties found in Sanity!')
    return
  }

  // ═══════════════════════════════════════════════════════════
  // 2. SYNC BATCH
  // ═══════════════════════════════════════════════════════════
  const batchSize = 50
  let created = 0
  let updated = 0
  let failed = 0

  for (let i = 0; i < sanityProperties.length; i += batchSize) {
    const batch = sanityProperties.slice(i, i + batchSize)

    await Promise.all(
      batch.map(async (p: any) => {
        try {
          // Lookup listed_by_id
          let resolvedListedById: number | null = null
          if (p.listedBy) {
            const user = await prisma.user.findUnique({
              where: { email: p.listedBy },
              select: { id: true },
            })
            if (user) resolvedListedById = user.id
          }

          const metadata = {
            sanity_id: p._id,
            slug: p.slug?.current || `property-${p._id}`,
            title: p.title || 'Untitled',
            price: p.price || 0,
            price_per_m2: p.pricePerM2 || null,
            status: p.status || 'PUBLISHED',
            featured: p.featured || false,
            listing_type: p.listingType || 'sale',

            location: p.location || null,
            neighborhood: p.neighborhood || null,
            city: p.city || null,
            postal_code: p.postalCode || null,
            latitude: p.latitude || null,
            longitude: p.longitude || null,
            distance_from_center: p.distanceFromCenter || null,

            property_type: p.propertyType || null,
            bedrooms: p.bedrooms || null,
            bathrooms: p.bathrooms || null,
            area: p.area || null,
            balconies: p.balconies || 0,
            floor: p.floor || null,
            total_floors: p.totalFloors || null,
            year_built: p.yearBuilt || null,
            renovation_year: p.renovationYear || null,
            condition: p.condition || null,
            orientation: p.orientation || null,
            furnished: p.furnished || null,

            has_elevator: p.hasElevator || false,
            has_parking: p.hasParking || false,
            has_garden: p.hasGarden || false,
            has_pool: p.hasPool || false,
            has_air_conditioning: p.hasAirConditioning || false,
            has_heating: p.hasHeating || false,
            has_security: p.hasSecurity || false,
            has_internet: p.hasInternet || false,
            features: p.features || [],
            energy_class: p.energyClass || null,

            source: p.source || 'OWNER',
            review_status: p.reviewStatus || 'APPROVED',
            listed_by_id: resolvedListedById,

            primary_image_url: p.primaryImageUrl || null,
          }

          const {
            status,
            review_status,
            source,
            listed_by_id: _listedById,
            ...contentMetadata
          } = metadata

          const existing = await prisma.property.findUnique({
            where: { sanity_id: p._id },
          })

          if (existing) {
            await prisma.property.update({
              where: { sanity_id: p._id },
              // Prisma remains authoritative for workflow and ownership fields.
              data: contentMetadata,
            })
            updated++
          } else {
            await prisma.property.create({
              data: {
                ...metadata,
                published_at:
                  p.status === 'PUBLISHED' ? new Date(p._createdAt) : null,
              },
            })
            created++
          }
        } catch (error: any) {
          failed++
          console.error(`❌ Failed: ${p.title} - ${error.message}`)
        }
      })
    )

    const batchNum = Math.floor(i / batchSize) + 1
    const totalBatches = Math.ceil(sanityProperties.length / batchSize)
    console.log(`✅ Batch ${batchNum}/${totalBatches} completed`)
  }

  // ═══════════════════════════════════════════════════════════
  // 3. SUMMARY
  // ═══════════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(60))
  console.log('✅ SYNC COMPLETED!')
  console.log('═'.repeat(60))
  console.log(`   ✨ Created: ${created}`)
  console.log(`   🔄 Updated: ${updated}`)
  console.log(`   ❌ Failed:  ${failed}`)
  console.log(`   📊 Total:   ${sanityProperties.length}`)
  console.log('═'.repeat(60) + '\n')
}

syncProperties()
  .catch(console.error)
  .finally(() => prisma.$disconnect())