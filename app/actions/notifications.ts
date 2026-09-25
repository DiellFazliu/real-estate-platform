'use server'

import { revalidatePath } from 'next/cache'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

async function requireUser() {
  const session = await auth()
  if (!session?.user?.id) return null

  const userId = Number(session.user.id)
  if (!Number.isSafeInteger(userId) || userId <= 0) return null

  return userId
}

export async function markNotificationAsRead(notificationId: number) {
  const userId = await requireUser()
  if (!userId) return { success: false, error: 'Unauthorized' }

  if (!Number.isSafeInteger(notificationId) || notificationId <= 0) {
    return { success: false, error: 'Invalid notification' }
  }

  const updated = await prisma.notification.updateMany({
    where: { id: notificationId, user_id: userId },
    data: { is_read: true, read_at: new Date() },
  })

  if (updated.count === 0) {
    return { success: false, error: 'Notification not found' }
  }

  revalidatePath('/notifications')
  return { success: true }
}

export async function markAllNotificationsAsRead() {
  const userId = await requireUser()
  if (!userId) return { success: false, error: 'Unauthorized' }

  const result = await prisma.notification.updateMany({
    where: { user_id: userId, is_read: false },
    data: { is_read: true, read_at: new Date() },
  })

  revalidatePath('/notifications')
  return { success: true, count: result.count }
}

export async function deleteNotification(notificationId: number) {
  const userId = await requireUser()
  if (!userId) return { success: false, error: 'Unauthorized' }

  if (!Number.isSafeInteger(notificationId) || notificationId <= 0) {
    return { success: false, error: 'Invalid notification' }
  }

  const deleted = await prisma.notification.deleteMany({
    where: { id: notificationId, user_id: userId },
  })

  if (deleted.count === 0) {
    return { success: false, error: 'Notification not found' }
  }

  revalidatePath('/notifications')
  return { success: true }
}

export async function deleteAllReadNotifications() {
  const userId = await requireUser()
  if (!userId) return { success: false, error: 'Unauthorized' }

  const result = await prisma.notification.deleteMany({
    where: { user_id: userId, is_read: true },
  })

  revalidatePath('/notifications')
  return { success: true, count: result.count }
}