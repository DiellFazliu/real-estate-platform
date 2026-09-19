import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
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

// ═══════════════════════════════════════════════════════════════
// AVATAR - 2 PNG FILES
// ═══════════════════════════════════════════════════════════════

function getAvatar(gender: 'male' | 'female'): string {
  return gender === 'male' ? '/agent-male.png' : '/agent-female.png'
}

// ═══════════════════════════════════════════════════════════════
// AGJENTËT - 18 TOTAL (9 meshkuj + 9 femra)
// ═══════════════════════════════════════════════════════════════

const AGENTS = [
  // MALE (9)
  ['Arlind Krasniqi', 'arlind.krasniqi', '201', 'Agjent i specializuar në apartamente luksoze në Prishtinë me 8 vjet përvojë.', 'male'],
  ['Besart Morina', 'besart.morina', '203', 'Agjent i specializuar në prona komerciale dhe zyra moderne.', 'male'],
  ['Drilon Berisha', 'drilon.berisha', '204', 'Ekspert në vila luksoze dhe prona premium në zona elitare.', 'male'],
  ['Gentrit Rexha', 'gentrit.rexha', '206', 'Agjent i ri dhe energjik, i specializuar në pronat e reja.', 'male'],
  ['Ismet Bytyqi', 'ismet.bytyqi', '208', 'Agjent me 12 vjet përvojë në tregun e patundshmërive.', 'male'],
  ['Korab Shabani', 'korab.shabani', '210', 'Agjent i certifikuar, ekspert në vlerësimin e pronave.', 'male'],
  ['Mentor Krasniqi', 'mentor.krasniqi', '212', 'Ekspert në investime të patundshmërive dhe prona komerciale.', 'male'],
  ['Olti Dervishi', 'olti.dervishi', '214', 'Specialist në prona të reja dhe ndërtime të reja.', 'male'],
  ['Sokol Krasniqi', 'sokol.krasniqi', '216', 'Ekspert në prona premium dhe vila luksoze.', 'male'],

  // FEMALE (9)
  ['Elira Hoxha', 'elira.hoxha', '202', 'Eksperte në shitjen e shtëpive familjare me klientë të kënaqur në të gjithë Kosovën.', 'female'],
  ['Fjolla Kelmendi', 'fjolla.kelmendi', '205', 'Agjente me përvojë në tregun e qirasë, e specializuar në apartamente moderne.', 'female'],
  ['Hana Gashi', 'hana.gashi', '207', 'Eksperte në prona luksoze dhe klientë VIP.', 'female'],
  ['Jeta Nushi', 'jeta.nushi', '209', 'Specialiste në shtëpi me kopsht dhe prona familjare.', 'female'],
  ['Liza Hyseni', 'liza.hyseni', '211', 'Agjente dinamike, e specializuar në klientë ndërkombëtarë.', 'female'],
  ['Nita Hoxha', 'nita.hoxha', '213', 'Agjente me përvojë në tregun rezidencial të Prishtinës.', 'female'],
  ['Rina Mustafa', 'rina.mustafa', '215', 'Agjente e specializuar në qira afatgjata dhe afarizëm.', 'female'],
  ['Teuta Berisha', 'teuta.berisha', '217', 'Agjente me përvojë në shitje dhe blerje pronash.', 'female'],
  ['Ylber Rexha', 'ylber.rexha', '219', 'Agjente e certifikuar me specializim në prona luksoze.', 'female'],
] as const

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main() {
  console.log('\n👔 Seed Agents - 18 agjentë\n')

  const agentRole = await prisma.role.findUnique({
    where: { name: 'AGENT' },
  })

  if (!agentRole) {
    console.error('❌ Roli AGENT nuk ekziston!')
    console.error('   Ekzekuto fillimisht: npx prisma db seed')
    process.exit(1)
  }

  let created = 0
  let updated = 0

  for (const [name, emailPrefix, phoneSuffix, bio, gender] of AGENTS) {
    try {
      const email = `${emailPrefix}@villaron.com`
      const phone = `+383 44 111 ${phoneSuffix}`
      const image = getAvatar(gender)

      const userData = {
        email,
        name,
        phone,
        bio,
        image,
        password_hash: await hash('Agent123!', 12),
        role_id: agentRole.id,
        email_verified: new Date(),
        is_active: true,
      }

      const existing = await prisma.user.findUnique({ where: { email } })

      if (existing) {
        await prisma.user.update({ where: { email }, data: userData })
        updated++
        console.log(`   🔄 ${name}`)
      } else {
        await prisma.user.create({ data: userData })
        created++
        console.log(`   ✨ ${name}`)
      }
    } catch (error: any) {
      console.error(`   ❌ ${name}: ${error.message}`)
    }
  }

  const total = await prisma.user.count({
    where: { role_id: agentRole.id },
  })

  console.log(`\n✅ Përfundoi!`)
  console.log(`   Created: ${created} | Updated: ${updated} | Total: ${total}\n`)
}

main()
  .catch((e) => {
    console.error('❌ Gabim:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())