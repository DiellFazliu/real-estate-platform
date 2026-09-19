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

const prisma = new PrismaClient()

async function checkImages() {
  console.log('')
  console.log('═══════════════════════════════════════════════════')
  console.log('🔍 IMAGE DIAGNOSTIC')
  console.log('═══════════════════════════════════════════════════')
  console.log('')

  // 1. Total properties
  const total = await prisma.property.count()
  console.log(`📊 Total properties: ${total}`)

  // 2. Me primary_image_url
  const withImage = await prisma.property.count({
    where: { primary_image_url: { not: null } },
  })
  console.log(`✅ Me primary_image_url: ${withImage}`)

  // 3. Pa primary_image_url
  const withoutImage = total - withImage
  console.log(`❌ Pa primary_image_url: ${withoutImage}`)

  // 4. Shembuj
  console.log('')
  console.log('📋 Shembuj (5 të parat):')

  const samples = await prisma.property.findMany({
    select: {
      id: true,
      title: true,
      primary_image_url: true,
      status: true,
      review_status: true,
    },
    take: 5,
  })

  for (const p of samples) {
    const isValid =
      p.primary_image_url &&
      p.primary_image_url.startsWith('http') &&
      p.primary_image_url.includes('unsplash.com')

    console.log(`   ${isValid ? '✅' : '❌'} #${p.id} ${p.title}`)
    console.log(`      URL: ${p.primary_image_url || 'NULL'}`)
    console.log(`      Status: ${p.status} | Review: ${p.review_status}`)
    console.log('')
  }

  // 5. Kontrollo për URL të pavlefshme
  console.log('🔍 Kontrollo për URL të pavlefshme:')

  const all = await prisma.property.findMany({
    select: { id: true, primary_image_url: true },
  })

  const issues = {
    null: 0,
    notHttp: 0,
    notUnsplash: 0,
    empty: 0,
  }

  for (const p of all) {
    if (!p.primary_image_url) {
      issues.null++
    } else if (p.primary_image_url.trim() === '') {
      issues.empty++
    } else if (!p.primary_image_url.startsWith('http')) {
      issues.notHttp++
    } else if (!p.primary_image_url.includes('unsplash.com')) {
      issues.notUnsplash++
    }
  }

  console.log(`   NULL: ${issues.null}`)
  console.log(`   Empty: ${issues.empty}`)
  console.log(`   Not HTTP: ${issues.notHttp}`)
  console.log(`   Not Unsplash: ${issues.notUnsplash}`)

  // 6. Kontrollo duplicate URLs
  const urls = all.map((p) => p.primary_image_url).filter(Boolean)
  const uniqueUrls = new Set(urls)
  console.log('')
  console.log(`📊 Unique URLs: ${uniqueUrls.size} / ${urls.length}`)

  // 7. Test nëse një URL funksionon
  console.log('')
  console.log('🌐 Test URL accessibility:')

  if (samples[0]?.primary_image_url) {
    try {
      const res = await fetch(samples[0].primary_image_url, {
        method: 'HEAD',
      })
      console.log(`   Status: ${res.status} ${res.statusText}`)
    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`)
    }
  }

  console.log('')
  console.log('═══════════════════════════════════════════════════')
}

checkImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect())