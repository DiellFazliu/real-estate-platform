import { createClient } from '@sanity/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2026-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

async function fixImageKeys() {
  console.log('🔍 Duke kërkuar për prona me imazhe pa _key...')

  const properties = await client.fetch(`
    *[_type == "property" && count(images) > 0] {
      _id,
      title,
      images
    }
  `)

  console.log(`📦 Gjetur ${properties.length} prona`)

  let fixedCount = 0

  for (const property of properties) {
    const needsFix = property.images?.some((img: any) => !img._key)

    if (!needsFix) continue

    const fixedImages = property.images.map((img: any, index: number) => ({
      ...img,
      _key: img._key || `image-${index}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    }))

    await client.patch(property._id).set({ images: fixedImages }).commit()

    console.log(`✅ Rregulluar: ${property.title}`)
    fixedCount++
  }

  console.log(`🎉 Rregulluar ${fixedCount} prona`)
}

fixImageKeys().catch(console.error)