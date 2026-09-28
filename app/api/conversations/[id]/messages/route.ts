import { NextRequest, NextResponse } from 'next/server'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const callerId = Number(session.user.id)
  const { id } = await params
  const conversationId = Number(id)

  if (!Number.isSafeInteger(conversationId) || conversationId <= 0) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
  }

  const url = new URL(request.url)
  const afterId = Number.parseInt(url.searchParams.get('after') ?? '0', 10) || 0

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ user_id: callerId }, { agent_id: callerId }],
    },
    select: {
      id: true,
      user: { select: { id: true, name: true, image: true } },
      agent: { select: { id: true, name: true, image: true } },
      property: {
        select: { id: true, title: true, slug: true, city: true },
      },
    },
  })

  if (!conversation) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const messages = await prisma.message.findMany({
    where: {
      conversation_id: conversationId,
      ...(afterId > 0 ? { id: { gt: afterId } } : {}),
    },
    orderBy: { created_at: 'asc' },
    select: {
      id: true,
      conversation_id: true,
      sender_id: true,
      content: true,
      is_read: true,
      created_at: true,
      sender: { select: { id: true, name: true, image: true } },
    },
  })

  return NextResponse.json({
    conversation,
    messages: messages.map((m) => ({
      ...m,
      created_at: m.created_at.toISOString(),
    })),
  })
}