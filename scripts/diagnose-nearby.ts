import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { PrismaClient } from '@prisma/client'

dotenv.config({ path: resolve(process.cwd(), '.env') })

const prisma = new PrismaClient()

async function diagnose() {
  console.log('\n🔍 DIAGNOSE NEARBY PROPERTIES\n')
  console.log('═'.repeat(60))

  // 1. Merr pronën testuese
  const property = await prisma.property.findFirst({
    where: {
      id: 12,
    },
    select: {
      id: true,
      title: true,
      city: true,
      neighborhood: true,
      property_type: true,
      listing_type: true,
      status: true,
      review_status: true,
    },
  })

  if (!property) {
    console.log('❌ Prona 12 nuk u gjet')
    return
  }

  console.log('📝 Prona testuese:')
  console.log(`   ID: ${property.id}`)
  console.log(`   City: "${property.city}"`)
  console.log(`   Neighborhood: "${property.neighborhood}"`)
  console.log(`   Type: "${property.property_type}"`)
  console.log(`   Listing: "${property.listing_type}"`)
  console.log(`   Status: "${property.status}"`)
  console.log(`   Review: "${property.review_status}"`)
  console.log('')

  // 2. Kontrollo sa prona të tjera ka në Prishtina
  const totalInPrishtina = await prisma.property.count({
    where: {
      id: { not: 12 },
      status: 'PUBLISHED',
      review_status: 'APPROVED',
      city: 'Prishtina',
    },
  })

  console.log(`📊 Total prona në Prishtina (jo #12): ${totalInPrishtina}`)
  console.log('')

  // 3. Kontrollo sa kanë property_type = apartment
  const withApartment = await prisma.property.count({
    where: {
      id: { not: 12 },
      status: 'PUBLISHED',
      review_status: 'APPROVED',
      city: 'Prishtina',
      property_type: 'apartment',
    },
  })

  console.log(`📊 Me property_type="apartment": ${withApartment}`)
  console.log('')

  // 4. Kontrollo sa kanë listing_type = sale
  const withSale = await prisma.property.count({
    where: {
      id: { not: 12 },
      status: 'PUBLISHED',
      review_status: 'APPROVED',
      city: 'Prishtina',
      property_type: 'apartment',
      listing_type: 'sale',
    },
  })

  console.log(`📊 Me listing_type="sale": ${withSale}`)
  console.log('')

  // 5. Shfaq disa shembuj
  const examples = await prisma.property.findMany({
    where: {
      id: { not: 12 },
      status: 'PUBLISHED',
      review_status: 'APPROVED',
      city: 'Prishtina',
    },
    select: {
      id: true,
      title: true,
      property_type: true,
      listing_type: true,
      status: true,
      review_status: true,
    },
    take: 20,
  })

  console.log('📋 Shembuj prona në Prishtina:')
  console.log('')
  for (const p of examples) {
    console.log(`   #${p.id} ${p.title.substring(0, 40)}...`)
    console.log(`      type="${p.property_type}" listing="${p.listing_type}" status="${p.status}" review="${p.review_status}"`)
  }
  console.log('')

  // 6. Kontrollo vlerat e ndryshme
  const distinctTypes = await prisma.property.groupBy({
    by: ['property_type'],
    where: {
      id: { not: 12 },
      status: 'PUBLISHED',
      review_status: 'APPROVED',
      city: 'Prishtina',
    },
    _count: true,
  })

  console.log('📊 Property types në Prishtina:')
  for (const t of distinctTypes) {
    console.log(`   "${t.property_type}": ${t._count}`)
  }
  console.log('')

  const distinctListings = await prisma.property.groupBy({
    by: ['listing_type'],
    where: {
      id: { not: 12 },
      status: 'PUBLISHED',
      review_status: 'APPROVED',
      city: 'Prishtina',
    },
    _count: true,
  })

  console.log('📊 Listing types në Prishtina:')
  for (const l of distinctListings) {
    console.log(`   "${l.listing_type}": ${l._count}`)
  }
  console.log('')

  const distinctStatus = await prisma.property.groupBy({
    by: ['status'],
    where: {
      id: { not: 12 },
      city: 'Prishtina',
    },
    _count: true,
  })

  console.log('📊 Status në Prishtina:')
  for (const s of distinctStatus) {
    console.log(`   "${s.status}": ${s._count}`)
  }
  console.log('')

  console.log('═'.repeat(60))
  console.log('✅ DIAGNOSE PËRFUNDOI')
  console.log('═'.repeat(60))
  console.log('')
}

diagnose()
  .catch(console.error)
  .finally(() => prisma.$disconnect())