'use server'

import { revalidatePath } from 'next/cache'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import {
  findExistingConversation,
  pickAvailableAgent,
} from '@/lib/db/queries/chat'

/* ═══════════════════════════════════════════════════════════════
   CREATE CONVERSATION
   ═══════════════════════════════════════════════════════════════ */

export async function createConversation(input: {
  propertyId?: number | null
  subject?: string
  firstMessage: string
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Duhet të jesh i loguar.' }
  }

  const userId = Number(session.user.id)
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return { success: false, error: 'Sesioni nuk është i vlefshëm.' }
  }

  const content = input.firstMessage.trim()
  if (content.length < 2 || content.length > 2000) {
    return {
      success: false,
      error: 'Mesazhi duhet të ketë nga 2 deri në 2000 karaktere.',
    }
  }

  const propertyId = input.propertyId ?? null

  // ─── Determine agent ────────────────────────────────────────
  let agentId: number | null = null

  if (propertyId) {
    // Property-specific: use the property's primary agent (or first active agent)
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        title: true,
        primary_agent_id: true,
        primary_agent: {
          select: {
            id: true,
            is_active: true,
            role: { select: { name: true } },
          },
        },
        agents: {
          where: {
            status: 'ACTIVE',
            agent: {
              is_active: true,
              role: { name: 'AGENT' },
            },
          },
          orderBy: [{ is_primary: 'desc' }, { assigned_at: 'asc' }],
          select: {
            agent_id: true,
          },
        },
      },
    })

    if (!property) {
      return { success: false, error: 'Prona nuk u gjet.' }
    }

    if (
      property.primary_agent &&
      property.primary_agent.is_active &&
      property.primary_agent.role?.name === 'AGENT'
    ) {
      agentId = property.primary_agent.id
    } else if (property.agents.length > 0) {
      agentId = property.agents[0].agent_id
    }

    if (!agentId) {
      return {
        success: false,
        error: 'Kjo pronë nuk ka ende një agjent të caktuar.',
      }
    }
  } else {
    // General: pick available agent via round-robin
    const agent = await pickAvailableAgent()
    if (!agent) {
      return {
        success: false,
        error: 'Nuk ka agjentë të disponueshëm për momentin.',
      }
    }
    agentId = agent.id
  }

  // ─── Reuse existing OPEN conversation if any ────────────────
  const existing = await findExistingConversation(userId, agentId, propertyId)
  if (existing) {
    // Just append the message
    await prisma.$transaction(async (tx) => {
      await tx.message.create({
        data: {
          conversation_id: existing.id,
          sender_id: userId,
          content,
        },
      })

      await tx.conversation.update({
        where: { id: existing.id },
        data: { last_message_at: new Date() },
      })

      await tx.notification.create({
        data: {
          user_id: agentId!,
          type: 'new_message',
          title: 'Mesazh i re',
          message: `${session.user.name || session.user.email}: ${content.slice(0, 80)}${content.length > 80 ? '…' : ''}`,
          link: `/agent/conversations/${existing.id}`,
        },
      })
    })

    revalidatePath('/agent/conversations')
    revalidatePath('/account/messages')

    return {
      success: true,
      conversationId: existing.id,
      reused: true,
    }
  }

  // ─── Create new conversation ────────────────────────────────
  try {
    const conversation = await prisma.$transaction(async (tx) => {
      const created = await tx.conversation.create({
        data: {
          user_id: userId,
          agent_id: agentId!,
          property_id: propertyId,
          subject: input.subject?.trim() || null,
          status: 'OPEN',
          last_message_at: new Date(),
        },
      })

      await tx.message.create({
        data: {
          conversation_id: created.id,
          sender_id: userId,
          content,
        },
      })

      await tx.notification.create({
        data: {
          user_id: agentId!,
          type: 'new_message',
          title: 'Mesazh i re',
          message: `${session.user.name || session.user.email}: ${content.slice(0, 80)}${content.length > 80 ? '…' : ''}`,
          link: `/agent/conversations/${created.id}`,
        },
      })

      return created
    })

    revalidatePath('/agent/conversations')
    revalidatePath('/account/messages')

    return {
      success: true,
      conversationId: conversation.id,
      reused: false,
    }
  } catch (error) {
    console.error('Create conversation error:', error)
    return { success: false, error: 'Biseda nuk u krijua.' }
  }
}

/* ═══════════════════════════════════════════════════════════════
   SEND MESSAGE (to an existing conversation)
   ═══════════════════════════════════════════════════════════════ */

export async function sendMessage(input: {
  conversationId: number
  content: string
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Duhet të jesh i loguar.' }
  }

  const senderId = Number(session.user.id)
  const content = input.content.trim()

  if (!Number.isSafeInteger(input.conversationId) || input.conversationId <= 0) {
    return { success: false, error: 'Biseda nuk është e vlefshme.' }
  }

  if (content.length < 1 || content.length > 2000) {
    return {
      success: false,
      error: 'Mesazhi duhet të ketë nga 1 deri në 2000 karaktere.',
    }
  }

  // Verify caller is a participant
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: input.conversationId,
      OR: [{ user_id: senderId }, { agent_id: senderId }],
    },
    select: {
      id: true,
      user_id: true,
      agent_id: true,
      status: true,
    },
  })

  if (!conversation) {
    return { success: false, error: 'Biseda nuk u gjet.' }
  }

  if (conversation.status === 'CLOSED') {
    return { success: false, error: 'Kjo bisedë është e mbyllur.' }
  }

  const recipientId =
    senderId === conversation.user_id
      ? conversation.agent_id
      : conversation.user_id

  try {
    await prisma.$transaction(async (tx) => {
      await tx.message.create({
        data: {
          conversation_id: conversation.id,
          sender_id: senderId,
          content,
        },
      })

      await tx.conversation.update({
        where: { id: conversation.id },
        data: { last_message_at: new Date() },
      })

      // Notify the recipient
      await tx.notification.create({
        data: {
          user_id: recipientId,
          type: 'new_message',
          title: 'Mesazh i re',
          message: `${session.user.name || session.user.email}: ${content.slice(0, 80)}${content.length > 80 ? '…' : ''}`,
          link:
            recipientId === conversation.agent_id
              ? `/agent/conversations/${conversation.id}`
              : `/account/messages/${conversation.id}`,
        },
      })
    })

    revalidatePath(`/agent/conversations/${conversation.id}`)
    revalidatePath(`/account/messages/${conversation.id}`)
    revalidatePath('/agent/conversations')
    revalidatePath('/account/messages')

    return { success: true }
  } catch (error) {
    console.error('Send message error:', error)
    return { success: false, error: 'Mesazhi nuk u dërgua.' }
  }
}

/* ═══════════════════════════════════════════════════════════════
   MARK CONVERSATION AS READ
   ═══════════════════════════════════════════════════════════════ */

export async function markConversationRead(conversationId: number) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Duhet të jesh i loguar.' }
  }

  const callerId = Number(session.user.id)

  if (!Number.isSafeInteger(conversationId) || conversationId <= 0) {
    return { success: false, error: 'Biseda nuk është e vlefshme.' }
  }

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ user_id: callerId }, { agent_id: callerId }],
    },
    select: { id: true },
  })

  if (!conversation) {
    return { success: false, error: 'Biseda nuk u gjet.' }
  }

  await prisma.message.updateMany({
    where: {
      conversation_id: conversationId,
      is_read: false,
      NOT: { sender_id: callerId },
    },
    data: {
      is_read: true,
      read_at: new Date(),
    },
  })

  revalidatePath('/agent/conversations')
  revalidatePath('/account/messages')

  return { success: true }
}

/* ═══════════════════════════════════════════════════════════════
   CLOSE CONVERSATION
   ═══════════════════════════════════════════════════════════════ */

export async function closeConversation(conversationId: number) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Duhet të jesh i loguar.' }
  }

  const callerId = Number(session.user.id)

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ user_id: callerId }, { agent_id: callerId }],
    },
    select: { id: true },
  })

  if (!conversation) {
    return { success: false, error: 'Biseda nuk u gjet.' }
  }

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { status: 'CLOSED' },
  })

  revalidatePath('/agent/conversations')
  revalidatePath('/account/messages')

  return { success: true }
}