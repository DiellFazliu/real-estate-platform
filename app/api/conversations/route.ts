import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = Number(session.user.id)

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ user_id: userId }, { agent_id: userId }],
    },
    orderBy: { last_message_at: 'desc' },
    take: 30,
    include: {
      user: { select: { id: true, name: true, image: true } },
      agent: { select: { id: true, name: true, image: true } },
      property: {
        select: { id: true, title: true, slug: true, city: true },
      },
      messages: {
        orderBy: { created_at: 'desc' },
        take: 1,
        select: { content: true, sender_id: true, created_at: true },
      },
      _count: {
        select: {
          messages: {
            where: {
              is_read: false,
              NOT: { sender_id: userId },
            },
          },
        },
      },
    },
  })

  return NextResponse.json({
    conversations: conversations.map((c) => ({
      id: c.id,
      status: c.status,
      unreadCount: c._count.messages,
      last_message_at: c.last_message_at.toISOString(),
      user: c.user,
      agent: c.agent,
      property: c.property,
      lastMessage: c.messages[0] ?? null,
    })),
  })
}