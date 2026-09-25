import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = Number(session.user.id)
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 400 })
  }

  const url = new URL(request.url)
  const limit = Math.min(
    50,
    Math.max(1, Number.parseInt(url.searchParams.get('limit') || '10', 10) || 10),
  )
  const unreadOnly = url.searchParams.get('unreadOnly') === 'true'

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: {
        user_id: userId,
        ...(unreadOnly ? { is_read: false } : {}),
      },
      orderBy: { created_at: 'desc' },
      take: limit,
      select: {
        id: true,
        type: true,
        title: true,
        message: true,
        link: true,
        is_read: true,
        created_at: true,
      },
    }),
    prisma.notification.count({
      where: { user_id: userId, is_read: false },
    }),
  ])

  return NextResponse.json({
    notifications,
    unreadCount,
  })
}