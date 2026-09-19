import { auth } from './auth'
import { prisma } from '@/lib/db/prisma'

/**
 * Kontrollo nëse user ka permission
 */
export async function hasPermission(
  userId: number,
  permissionName: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      },
    },
  })

  if (!user) return false

  return user.role.permissions.some(
    (rp) => rp.permission.name === permissionName
  )
}

/**
 * Kërko permission ose throw error
 */
export async function requirePermission(permissionName: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const hasAccess = await hasPermission(
    parseInt(session.user.id),
    permissionName
  )

  if (!hasAccess) {
    throw new Error('Forbidden')
  }

  return session
}

/**
 * Kontrollo role
 */
export async function requireRole(allowedRoles: string[]) {
  const session = await auth()
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  const role = session.user.role
  if (!allowedRoles.includes(role)) {
    throw new Error('Forbidden')
  }

  return session
}