import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'
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

// ═══════════════════════════════════════════════════════════════
// FOTO PROFESIONALE - BURRA ME KOSTUM
// ═══════════════════════════════════════════════════════════════

const MALE_PHOTOS = [
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=400&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=400&fit=crop&crop=faces',
]

// ═══════════════════════════════════════════════════════════════
// FOTO PROFESIONALE - GRA ME KOSTUM
// ═══════════════════════════════════════════════════════════════

const FEMALE_PHOTOS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=400&h=400&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1541101767792-f9b2b1c4f127?w=400&h=400&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces',
]

function getAvatarUrl(name: string, gender: 'male' | 'female' = 'male') {
  const photos = gender === 'male' ? MALE_PHOTOS : FEMALE_PHOTOS
  const index = name.charCodeAt(0) % photos.length
  return photos[index]
}

// ═══════════════════════════════════════════════════════════════
// AGJENTËT
// ═══════════════════════════════════════════════════════════════

const AGENTS = [
  { name: 'Arlind Krasniqi', email: 'arlind.krasniqi@villaron.com', phone: '+383 44 111 201', bio: 'Agjent i specializuar në apartamente luksoze në Prishtinë me 8 vjet përvojë.', gender: 'male' as const },
  { name: 'Besart Morina', email: 'besart.morina@villaron.com', phone: '+383 44 111 203', bio: 'Agjent i specializuar në prona komerciale dhe zyra moderne.', gender: 'male' as const },
  { name: 'Drilon Berisha', email: 'drilon.berisha@villaron.com', phone: '+383 44 111 204', bio: 'Ekspert në vila luksoze dhe prona premium në zona elitare.', gender: 'male' as const },
  { name: 'Gentrit Rexha', email: 'gentrit.rexha@villaron.com', phone: '+383 44 111 206', bio: 'Agjent i ri dhe energjik, i specializuar në pronat e reja.', gender: 'male' as const },
  { name: 'Ismet Bytyqi', email: 'ismet.bytyqi@villaron.com', phone: '+383 44 111 208', bio: 'Agjent me 12 vjet përvojë në tregun e patundshmërive.', gender: 'male' as const },
  { name: 'Korab Shabani', email: 'korab.shabani@villaron.com', phone: '+383 44 111 210', bio: 'Agjent i certifikuar, ekspert në vlerësimin e pronave.', gender: 'male' as const },
  { name: 'Mentor Krasniqi', email: 'mentor.krasniqi@villaron.com', phone: '+383 44 111 212', bio: 'Ekspert në investime të patundshmërive dhe prona komerciale.', gender: 'male' as const },
  { name: 'Olti Dervishi', email: 'olti.dervishi@villaron.com', phone: '+383 44 111 214', bio: 'Specialist në prona të reja dhe ndërtime të reja.', gender: 'male' as const },
  { name: 'Sokol Krasniqi', email: 'sokol.krasniqi@villaron.com', phone: '+383 44 111 216', bio: 'Ekspert në prona premium dhe vila luksoze.', gender: 'male' as const },
  { name: 'Valon Hoxha', email: 'valon.hoxha@villaron.com', phone: '+383 44 111 218', bio: 'Specialist në vlerësimin e pronave dhe konsulencë profesionale.', gender: 'male' as const },
  { name: 'Elira Hoxha', email: 'elira.hoxha@villaron.com', phone: '+383 44 111 202', bio: 'Eksperte në shitjen e shtëpive familjare me klientë të kënaqur në të gjithë Kosovën.', gender: 'female' as const },
  { name: 'Fjolla Kelmendi', email: 'fjolla.kelmendi@villaron.com', phone: '+383 44 111 205', bio: 'Agjente me përvojë në tregun e qirasë, e specializuar në apartamente moderne.', gender: 'female' as const },
  { name: 'Hana Gashi', email: 'hana.gashi@villaron.com', phone: '+383 44 111 207', bio: 'Eksperte në prona luksoze dhe klientë VIP.', gender: 'female' as const },
  { name: 'Jeta Nushi', email: 'jeta.nushi@villaron.com', phone: '+383 44 111 209', bio: 'Specialiste në shtëpi me kopsht dhe prona familjare.', gender: 'female' as const },
  { name: 'Liza Hyseni', email: 'liza.hyseni@villaron.com', phone: '+383 44 111 211', bio: 'Agjente dinamike, e specializuar në klientë ndërkombëtarë.', gender: 'female' as const },
  { name: 'Nita Hoxha', email: 'nita.hoxha@villaron.com', phone: '+383 44 111 213', bio: 'Agjente me përvojë në tregun rezidencial të Prishtinës.', gender: 'female' as const },
  { name: 'Rina Mustafa', email: 'rina.mustafa@villaron.com', phone: '+383 44 111 215', bio: 'Agjente e specializuar në qira afatgjata dhe afarizëm.', gender: 'female' as const },
  { name: 'Teuta Berisha', email: 'teuta.berisha@villaron.com', phone: '+383 44 111 217', bio: 'Agjente me përvojë në shitje dhe blerje pronash.', gender: 'female' as const },
  { name: 'Ylber Rexha', email: 'ylber.rexha@villaron.com', phone: '+383 44 111 219', bio: 'Agjente e certifikuar me specializim në prona luksoze.', gender: 'female' as const },
  { name: 'Zeta Morina', email: 'zeta.morina@villaron.com', phone: '+383 44 111 220', bio: 'Agjente e re, e specializuar në prona moderne dhe inovative.', gender: 'female' as const },
]

async function main() {
  console.log('\n═══════════════════════════════════════════════════')
  console.log('👔 SEED AGENTS - 20 AGJENTË ME FOTO PROFESIONALE')
  console.log('═══════════════════════════════════════════════════\n')

  const agentRole = await prisma.role.findUnique({
    where: { name: 'AGENT' },
  })

  if (!agentRole) {
    console.error('❌ Roli AGENT nuk ekziston!')
    process.exit(1)
  }

  console.log(`✅ Roli AGENT: ID ${agentRole.id}\n`)

  let created = 0
  let updated = 0

  for (const agent of AGENTS) {
    try {
      const avatarUrl = getAvatarUrl(agent.name, agent.gender)

      const existing = await prisma.user.findUnique({
        where: { email: agent.email },
      })

      const userData = {
        email: agent.email,
        name: agent.name,
        phone: agent.phone,
        bio: agent.bio,
        image: avatarUrl,
        password_hash: await hash('Agent123!', 12),
        role_id: agentRole.id,
        email_verified: new Date(),
        is_active: true,
      }

      if (existing) {
        await prisma.user.update({
          where: { email: agent.email },
          data: userData,
        })
        updated++
        console.log(`   🔄 ${agent.name}`)
      } else {
        await prisma.user.create({ data: userData })
        created++
        console.log(`   ✨ ${agent.name}`)
      }
    } catch (error: any) {
      console.error(`   ❌ ${agent.name}: ${error.message}`)
    }
  }

  console.log('\n═══════════════════════════════════════════════════')
  console.log('✅ SEED AGENTS PËRFUNDOI!')
  console.log('═══════════════════════════════════════════════════')
  console.log(`   ✨ Created: ${created}`)
  console.log(`   🔄 Updated: ${updated}`)
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