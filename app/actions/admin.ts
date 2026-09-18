'use server'

import { revalidatePath } from 'next/cache'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') return null
  return session
}

export async function updateAdminUser(formData: FormData) {
  const session = await requireAdmin()
  if (!session) return { success: false, error: 'Nuk keni leje për këtë veprim.' }

  const userId = Number(formData.get('userId'))
  const roleId = Number(formData.get('roleId'))
  const isActive = formData.get('isActive') === 'true'
  const adminId = Number(session.user.id)

  if (![userId, roleId, adminId].every((value) => Number.isSafeInteger(value) && value > 0)) {
    return { success: false, error: 'Të dhëna të pavlefshme.' }
  }

  if (userId === adminId && !isActive) {
    return { success: false, error: 'Nuk mund ta çaktivizoni llogarinë tuaj.' }
  }

  const [user, role] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, role_id: true, is_active: true } }),
    prisma.role.findUnique({ where: { id: roleId }, select: { id: true, name: true } }),
  ])

  if (!user || !role) return { success: false, error: 'Përdoruesi ose roli nuk u gjet.' }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { role_id: role.id, is_active: isActive } })
    await tx.auditLog.create({
      data: {
        user_id: adminId,
        action: 'update_user_access',
        resource: 'user',
        resource_id: String(userId),
        old_values: { role_id: user.role_id, is_active: user.is_active },
        new_values: { role_id: role.id, role: role.name, is_active: isActive, email: user.email },
      },
    })
  })

  revalidatePath('/admin')
  revalidatePath('/admin/users')
  return { success: true, message: 'Qasja e përdoruesit u përditësua.' }
}
