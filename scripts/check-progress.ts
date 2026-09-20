import * as dotenv from 'dotenv'
import { resolve } from 'path'
import { existsSync } from 'fs'

for (const file of ['.env.local', '.env']) {
  const path = resolve(process.cwd(), file)
  if (existsSync(path)) {
    dotenv.config({ path, override: true })
    break
  }
}

import { prisma } from '../lib/db/prisma'

async function main() {
  const total = await prisma.property.count({
    where: { status: 'PUBLISHED', review_status: 'APPROVED' },
  })

  const withIntelligence = await prisma.propertyIntelligence.count()

  const withoutIntelligence = total - withIntelligence

  const percent = ((withIntelligence / total) * 100).toFixed(1)

  console.log('')
  console.log('═══════════════════════════════════════════════════')
  console.log('📊 PROGRESI I INTELLIGENCE')
  console.log('═══════════════════════════════════════════════════')
  console.log('')
  console.log(`   Total prona:          ${total}`)
  console.log(`   Me intelligence:      ${withIntelligence} ✅`)
  console.log(`   Pa intelligence:      ${withoutIntelligence} ⏳`)
  console.log(`   Progresi:             ${percent}%`)
  console.log('')

  // Shfaq 5 pronat e fundit
  const recent = await prisma.propertyIntelligence.findMany({
    orderBy: { generated_at: 'desc' },
    take: 5,
    include: {
      property: {
        select: { title: true, city: true },
      },
    },
  })

  console.log('   📋 5 pronat e fundit:')
  for (const i of recent) {
    const time = i.generated_at.toLocaleTimeString('sq-AL')
    console.log(`      ${time} - ${i.property.title}`)
  }

  console.log('')
  console.log('═══════════════════════════════════════════════════')
  console.log('')

  await prisma.$disconnect()
}

main().catch(console.error)