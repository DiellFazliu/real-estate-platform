// ═══════════════════════════════════════════════════════════════
// SEED AGENTS - 20 AGJENTË ME FOTO PROFESIONALE
// Ekzekuto: npx tsx prisma/seed-agents.ts
// ═══════════════════════════════════════════════════════════════

import { hash } from 'bcryptjs'
import { prisma } from './seed/lib/db'
import { getAvatarUrl } from './seed/lib/images'
import { SEED_CONFIG } from './seed/lib/config'
import { log } from './seed/lib/logger'

// ═══════════════════════════════════════════════════════════════
// TË DHËNAT E AGJENTËVE
// ═══════════════════════════════════════════════════════════════

interface AgentData {
  name: string
  email: string
  phone: string
  bio: string
  gender: 'male' | 'female'
}

const AGENTS: AgentData[] = [
  // ─── MESHKUJ (10) ──────────────────────────────────────────
  { name: 'Arlind Krasniqi', email: 'arlind.krasniqi@villaron.com', phone: '+383 44 111 201', bio: 'Agjent i specializuar në apartamente luksoze në Prishtinë me 8 vjet përvojë.', gender: 'male' },
  { name: 'Besart Morina', email: 'besart.morina@villaron.com', phone: '+383 44 111 203', bio: 'Agjent i specializuar në prona komerciale dhe zyra moderne.', gender: 'male' },
  { name: 'Drilon Berisha', email: 'drilon.berisha@villaron.com', phone: '+383 44 111 204', bio: 'Ekspert në vila luksoze dhe prona premium në zona elitare.', gender: 'male' },
  { name: 'Gentrit Rexha', email: 'gentrit.rexha@villaron.com', phone: '+383 44 111 206', bio: 'Agjent i ri dhe energjik, i specializuar në pronat e reja.', gender: 'male' },
  { name: 'Ismet Bytyqi', email: 'ismet.bytyqi@villaron.com', phone: '+383 44 111 208', bio: 'Agjent me 12 vjet përvojë në tregun e patundshmërive.', gender: 'male' },
  { name: 'Korab Shabani', email: 'korab.shabani@villaron.com', phone: '+383 44 111 210', bio: 'Agjent i certifikuar, ekspert në vlerësimin e pronave.', gender: 'male' },
  { name: 'Mentor Krasniqi', email: 'mentor.krasniqi@villaron.com', phone: '+383 44 111 212', bio: 'Ekspert në investime të patundshmërive dhe prona komerciale.', gender: 'male' },
  { name: 'Olti Dervishi', email: 'olti.dervishi@villaron.com', phone: '+383 44 111 214', bio: 'Specialist në prona të reja dhe ndërtime të reja.', gender: 'male' },
  { name: 'Sokol Krasniqi', email: 'sokol.krasniqi@villaron.com', phone: '+383 44 111 216', bio: 'Ekspert në prona premium dhe vila luksoze.', gender: 'male' },
  { name: 'Valon Hoxha', email: 'valon.hoxha@villaron.com', phone: '+383 44 111 218', bio: 'Specialist në vlerësimin e pronave dhe konsulencë profesionale.', gender: 'male' },

  // ─── FEMRA (10) ────────────────────────────────────────────
  { name: 'Elira Hoxha', email: 'elira.hoxha@villaron.com', phone: '+383 44 111 202', bio: 'Eksperte në shitjen e shtëpive familjare me klientë të kënaqur në të gjithë Kosovën.', gender: 'female' },
  { name: 'Fjolla Kelmendi', email: 'fjolla.kelmendi@villaron.com', phone: '+383 44 111 205', bio: 'Agjente me përvojë në tregun e qirasë, e specializuar në apartamente moderne.', gender: 'female' },
  { name: 'Hana Gashi', email: 'hana.gashi@villaron.com', phone: '+383 44 111 207', bio: 'Eksperte në prona luksoze dhe klientë VIP.', gender: 'female' },
  { name: 'Jeta Nushi', email: 'jeta.nushi@villaron.com', phone: '+383 44 111 209', bio: 'Specialiste në shtëpi me kopsht dhe prona familjare.', gender: 'female' },
  { name: 'Liza Hyseni', email: 'liza.hyseni@villaron.com', phone: '+383 44 111 211', bio: 'Agjente dinamike, e specializuar në klientë ndërkombëtarë.', gender: 'female' },
  { name: 'Nita Hoxha', email: 'nita.hoxha@villaron.com', phone: '+383 44 111 213', bio: 'Agjente me përvojë në tregun rezidencial të Prishtinës.', gender: 'female' },
  { name: 'Rina Mustafa', email: 'rina.mustafa@villaron.com', phone: '+383 44 111 215', bio: 'Agjente e specializuar në qira afatgjata dhe afarizëm.', gender: 'female' },
  { name: 'Teuta Berisha', email: 'teuta.berisha@villaron.com', phone: '+383 44 111 217', bio: 'Agjente me përvojë në shitje dhe blerje pronash.', gender: 'female' },
  { name: 'Ylber Rexha', email: 'ylber.rexha@villaron.com', phone: '+383 44 111 219', bio: 'Agjente e certifikuar me specializim në prona luksoze.', gender: 'female' },
  { name: 'Zeta Morina', email: 'zeta.morina@villaron.com', phone: '+383 44 111 220', bio: 'Agjente e re, e specializuar në prona moderne dhe inovative.', gender: 'female' },
]

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main() {
  const startTime = Date.now()
  log.header('👔 SEED AGENTS - 20 AGJENTË')

  // 1. Kontrollo ekzistencën e rolit AGENT
  const agentRole = await prisma.role.findUnique({
    where: { name: 'AGENT' },
  })

  if (!agentRole) {
    log.error('Roli AGENT nuk ekziston!')
    log.info('Ekzekuto fillimisht: npx prisma db seed')
    process.exit(1)
  }

  log.success(`Roli AGENT: ID ${agentRole.id}`)

  // 2. Krijo/update çdo agjent
  log.section('Krijimi i agjentëve')

  let created = 0
  let updated = 0
  let failed = 0

  for (const agent of AGENTS) {
    try {
      const avatarUrl = getAvatarUrl(agent.name, agent.gender)

      const userData = {
        email: agent.email,
        name: agent.name,
        phone: agent.phone,
        bio: agent.bio,
        image: avatarUrl,
        password_hash: await hash(SEED_CONFIG.DEFAULT_PASSWORD, 12),
        role_id: agentRole.id,
        email_verified: new Date(),
        is_active: true,
      }

      const existing = await prisma.user.findUnique({
        where: { email: agent.email },
        select: { id: true },
      })

      if (existing) {
        await prisma.user.update({
          where: { email: agent.email },
          data: userData,
        })
        updated++
        log.item(`🔄 ${agent.name}`)
      } else {
        await prisma.user.create({ data: userData })
        created++
        log.item(`✨ ${agent.name}`)
      }
    } catch (error: any) {
      failed++
      log.error(`${agent.name}: ${error.message}`)
    }
  }

  // 3. Përmbledhje
  const total = await prisma.user.count({
    where: { role_id: agentRole.id },
  })

  log.section('Përmbledhje')
  log.item(`✨ Created: ${created}`)
  log.item(`🔄 Updated: ${updated}`)
  log.item(`❌ Failed:  ${failed}`)
  log.item(`📊 Total:   ${total}`)

  log.done(Date.now() - startTime)
}

main()
  .catch((error) => {
    log.error(`Gabim fatal: ${error.message}`)
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())