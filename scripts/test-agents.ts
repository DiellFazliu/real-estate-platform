import { PrismaClient } from '@prisma/client'
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

const prisma = new PrismaClient()

async function main() {
  console.log('\n═══════════════════════════════════════════════════')
  console.log('🔍 TEST AGENTS IMAGES')
  console.log('═══════════════════════════════════════════════════\n')

  const agents = await prisma.user.findMany({
    where: { role: { name: 'AGENT' }, is_active: true },
    select: { id: true, name: true, email: true, image: true },
    take: 5,
  })

  console.log(`👔 Gjetur ${agents.length} agjentë\n`)

  for (const agent of agents) {
    console.log(`📋 ${agent.name}`)
    console.log(`   Email: ${agent.email}`)
    console.log(`   Image: ${agent.image || '❌ NULL'}`)
    
    if (agent.image) {
      // Testo URL
      try {
        const res = await fetch(agent.image, { method: 'HEAD' })
        console.log(`   Status: ${res.status} ${res.statusText}`)
        console.log(`   Content-Type: ${res.headers.get('content-type')}`)
      } catch (error: any) {
        console.log(`   ❌ Error: ${error.message}`)
      }
    }
    console.log('')
  }

  console.log('═══════════════════════════════════════════════════\n')
}

main()
  .catch((e) => {
    console.error('❌ Gabim:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })