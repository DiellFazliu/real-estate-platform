// ═══════════════════════════════════════════════════════════════
// SEED BAZË - ROLE, PERMISSIONS, PËRDORUES, SETTINGS
// Ekzekuto: npx prisma db seed
// ═══════════════════════════════════════════════════════════════

import { hash } from 'bcryptjs'
import { prisma } from './seed/lib/db'
import { log } from './seed/lib/logger'
import { SEED_CONFIG } from './seed/lib/config'

// ═══════════════════════════════════════════════════════════════
// ROLE
// ═══════════════════════════════════════════════════════════════

const ROLES = [
  { name: 'USER', description: 'Përdorues i rregullt - shikon, favorizon, rezervon', level: 0 },
  { name: 'AGENT', description: 'Agjent real estate - menaxhon pronat e caktuara', level: 1 },
  { name: 'OWNER', description: 'Pronar - menaxhon platformën dhe aprovon listimet', level: 2 },
  { name: 'ADMIN', description: 'Administrator - qasje e plotë në sistem', level: 3 },
] as const

// ═══════════════════════════════════════════════════════════════
// PERMISSIONS
// ═══════════════════════════════════════════════════════════════

const PERMISSIONS = [
  // Properties
  { name: 'properties:read:all', resource: 'properties', action: 'read', scope: 'all' },
  { name: 'properties:read:assigned', resource: 'properties', action: 'read', scope: 'assigned' },
  { name: 'properties:create', resource: 'properties', action: 'create', scope: 'all' },
  { name: 'properties:update:all', resource: 'properties', action: 'update', scope: 'all' },
  { name: 'properties:update:assigned', resource: 'properties', action: 'update', scope: 'assigned' },
  { name: 'properties:update:own', resource: 'properties', action: 'update', scope: 'own' },
  { name: 'properties:delete', resource: 'properties', action: 'delete', scope: 'all' },
  { name: 'properties:assign', resource: 'properties', action: 'assign', scope: 'all' },
  { name: 'properties:review', resource: 'properties', action: 'review', scope: 'all' },

  // Favorites
  { name: 'favorites:read', resource: 'favorites', action: 'read', scope: 'own' },
  { name: 'favorites:create', resource: 'favorites', action: 'create', scope: 'own' },
  { name: 'favorites:delete', resource: 'favorites', action: 'delete', scope: 'own' },

  // Appointments
  { name: 'appointments:read:own', resource: 'appointments', action: 'read', scope: 'own' },
  { name: 'appointments:read:assigned', resource: 'appointments', action: 'read', scope: 'assigned' },
  { name: 'appointments:read:all', resource: 'appointments', action: 'read', scope: 'all' },
  { name: 'appointments:create', resource: 'appointments', action: 'create', scope: 'own' },
  { name: 'appointments:update:assigned', resource: 'appointments', action: 'update', scope: 'assigned' },
  { name: 'appointments:update:all', resource: 'appointments', action: 'update', scope: 'all' },
  { name: 'appointments:delete:own', resource: 'appointments', action: 'delete', scope: 'own' },
  { name: 'appointments:approve:assigned', resource: 'appointments', action: 'approve', scope: 'assigned' },
  { name: 'appointments:approve:all', resource: 'appointments', action: 'approve', scope: 'all' },

  // Inquiries
  { name: 'inquiries:read:assigned', resource: 'inquiries', action: 'read', scope: 'assigned' },
  { name: 'inquiries:read:all', resource: 'inquiries', action: 'read', scope: 'all' },
  { name: 'inquiries:create', resource: 'inquiries', action: 'create', scope: 'all' },
  { name: 'inquiries:update:assigned', resource: 'inquiries', action: 'update', scope: 'assigned' },
  { name: 'inquiries:update:all', resource: 'inquiries', action: 'update', scope: 'all' },

  // Users
  { name: 'users:read', resource: 'users', action: 'read', scope: 'all' },
  { name: 'users:create', resource: 'users', action: 'create', scope: 'all' },
  { name: 'users:update', resource: 'users', action: 'update', scope: 'all' },
  { name: 'users:delete', resource: 'users', action: 'delete', scope: 'all' },

  // Roles
  { name: 'roles:read', resource: 'roles', action: 'read', scope: 'all' },
  { name: 'roles:update', resource: 'roles', action: 'update', scope: 'all' },

  // System
  { name: 'system:admin', resource: 'system', action: 'admin', scope: 'all' },
  { name: 'system:audit', resource: 'system', action: 'audit', scope: 'all' },
]

// ═══════════════════════════════════════════════════════════════
// MAPIMI ROLE → PERMISSIONS
// ═══════════════════════════════════════════════════════════════

const ROLE_PERMISSIONS: Record<string, string[]> = {
  USER: [
    'properties:read:all',
    'favorites:read', 'favorites:create', 'favorites:delete',
    'appointments:read:own', 'appointments:create', 'appointments:delete:own',
    'inquiries:create',
  ],
  AGENT: [
    'properties:read:all', 'properties:read:assigned', 'properties:update:assigned',
    'favorites:read', 'favorites:create', 'favorites:delete',
    'appointments:read:own', 'appointments:read:assigned',
    'appointments:create', 'appointments:delete:own',
    'appointments:update:assigned', 'appointments:approve:assigned',
    'inquiries:read:assigned', 'inquiries:create', 'inquiries:update:assigned',
  ],
  OWNER: [
    'properties:read:all', 'properties:create', 'properties:update:all',
    'properties:delete', 'properties:assign', 'properties:review',
    'favorites:read',
    'appointments:read:all', 'appointments:update:all', 'appointments:approve:all',
    'inquiries:read:all', 'inquiries:update:all',
  ],
  // ADMIN merr të gjitha
}

// ═══════════════════════════════════════════════════════════════
// PËRDORUESIT BAZË
// ═══════════════════════════════════════════════════════════════

async function seedUsers(roles: Record<string, { id: number }>) {
  const users = [
    {
      email: SEED_CONFIG.USERS.ADMIN,
      name: 'Admin User',
      roleId: roles.ADMIN.id,
    },
    {
      email: SEED_CONFIG.USERS.OWNER,
      name: 'Property Owner',
      roleId: roles.OWNER.id,
    },
    {
      email: SEED_CONFIG.USERS.AGENT,
      name: 'John Agent',
      roleId: roles.AGENT.id,
    },
    {
      email: SEED_CONFIG.USERS.USER,
      name: 'Regular User',
      roleId: roles.USER.id,
    },
    {
      email: SEED_CONFIG.USERS.SELLER,
      name: 'Jane Seller',
      roleId: roles.USER.id,
      extra: {
        phone: '+383 44 123 456',
        is_seller: true,
        seller_since: new Date(),
        seller_verified: true,
      },
    },
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        name: user.name,
        password_hash: await hash(user.password, 12),
        role_id: user.roleId,
        email_verified: new Date(),
        is_active: true,
        ...(user.extra ?? {}),
      },
    })
  }

  return users.length
}

// ═══════════════════════════════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════════════════════════════

const SETTINGS = [
  { key: 'site_name', value: 'Villaron Real Estate' },
  { key: 'site_email', value: 'info@villaron.com' },
  { key: 'site_phone', value: '+1 (555) 123-4567' },
  { key: 'appointment_duration', value: 60 },
  { key: 'appointment_buffer', value: 15 },
  { key: 'max_appointments_per_day', value: 8 },
  { key: 'max_listings_per_day', value: 3 },
  { key: 'max_listings_per_week', value: 10 },
]

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

async function main() {
  const startTime = Date.now()
  log.header('🌱 SEED BAZË - ROLE, PËRDORUES, SETTINGS')

  // 1. Rolet
  log.section('1. Rolet')
  const roles: Record<string, { id: number }> = {}

  for (const roleData of ROLES) {
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: {},
      create: { ...roleData, is_system: true },
    })
    roles[role.name] = role
    log.item(`✅ ${role.name}`)
  }

  // 2. Permissions
  log.section('2. Permissions')
  const permissions: Record<string, { id: number }> = {}

  for (const perm of PERMISSIONS) {
    const created = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    })
    permissions[perm.name] = created
  }

  log.item(`✅ ${Object.keys(permissions).length} permissions`)

  // 3. Lidhje role-permission
  log.section('3. Lidhja role-permission')

  for (const [roleName, permNames] of Object.entries(ROLE_PERMISSIONS)) {
    const role = roles[roleName]
    if (!role) continue

    let count = 0
    for (const permName of permNames) {
      const perm = permissions[permName]
      if (!perm) continue

      await prisma.rolePermission.upsert({
        where: {
          role_id_permission_id: {
            role_id: role.id,
            permission_id: perm.id,
          },
        },
        update: {},
        create: {
          role_id: role.id,
          permission_id: perm.id,
        },
      })
      count++
    }
    log.item(`✅ ${roleName}: ${count} permissions`)
  }

  // ADMIN merr të gjitha
  const adminRole = roles.ADMIN
  if (adminRole) {
    for (const perm of Object.values(permissions)) {
      await prisma.rolePermission.upsert({
        where: {
          role_id_permission_id: {
            role_id: adminRole.id,
            permission_id: perm.id,
          },
        },
        update: {},
        create: {
          role_id: adminRole.id,
          permission_id: perm.id,
        },
      })
    }
    log.item(`✅ ADMIN: ${Object.keys(permissions).length} permissions (të gjitha)`)
  }

  // 4. Përdoruesit
  log.section('4. Përdoruesit bazë')
  const usersCreated = await seedUsers(roles)
  log.item(`✅ ${usersCreated} përdorues`)

  // 5. Settings
  log.section('5. Settings')
  for (const setting of SETTINGS) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    })
  }
  log.item(`✅ ${SETTINGS.length} settings`)

  // 6. Kredencialet
  log.section('📋 KREDENCIALET')
  log.item('👑 ADMIN:   admin@villaron.com  / Admin123!')
  log.item('🏢 OWNER:   owner@villaron.com  / Owner123!')
  log.item('👔 AGENT:   agent@villaron.com  / Agent123!')
  log.item('👤 USER:    user@villaron.com   / User123!')
  log.item('🏠 SELLER:  seller@villaron.com / Seller123!')
  log.item('')
  log.warn('NDRYSHO KËTO FJALËKALIME NË PRODUCTION!')

  log.done(Date.now() - startTime)
}

main()
  .catch((error) => {
    log.error(`Gabim fatal: ${error.message}`)
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
