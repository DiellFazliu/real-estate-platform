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

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function dropChatTables() {
  console.log('\n🗑️  Dropping chat tables...\n')

  try {
    // Drop messages first (has FK to conversations)
    console.log('  → Dropping messages...')
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "messages" CASCADE;`)

    // Drop conversations
    console.log('  → Dropping conversations...')
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "conversations" CASCADE;`)

    // Delete migration record from _prisma_migrations
    console.log('  → Removing migration record...')
    await prisma.$executeRawUnsafe(`
      DELETE FROM "_prisma_migrations" 
      WHERE migration_name = '20260922144501_add_chat_system';
    `)

    console.log('\n✅ Chat tables dropped successfully!\n')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

dropChatTables()