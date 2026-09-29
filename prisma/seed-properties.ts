// ═══════════════════════════════════════════════════════════════
// SEED PROPERTIES - 1000 PRONA TË DHËNASH DEMO
// Ekzekuto: npx tsx prisma/seed-properties.ts
// ═══════════════════════════════════════════════════════════════

import { prisma } from './seed/lib/db'
import { log } from './seed/lib/logger'
import { SEED_CONFIG } from './seed/lib/config'
import {
  randomInt,
  randomElement,
  randomBoolean,
  randomFloat,
  pickWeighted,
  shuffle,
  round2,
} from './seed/lib/random'
import {
  pickRandomCity,
  pickRandomNeighborhood,
  randomCoordinatesNear,
  randomAddress,
  type CityData,
} from './seed/lib/cities'
import {
  randomSalePrice,
  randomRentPrice,
  computePricePerM2,
} from './seed/lib/pricing'
import {
  pickImages,
  getPrimaryImage,
  FALLBACK_IMAGE,
  isValidImageUrl,
} from './seed/lib/images'
import { generateTitle, generateSlug } from './seed/lib/titles'
import { generateDescription } from './seed/lib/descriptions'

// ═══════════════════════════════════════════════════════════════
// KONFIGURIMI I SHPËRNDARJES
// ═══════════════════════════════════════════════════════════════

const PROPERTY_TYPE_WEIGHTS = {
  apartment: 0.50,
  house: 0.25,
  villa: 0.10,
  studio: 0.05,
  penthouse: 0.05,
  commercial: 0.03,
  office: 0.02,
}

const CONDITION_WEIGHTS = {
  new: 0.20,
  excellent: 0.35,
  good: 0.30,
  needs_renovation: 0.10,
  under_construction: 0.05,
}

const FURNISHED_WEIGHTS = {
  unfurnished: 0.30,
  semi_furnished: 0.40,
  fully_furnished: 0.30,
}

const ORIENTATIONS = [
  'north', 'south', 'east', 'west',
  'north_east', 'north_west', 'south_east', 'south_west',
] as const

const ENERGY_CLASSES = ['A+', 'A', 'B', 'C', 'D', 'E', 'F'] as const

const EXTRA_FEATURES = [
  'Smart Home', 'Fireplace', 'Pamje panoramike', 'Kuzhinë moderne',
  'Dysheme druri', 'Tavan i lartë', 'Verandë', 'Barbecue',
  'Sauna', 'Jacuzzi', 'Sistem alarmi', 'Kamera sigurie',
  'Intercom', 'Depo', 'Lavanderi', 'Terracë', 'Studim', 'Garderobë',
] as const

// ═══════════════════════════════════════════════════════════════
// LLOGARITJET E KARAKTERISTIKAVE
// ═══════════════════════════════════════════════════════════════

function calculateBedrooms(propertyType: string): number | null {
  switch (propertyType) {
    case 'studio': return 1
    case 'apartment': return randomInt(1, 5)
    case 'house': return randomInt(2, 7)
    case 'villa': return randomInt(3, 8)
    case 'penthouse': return randomInt(2, 5)
    case 'commercial':
    case 'office': return null
    default: return randomInt(1, 4)
  }
}

function calculateBathrooms(bedrooms: number | null): number | null {
  if (!bedrooms) return randomInt(1, 2)
  return Math.max(1, Math.floor(bedrooms / 2) + randomInt(0, 1))
}

function calculateArea(propertyType: string): number {
  switch (propertyType) {
    case 'studio': return randomInt(25, 50)
    case 'apartment': return randomInt(50, 150)
    case 'house': return randomInt(120, 350)
    case 'villa': return randomInt(200, 600)
    case 'penthouse': return randomInt(120, 300)
    case 'commercial': return randomInt(80, 500)
    case 'office': return randomInt(50, 400)
    default: return randomInt(50, 200)
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
    case 'new': return currentYear - randomInt(0, 2)
    case 'under_construction': return currentYear + randomInt(0, 1)
    case 'excellent': return currentYear - randomInt(3, 10)
    case 'good': return currentYear - randomInt(10, 25)
    case 'needs_renovation': return currentYear - randomInt(25, 60)
    default: return currentYear - randomInt(5, 30)
  }
}

// ═══════════════════════════════════════════════════════════════
// GJENERATORI I NJË PRONE
// ═══════════════════════════════════════════════════════════════

interface PropertyGeneratorInput {
  index: number
  sellerId: number
  ownerId: number
}

function generateProperty(input: PropertyGeneratorInput) {
  const { index, sellerId, ownerId } = input

  // 1. Lokacioni
  const city = pickRandomCity()
  const neighborhood = pickRandomNeighborhood(city)

  // 2. Karakteristikat
  const propertyType = pickWeighted(PROPERTY_TYPE_WEIGHTS) as string
  const condition = pickWeighted(CONDITION_WEIGHTS) as string
  const furnished = pickWeighted(FURNISHED_WEIGHTS) as string

  const bedrooms = calculateBedrooms(propertyType)
  const bathrooms = calculateBathrooms(bedrooms)
  const area = calculateArea(propertyType)
  const { floor, totalFloors } = calculateFloor(propertyType)
  const yearBuilt = calculateYearBuilt(condition)
  const orientation = randomElement(ORIENTATIONS)
  const energyClass = randomElement(ENERGY_CLASSES)

  // 3. Lloji i listimit dhe çmimi
  const isRent = Math.random() < 0.3
  const listingType = isRent ? 'rent' : 'sale'
  const basePrice = randomSalePrice(propertyType, city.name, area)
  const price = isRent ? randomRentPrice(basePrice) : basePrice
  const pricePerM2 = isRent ? null : computePricePerM2(price, area)

  // 4. Koordinatat dhe adresa
  const { lat, lng } = randomCoordinatesNear(city, 3)
  const location = randomAddress(neighborhood)

  // 5. Imazhet
  const images = pickImages(propertyType, randomInt(4, 6))
  const primaryImage = getPrimaryImage(images)
  const finalPrimaryImage = isValidImageUrl(primaryImage)
    ? primaryImage
    : FALLBACK_IMAGE

  // 6. Veçoritë (boolean)
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
  const hasAirConditioning = randomBoolean(0.7)
  const hasHeating = randomBoolean(0.85)
  const hasSecurity = randomBoolean(0.4)
  const hasInternet = randomBoolean(0.75)

  const extraFeatures = shuffle(EXTRA_FEATURES).slice(0, randomInt(1, 4))

  // 7. Titulli
  const title = generateTitle({
    propertyType,
    bedrooms,
    neighborhood,
    cityLocative: city.nameLocative,
  })

  // 8. Përshkrimi
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
    cityLocative: city.nameLocative,
    cityGenitive: city.nameGenitive,
    hasElevator,
    hasParking,
    hasGarden,
    hasPool,
    hasAirConditioning,
    hasHeating,
    hasSecurity,
    hasInternet,
    features: extraFeatures as unknown as string[],
  })

  // 9. Statusi
  const isFeatured = randomBoolean(0.15)
  const isSold = randomBoolean(0.05) && !isRent
  const status = isSold ? 'SOLD' : 'PUBLISHED'

  // 10. Identifikuesit
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
  const publishedAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)

  // 13. Listuesi
  const listedById = Math.random() < 0.5 ? sellerId : ownerId

  return {
    // Identifikues
    sanity_id: sanityId,
    slug,
    title,
    description,

    // Çmimi
    price,
    price_per_m2: pricePerM2,

    // Statusi
    status,
    featured: isFeatured,
    listing_type: listingType,
    primary_image_url: finalPrimaryImage,

    // Lokacioni
    location,
    neighborhood,
    city: city.name,
    postal_code: city.postalCode,
    latitude: lat,
    longitude: lng,
    distance_from_center: round2(randomFloat(0.3, 5)),

    // Karakteristikat
    property_type: propertyType,
    bedrooms,
    bathrooms,
    area,
    balconies: randomInt(0, 3),
    floor,
    total_floors: totalFloors,
    year_built: yearBuilt,
    renovation_year:
      condition === 'needs_renovation' ? null : yearBuilt + randomInt(0, 5),
    condition,
    orientation,
    furnished,

    // Veçoritë
    has_elevator: hasElevator,
    has_parking: hasParking,
    has_garden: hasGarden,
    has_pool: hasPool,
    has_air_conditioning: hasAirConditioning,
    has_heating: hasHeating,
    has_security: hasSecurity,
    has_internet: hasInternet,
    features: extraFeatures as unknown as string[],
    energy_class: energyClass,

    // Source & Review
    source: 'OWNER' as const,
    review_status: 'APPROVED' as const,
    listed_by_id: listedById,

    // Analytics
    view_count: viewCount,
    favorite_count: favoriteCount,
    inquiry_count: inquiryCount,

    // Timestamps
    published_at: publishedAt,
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main() {
  const startTime = Date.now()
  log.header('🏠 SEED PROPERTIES - 1000 PRONA')

  // 1. Kontrollo ekzistencën e përdoruesve
  const [seller, owner] = await Promise.all([
    prisma.user.findUnique({ where: { email: SEED_CONFIG.USERS.SELLER } }),
    prisma.user.findUnique({ where: { email: SEED_CONFIG.USERS.OWNER } }),
  ])

  if (!seller || !owner) {
    log.error('Përdoruesit bazë nuk ekzistojnë.')
    log.info('Ekzekuto fillimisht: npx prisma db seed')
    process.exit(1)
  }

  // 2. Fshij pronat e vjetra (CASCADE heq varësitë)
  const existingCount = await prisma.property.count()
  if (existingCount > 0) {
    log.warn(`Duke fshirë ${existingCount} prona të vjetra...`)

    await prisma.favorite.deleteMany({})
    await prisma.appointment.deleteMany({})
    await prisma.propertyView.deleteMany({})
    await prisma.inquiry.deleteMany({})
    await prisma.property.deleteMany({})

    log.success('Pastrimi përfundoi')
  }

  // 3. Gjenero pronat në batches
  log.section(`Gjenerimi i ${SEED_CONFIG.TOTAL_PROPERTIES} pronave`)

  let created = 0
  const batchSize = SEED_CONFIG.BATCH_SIZE

  for (let i = 0; i < SEED_CONFIG.TOTAL_PROPERTIES; i += batchSize) {
    const batch = []
    const currentBatchSize = Math.min(
      batchSize,
      SEED_CONFIG.TOTAL_PROPERTIES - i
    )

    for (let j = 0; j < currentBatchSize; j++) {
      const index = i + j
      batch.push(
        generateProperty({
          index,
          sellerId: seller.id,
          ownerId: owner.id,
        })
      )
    }

    await prisma.property.createMany({
      data: batch,
      skipDuplicates: true,
    })

    created += batch.length
    const percent = Math.round((created / SEED_CONFIG.TOTAL_PROPERTIES) * 100)
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    log.item(`✅ ${created}/${SEED_CONFIG.TOTAL_PROPERTIES} (${percent}%) - ${elapsed}s`)
  }

  // 4. Raport final
  const [
    total,
    saleCount,
    rentCount,
    featuredCount,
    withImage,
    invalidCount,
  ] = await Promise.all([
    prisma.property.count(),
    prisma.property.count({ where: { listing_type: 'sale' } }),
    prisma.property.count({ where: { listing_type: 'rent' } }),
    prisma.property.count({ where: { featured: true } }),
    prisma.property.count({ where: { primary_image_url: { not: null } } }),
    prisma.property.count({
      where: {
        OR: [
          { primary_image_url: null },
          { NOT: { primary_image_url: { contains: 'unsplash.com' } } },
        ],
      },
    }),
  ])

  log.section('Përmbledhje')
  log.item(`📊 Total:          ${total}`)
  log.item(`💰 Për shitje:     ${saleCount}`)
  log.item(`🔑 Me qira:        ${rentCount}`)
  log.item(`⭐ Featured:       ${featuredCount}`)
  log.item(`🖼️  Me imazhe:      ${withImage}`)
  log.item(`❌ Imazhe të këqija: ${invalidCount}`)

  log.done(Date.now() - startTime)
}

main()
  .catch((error) => {
    log.error(`Gabim fatal: ${error.message}`)
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())