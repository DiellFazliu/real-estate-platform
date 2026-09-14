import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Duke filluar seed...')

  // ═══════════════════════════════════════════════════════════════
  // 1. KRIJO ROLET
  // ═══════════════════════════════════════════════════════════════
  console.log('📝 Duke krijuar rolet...')

  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: 'USER' },
      update: {},
      create: {
        name: 'USER',
        description: 'Përdorues i rregullt - shikon, favorizon, rezervon',
        level: 0,
        is_system: true,
      },
    }),
    prisma.role.upsert({
      where: { name: 'AGENT' },
      update: {},
      create: {
        name: 'AGENT',
        description: 'Agjent real estate - menaxhon pronat e caktuara',
        level: 1,
        is_system: true,
      },
    }),
    prisma.role.upsert({
      where: { name: 'OWNER' },
      update: {},
      create: {
        name: 'OWNER',
        description: 'Pronar - menaxhon platformën dhe aprovon listimet',
        level: 2,
        is_system: true,
      },
    }),
    prisma.role.upsert({
      where: { name: 'ADMIN' },
      update: {},
      create: {
        name: 'ADMIN',
        description: 'Administrator - qasje e plotë në sistem',
        level: 3,
        is_system: true,
      },
    }),
  ])

  console.log(`✅ Krijuar ${roles.length} role`)

  // ═══════════════════════════════════════════════════════════════
  // 2. KRIJO PERMISSIONS
  // ═══════════════════════════════════════════════════════════════
  console.log('🔐 Duke krijuar permissions...')

  const permissions = [
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

    // Users (Admin)
    { name: 'users:read', resource: 'users', action: 'read', scope: 'all' },
    { name: 'users:create', resource: 'users', action: 'create', scope: 'all' },
    { name: 'users:update', resource: 'users', action: 'update', scope: 'all' },
    { name: 'users:delete', resource: 'users', action: 'delete', scope: 'all' },

    // Roles (Admin)
    { name: 'roles:read', resource: 'roles', action: 'read', scope: 'all' },
    { name: 'roles:update', resource: 'roles', action: 'update', scope: 'all' },

    // System (Admin)
    { name: 'system:admin', resource: 'system', action: 'admin', scope: 'all' },
    { name: 'system:audit', resource: 'system', action: 'audit', scope: 'all' },
  ]

  const createdPermissions = await Promise.all(
    permissions.map((p) =>
      prisma.permission.upsert({
        where: { name: p.name },
        update: {},
        create: p,
      })
    )
  )

  console.log(`✅ Krijuar ${createdPermissions.length} permissions`)

  // ═══════════════════════════════════════════════════════════════
  // 3. LIDH ROLET ME PERMISSIONS
  // ═══════════════════════════════════════════════════════════════
  console.log('🔗 Duke lidhur rolet me permissions...')

  const rolePermissionMap: Record<string, string[]> = {
    USER: [
      'properties:read:all',
      'favorites:read',
      'favorites:create',
      'favorites:delete',
      'appointments:read:own',
      'appointments:create',
      'appointments:delete:own',
      'inquiries:create',
    ],
    AGENT: [
      'properties:read:all',
      'properties:read:assigned',
      'properties:update:assigned',
      'favorites:read',
      'favorites:create',
      'favorites:delete',
      'appointments:read:own',
      'appointments:read:assigned',
      'appointments:create',
      'appointments:delete:own',
      'appointments:update:assigned',
      'appointments:approve:assigned',
      'inquiries:read:assigned',
      'inquiries:create',
      'inquiries:update:assigned',
    ],
    OWNER: [
      'properties:read:all',
      'properties:create',
      'properties:update:all',
      'properties:delete',
      'properties:assign',
      'properties:review',
      'favorites:read',
      'appointments:read:all',
      'appointments:update:all',
      'appointments:approve:all',
      'inquiries:read:all',
      'inquiries:update:all',
    ],
    ADMIN: permissions.map((p) => p.name),
  }

  for (const [roleName, permissionNames] of Object.entries(rolePermissionMap)) {
    const role = roles.find((r) => r.name === roleName)
    if (!role) continue

    for (const permName of permissionNames) {
      const perm = createdPermissions.find((p) => p.name === permName)
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
    }
  }

  console.log('✅ Rolet u lidhën me permissions')

  // ═══════════════════════════════════════════════════════════════
  // 4. KRIJO PËRDORUESIT
  // ═══════════════════════════════════════════════════════════════
  console.log('👤 Duke krijuar përdoruesit...')

  const adminRole = roles.find((r) => r.name === 'ADMIN')!
  const ownerRole = roles.find((r) => r.name === 'OWNER')!
  const agentRole = roles.find((r) => r.name === 'AGENT')!
  const userRole = roles.find((r) => r.name === 'USER')!

  // Admin
  await prisma.user.upsert({
    where: { email: 'admin@villaron.com' },
    update: {},
    create: {
      email: 'admin@villaron.com',
      name: 'Admin User',
      password_hash: await hash('Admin123!', 12),
      role_id: adminRole.id,
      email_verified: new Date(),
      is_active: true,
    },
  })

  // Owner
  await prisma.user.upsert({
    where: { email: 'owner@villaron.com' },
    update: {},
    create: {
      email: 'owner@villaron.com',
      name: 'Property Owner',
      password_hash: await hash('Owner123!', 12),
      role_id: ownerRole.id,
      email_verified: new Date(),
      is_active: true,
    },
  })

  // Agent
  await prisma.user.upsert({
    where: { email: 'agent@villaron.com' },
    update: {},
    create: {
      email: 'agent@villaron.com',
      name: 'John Agent',
      password_hash: await hash('Agent123!', 12),
      role_id: agentRole.id,
      email_verified: new Date(),
      is_active: true,
    },
  })

  // Regular User
  await prisma.user.upsert({
    where: { email: 'user@villaron.com' },
    update: {},
    create: {
      email: 'user@villaron.com',
      name: 'Regular User',
      password_hash: await hash('User123!', 12),
      role_id: userRole.id,
      email_verified: new Date(),
      is_active: true,
    },
  })

  // ═══════════════════════════════════════════════════════════════
  // 5. KRIJO SELLER
  // ═══════════════════════════════════════════════════════════════
  console.log('🏠 Duke krijuar seller-in...')

  await prisma.user.upsert({
    where: { email: 'seller@villaron.com' },
    update: {},
    create: {
      email: 'seller@villaron.com',
      name: 'Jane Seller',
      password_hash: await hash('Seller123!', 12),
      role_id: userRole.id,
      email_verified: new Date(),
      is_active: true,
      phone: '+383 44 123 456',
      is_seller: true,
      seller_since: new Date(),
      seller_verified: true,
    },
  })

  console.log('✅ Krijuar 5 përdorues')

  // ═══════════════════════════════════════════════════════════════
  // 6. KRIJO SETTINGS
  // ═══════════════════════════════════════════════════════════════
  console.log('⚙️  Duke krijuar settings...')

  const settings = [
    { key: 'site_name', value: 'Villaron Real Estate' },
    { key: 'site_email', value: 'info@villaron.com' },
    { key: 'site_phone', value: '+1 (555) 123-4567' },
    { key: 'appointment_duration', value: 60 },
    { key: 'appointment_buffer', value: 15 },
    { key: 'max_appointments_per_day', value: 8 },
    { key: 'max_listings_per_day', value: 3 },
    { key: 'max_listings_per_week', value: 10 },
  ]

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    })
  }

  console.log('✅ Krijuar settings')

  // ═══════════════════════════════════════════════════════════════
  // PËRMBLEDHJE
  // ═══════════════════════════════════════════════════════════════
  console.log('')
  console.log('═══════════════════════════════════════════════════')
  console.log('✅ SEED PËRFUNDOI ME SUKSES!')
  console.log('═══════════════════════════════════════════════════')
  console.log('')
  console.log('📋 KREDENCIALET:')
  console.log('')
  console.log('👑 ADMIN:   admin@villaron.com / Admin123!')
  console.log('🏢 OWNER:   owner@villaron.com / Owner123!')
  console.log('👔 AGENT:   agent@villaron.com / Agent123!')
  console.log('👤 USER:    user@villaron.com / User123!')
  console.log('🏠 SELLER:  seller@villaron.com / Seller123!')
  console.log('')
  console.log('⚠️  NDRYSHO KËTO FJALËKALIME NË PRODUCTION!')
  console.log('═══════════════════════════════════════════════════')
}

main()
  .catch((e) => {
    console.error('❌ Gabim gjatë seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })