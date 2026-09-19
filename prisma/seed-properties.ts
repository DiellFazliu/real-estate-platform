// ═══════════════════════════════════════════════════════════════
// SEED PROPERTIES - 1000 PRONA ME IMAZHE TË VERIFIKUARA
// ═══════════════════════════════════════════════════════════════

import { PrismaClient } from '@prisma/client'
import {
  pickRandomCity,
  randomCoordinatesNear,
} from './seed-data/cities'
import {
  pickRandomNeighborhood,
  randomAddress,
} from './seed-data/neighborhoods'
import {
  pickImages,
  getPrimaryImage,
  isValidImageUrl,
  FALLBACK_IMAGE,
} from './seed-data/images'
import {
  generateTitle,
  generateDescription,
  generateSlug,
} from './seed-data/templates'
import {
  randomInt,
  randomElement,
  randomBoolean,
  randomPrice,
  randomRentPrice,
  round2,
} from './seed-data/utils'

const prisma = new PrismaClient()

// ═══════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════

const TOTAL_PROPERTIES = 1000

const PROPERTY_TYPE_DISTRIBUTION = {
  apartment: 0.5,
  house: 0.25,
  villa: 0.1,
  studio: 0.05,
  penthouse: 0.05,
  commercial: 0.03,
  office: 0.02,
}

const CONDITION_DISTRIBUTION = {
  new: 0.2,
  excellent: 0.35,
  good: 0.3,
  needs_renovation: 0.1,
  under_construction: 0.05,
}

const FURNISHED_DISTRIBUTION = {
  unfurnished: 0.3,
  semi_furnished: 0.4,
  fully_furnished: 0.3,
}

const ORIENTATIONS = [
  'north',
  'south',
  'east',
  'west',
  'north_east',
  'north_west',
  'south_east',
  'south_west',
]

const ENERGY_CLASSES = ['A+', 'A', 'B', 'C', 'D', 'E', 'F']

const EXTRA_FEATURES = [
  'Smart Home',
  'Fireplace',
  'Pamje panoramike',
  'Kuzhinë moderne',
  'Dysheme druri',
  'Tavan i lartë',
  'Verandë',
  'Barbecue',
  'Sauna',
  'Jacuzzi',
  'Sistem alarmi',
  'Kamera sigurie',
  'Intercom',
  'Depo',
  'Lavanderi',
  'Terracë',
  'Studim',
  'Garderobë',
]

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function pickWeighted<T extends Record<string, number>>(
  distribution: T
): string {
  const random = Math.random()
  let cumulative = 0

  for (const [key, prob] of Object.entries(distribution)) {
    cumulative += prob
    if (random <= cumulative) return key
  }

  return Object.keys(distribution)[0]
}

function pickExtraFeatures(count: number): string[] {
  const shuffled = [...EXTRA_FEATURES].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

function calculateBedrooms(propertyType: string): number | null {
  switch (propertyType) {
    case 'studio':
      return 1
    case 'apartment':
      return randomInt(1, 5)
    case 'house':
      return randomInt(2, 7)
    case 'villa':
      return randomInt(3, 8)
    case 'penthouse':
      return randomInt(2, 5)
    case 'commercial':
    case 'office':
      return null
    default:
      return randomInt(1, 4)
  }
}

function calculateBathrooms(bedrooms: number | null): number | null {
  if (!bedrooms) return randomInt(1, 2)
  return Math.max(1, Math.floor(bedrooms / 2) + randomInt(0, 1))
}

function calculateArea(propertyType: string): number {
  switch (propertyType) {
    case 'studio':
      return randomInt(25, 50)
    case 'apartment':
      return randomInt(50, 150)
    case 'house':
      return randomInt(120, 350)
    case 'villa':
      return randomInt(200, 600)
    case 'penthouse':
      return randomInt(120, 300)
    case 'commercial':
      return randomInt(80, 500)
    case 'office':
      return randomInt(50, 400)
    default:
      return randomInt(50, 200)
  }
}

function calculateFloor(propertyType: string) {
  if (propertyType === 'house' || propertyType === 'villa') {
    return { floor: null, totalFloors: null }
  }

  const totalFloors = randomInt(3, 15)
  const floor = randomInt(1, totalFloors)

  return { floor, totalFloors }
}

function calculateYearBuilt(condition: string): number {
  const currentYear = new Date().getFullYear()

  switch (condition) {
    case 'new':
      return currentYear - randomInt(0, 2)
    case 'under_construction':
      return currentYear + randomInt(0, 1)
    case 'excellent':
      return currentYear - randomInt(3, 10)
    case 'good':
      return currentYear - randomInt(10, 25)
    case 'needs_renovation':
      return currentYear - randomInt(25, 60)
    default:
      return currentYear - randomInt(5, 30)
  }
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main() {
  console.log('')
  console.log('═══════════════════════════════════════════════════')
  console.log('🏠 SEED PROPERTIES - 1000 PRONA')
  console.log('═══════════════════════════════════════════════════')
  console.log('')

  // Kontrollo user-at
  const sellerUser = await prisma.user.findUnique({
    where: { email: 'seller@villaron.com' },
  })
  const ownerUser = await prisma.user.findUnique({
    where: { email: 'owner@villaron.com' },
  })

  if (!sellerUser || !ownerUser) {
    console.error('❌ User-at nuk ekzistojnë.')
    console.error('   Ekzekuto: npx prisma db seed')
    process.exit(1)
  }

  // Fshij pronat e vjetra
  const existingCount = await prisma.property.count()
  if (existingCount > 0) {
    console.log(`⚠️  Duke fshirë ${existingCount} prona të vjetra...`)
    await prisma.favorite.deleteMany({})
    await prisma.appointment.deleteMany({})
    await prisma.propertyView.deleteMany({})
    await prisma.inquiry.deleteMany({})
    await prisma.property.deleteMany({})
    console.log('✅ Fshirë')
    console.log('')
  }

  console.log(`🚀 Duke gjeneruar ${TOTAL_PROPERTIES} prona...\n`)

  const startTime = Date.now()
  let created = 0
  let skipped = 0
  const batchSize = 100

  for (let i = 0; i < TOTAL_PROPERTIES; i += batchSize) {
    const batch = []
    const currentBatchSize = Math.min(batchSize, TOTAL_PROPERTIES - i)

    for (let j = 0; j < currentBatchSize; j++) {
      const index = i + j

      // 1. Qyteti dhe lagjja
      const city = pickRandomCity()
      const neighborhood = pickRandomNeighborhood(city.name)

      // 2. Karakteristikat
      const propertyType = pickWeighted(PROPERTY_TYPE_DISTRIBUTION)
      const condition = pickWeighted(CONDITION_DISTRIBUTION)
      const furnished = pickWeighted(FURNISHED_DISTRIBUTION)

      const bedrooms = calculateBedrooms(propertyType)
      const bathrooms = calculateBathrooms(bedrooms)
      const area = calculateArea(propertyType)
      const { floor, totalFloors } = calculateFloor(propertyType)
      const yearBuilt = calculateYearBuilt(condition)
      const orientation = randomElement(ORIENTATIONS)
      const energyClass = randomElement(ENERGY_CLASSES)

      // 3. Listing type
      const isRent = Math.random() < 0.3
      const listingType = isRent ? 'rent' : 'sale'

      // 4. Çmimi
      const basePrice = randomPrice(propertyType, city.name, area)
      const price = isRent ? randomRentPrice(basePrice) : basePrice
      const pricePerM2 = isRent ? null : round2(price / area)

      // 5. Koordinatat
      const { lat, lng } = randomCoordinatesNear(city, 3)
      const location = randomAddress(neighborhood)

      // ⭐ 6. IMAGES - ME VALIDIM TË FORTË
      const images = pickImages(propertyType, randomInt(4, 6))
      const primaryImage = getPrimaryImage(images)

      // VALIDIM FINAL - Nëse nuk ka imazh valid, përdor fallback
      if (!isValidImageUrl(primaryImage)) {
        console.warn(
          `⚠️  Fallback për ${propertyType} at index ${index}`
        )
        skipped++
        // Vazhdon me fallback
      }

      // 7. Veçoritë
      const hasElevator =
        propertyType !== 'house' && propertyType !== 'villa'
          ? randomBoolean(0.6)
          : false
      const hasParking = randomBoolean(0.5)
      const hasGarden =
        propertyType === 'house' || propertyType === 'villa'
          ? randomBoolean(0.8)
          : randomBoolean(0.15)
      const hasPool =
        propertyType === 'villa' ? randomBoolean(0.4) : randomBoolean(0.05)
      const hasAC = randomBoolean(0.7)
      const hasHeating = randomBoolean(0.85)
      const hasSecurity = randomBoolean(0.4)
      const hasInternet = randomBoolean(0.75)

      const extraFeatures = pickExtraFeatures(randomInt(1, 4))

      // 8. Title & Description
      const title = generateTitle(
        propertyType,
        bedrooms,
        neighborhood,
        city.name,
        condition,
        area,
        listingType
      )

      const description = generateDescription({
        propertyType,
        bedrooms,
        bathrooms,
        area,
        floor,
        totalFloors,
        yearBuilt,
        condition,
        furnished,
        orientation,
        neighborhood,
        city: city.name,
        hasElevator,
        hasParking,
        hasGarden,
        hasPool,
        hasAirConditioning: hasAC,
        hasHeating,
        hasSecurity,
        hasInternet,
        features: extraFeatures,
        listingType,
        price,
      })

      // 9. Status
      const isFeatured = randomBoolean(0.15)
      const isSold = randomBoolean(0.05) && !isRent
      const status = isSold ? 'SOLD' : 'PUBLISHED'

      // 10. Identifikues
      const timestamp = Date.now()
      const randomStr = Math.random().toString(36).substring(2, 10)
      const sanityId = `property-${timestamp}-${index}-${randomStr}`
      const slug = generateSlug(title, `${index + 1}`)

      // 11. Analytics
      const viewCount = randomInt(0, 500)
      const favoriteCount = randomInt(0, 30)
      const inquiryCount = randomInt(0, 10)

      // 12. Timestamps
      const daysAgo = randomInt(0, 365)
      const publishedAt = new Date(
        Date.now() - daysAgo * 24 * 60 * 60 * 1000
      )

      // 13. Listed by
      const listedById =
        Math.random() < 0.5 ? sellerUser.id : ownerUser.id

      // ⭐ GARANTO që primary_image_url është gjithmonë valid
      const finalPrimaryImage = isValidImageUrl(primaryImage)
        ? primaryImage
        : FALLBACK_IMAGE

      batch.push({
        sanity_id: sanityId,
        slug,
        title,
        price,
        price_per_m2: pricePerM2,
        status,
        featured: isFeatured,
        listing_type: listingType,
        primary_image_url: finalPrimaryImage,

        // Location
        location,
        neighborhood,
        city: city.name,
        postal_code: city.postalCode,
        latitude: lat,
        longitude: lng,
        distance_from_center: round2(randomFloat(0.3, 5)),

        // Characteristics
        property_type: propertyType,
        bedrooms,
        bathrooms,
        area,
        balconies: randomInt(0, 3),
        floor,
        total_floors: totalFloors,
        year_built: yearBuilt,
        renovation_year:
          condition === 'needs_renovation'
            ? null
            : yearBuilt + randomInt(0, 5),
        condition,
        orientation,
        furnished,

        // Features
        has_elevator: hasElevator,
        has_parking: hasParking,
        has_garden: hasGarden,
        has_pool: hasPool,
        has_air_conditioning: hasAC,
        has_heating: hasHeating,
        has_security: hasSecurity,
        has_internet: hasInternet,
        features: extraFeatures,
        energy_class: energyClass,

        // Source & Review
        source: 'OWNER',
        review_status: 'APPROVED',
        listed_by_id: listedById,

        // Analytics
        view_count: viewCount,
        favorite_count: favoriteCount,
        inquiry_count: inquiryCount,

        // Timestamps
        published_at: publishedAt,
      })
    }

    // Insert batch
    await prisma.property.createMany({
      data: batch,
      skipDuplicates: true,
    })

    created += batch.length

    const percent = Math.round((created / TOTAL_PROPERTIES) * 100)
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(
      `✅ ${created}/${TOTAL_PROPERTIES} (${percent}%) - ${elapsed}s`
    )
  }

  // ═══════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════

  const total = await prisma.property.count()
  const saleCount = await prisma.property.count({
    where: { listing_type: 'sale' },
  })
  const rentCount = await prisma.property.count({
    where: { listing_type: 'rent' },
  })
  const featuredCount = await prisma.property.count({
    where: { featured: true },
  })

  // Kontrollo imazhet
  const withImage = await prisma.property.count({
    where: { primary_image_url: { not: null } },
  })

  // Kontrollo imazhet e pavlefshme
  const allProperties = await prisma.property.findMany({
    select: { primary_image_url: true },
  })
  const invalidImages = allProperties.filter(
    (p) =>
      !p.primary_image_url ||
      !p.primary_image_url.startsWith('http') ||
      !p.primary_image_url.includes('unsplash.com')
  ).length

  console.log('')
  console.log('═══════════════════════════════════════════════════')
  console.log('✅ SEED PËRFUNDOI!')
  console.log('═══════════════════════════════════════════════════')
  console.log(`   📊 Total: ${total}`)
  console.log(`   💰 Sale: ${saleCount}`)
  console.log(`   🔑 Rent: ${rentCount}`)
  console.log(`   ⭐ Featured: ${featuredCount}`)
  console.log(`   🖼️  Me imazhe: ${withImage}`)
  console.log(`   ⚠️  Skipped (fallback): ${skipped}`)
  console.log(`   ✅ Imazhe valide: ${total - invalidImages}`)
  console.log(`   ❌ Imazhe jo-valide: ${invalidImages}`)
  console.log(
    `   ⏱️  Time: ${((Date.now() - startTime) / 1000).toFixed(1)}s`
  )
  console.log('═══════════════════════════════════════════════════')
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Gabim:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })