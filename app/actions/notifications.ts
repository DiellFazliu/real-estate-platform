'use server'

// app/actions/notifications.ts — server actions for the notification bell
// and the /notifications page. All actions are user-scoped: a notification
// can only be read/deleted by its owner (enforced by `user_id: userId`
// in the where clause, so a wrong id is a no-op rather than a crash).

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

function isValidId(id: number) {
  return Number.isSafeInteger(id) && id > 0
}

export async function markNotificationAsRead(notificationId: number) {
  const userId = await requireUser()
  if (!userId) return { success: false, error: 'Duhet të jesh i loguar.' }

  if (!isValidId(notificationId)) {
    return { success: false, error: 'Njoftimi nuk është i vlefshëm.' }
  }

  const updated = await prisma.notification.updateMany({
    where: { id: notificationId, user_id: userId },
    data: { is_read: true, read_at: new Date() },
  })

  if (updated.count === 0) {
    return { success: false, error: 'Njoftimi nuk u gjet.' }
  }

  revalidatePath('/notifications')
  return { success: true }
}

export async function markAllNotificationsAsRead() {
  const userId = await requireUser()
  if (!userId) return { success: false, error: 'Duhet të jesh i loguar.' }

  const result = await prisma.notification.updateMany({
    where: { user_id: userId, is_read: false },
    data: { is_read: true, read_at: new Date() },
  })

  revalidatePath('/notifications')
  return { success: true, count: result.count }
}

export async function deleteNotification(notificationId: number) {
  const userId = await requireUser()
  if (!userId) return { success: false, error: 'Duhet të jesh i loguar.' }

  if (!isValidId(notificationId)) {
    return { success: false, error: 'Njoftimi nuk është i vlefshëm.' }
  }

  const deleted = await prisma.notification.deleteMany({
    where: { id: notificationId, user_id: userId },
  })

  if (deleted.count === 0) {
    return { success: false, error: 'Njoftimi nuk u gjet.' }
  }

  revalidatePath('/notifications')
  return { success: true }
}

export async function deleteAllReadNotifications() {
  const userId = await requireUser()
  if (!userId) return { success: false, error: 'Duhet të jesh i loguar.' }

  const result = await prisma.notification.deleteMany({
    where: { user_id: userId, is_read: true },
  })

  revalidatePath('/notifications')
  return { success: true, count: result.count }
}