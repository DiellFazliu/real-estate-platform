'use server'

// app/actions/chat.ts — server actions for the chat feature.
// Covers:
//   • createConversation — new or reused conversation + first message
//   • sendMessage        — append a message to an existing conversation
//   • markConversationRead — flip unread messages to read
//   • closeConversation  — set status to CLOSED
//
// All actions share three concerns:
//   1. Auth: the caller must have a valid session
//   2. Ownership: caller must be user_id or agent_id of the conversation
//   3. Side effects: write message + update last_message_at + notify
//      recipient, atomically inside one transaction.

import { revalidatePath } from 'next/cache'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import {
  findExistingConversation,
  pickAvailableAgent,
} from '@/lib/db/queries/chat'

// ─── Shared helpers ─────────────────────────────────────────

// Returns either { ok: true, userId, session } or { ok: false, error }.
// Session is narrowed to non-null on the success branch — callers can
// safely use session.user.name / .email after checking `ok`.
async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) {
    return { ok: false as const, error: 'Duhet të jesh i loguar.' }
  }
  const userId = Number(session.user.id)
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return { ok: false as const, error: 'Duhet të jesh i loguar.' }
  }
  return { ok: true as const, userId, session }
}

async function requireParticipant(conversationId: number, callerId: number) {
  return prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ user_id: callerId }, { agent_id: callerId }],
    },
    select: { id: true, user_id: true, agent_id: true, status: true },
  })
}

function buildMessagePreview(
  name: string | null | undefined,
  email: string | null | undefined,
  content: string,
): string {
  const senderLabel = name || email || 'Përdorues'
  const trimmed = content.slice(0, 80)
  return `${senderLabel}: ${trimmed}${content.length > 80 ? '…' : ''}`
}

function revalidateChatPaths(conversationId?: number) {
  revalidatePath('/agent/conversations')
  revalidatePath('/account/messages')
  if (conversationId) {
    revalidatePath(`/agent/conversations/${conversationId}`)
    revalidatePath(`/account/messages/${conversationId}`)
  }
}

// ─── Create conversation ────────────────────────────────────

export async function createConversation(input: {
  propertyId?: number | null
  subject?: string
  firstMessage: string
}) {
  const authResult = await requireAuth()
  if (!authResult.ok) return { success: false, error: authResult.error }

  const { userId, session } = authResult

  const content = input.firstMessage.trim()
  if (content.length < 2 || content.length > 2000) {
    return {
      success: false,
      error: 'Mesazhi duhet të ketë nga 2 deri në 2000 karaktere.',
    }
  }

  const propertyId = input.propertyId ?? null

  // ── Determine target agent ─────────────────────────────
  let agentId: number | null = null

  if (propertyId) {
    // Property-specific: prefer the property's primary agent, fall back to
    // the first ACTIVE assigned agent (is_primary first, then oldest).
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
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
            agent: { is_active: true, role: { name: 'AGENT' } },
          },
          orderBy: [{ is_primary: 'desc' }, { assigned_at: 'asc' }],
          select: { agent_id: true },
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
    // General: pick the least-loaded agent (round-robin).
    const agent = await pickAvailableAgent()
    if (!agent) {
      return {
        success: false,
        error: 'Nuk ka agjentë të disponueshëm për momentin.',
      }
    }
    agentId = agent.id
  }

  const preview = buildMessagePreview(
    session.user.name,
    session.user.email,
    content,
  )

  // ── Reuse existing OPEN conversation ───────────────────
  const existing = await findExistingConversation(userId, agentId, propertyId)
  if (existing) {
    try {
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
            title: 'Mesazh i ri',
            message: preview,
            link: `/agent/conversations/${existing.id}`,
          },
        })
      })

      revalidateChatPaths(existing.id)
      return { success: true, conversationId: existing.id, reused: true }
    } catch (error) {
      console.error('Reuse conversation error:', error)
      return { success: false, error: 'Biseda nuk u ruajt.' }
    }
  }

  // ── Create new conversation ────────────────────────────
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
          title: 'Mesazh i ri',
          message: preview,
          link: `/agent/conversations/${created.id}`,
        },
      })

      return created
    })

    revalidateChatPaths(conversation.id)
    return { success: true, conversationId: conversation.id, reused: false }
  } catch (error) {
    console.error('Create conversation error:', error)
    return { success: false, error: 'Biseda nuk u krijua.' }
  }
}

// ─── Send message ──────────────────────────────────────────

export async function sendMessage(input: {
  conversationId: number
  content: string
}) {
  const authResult = await requireAuth()
  if (!authResult.ok) return { success: false, error: authResult.error }

  const { userId: senderId, session } = authResult
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

  const conversation = await requireParticipant(input.conversationId, senderId)
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

  const preview = buildMessagePreview(
    session.user.name,
    session.user.email,
    content,
  )

  // Link depends on which side receives the notification.
  const link =
    recipientId === conversation.agent_id
      ? `/agent/conversations/${conversation.id}`
      : `/account/messages/${conversation.id}`

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
      await tx.notification.create({
        data: {
          user_id: recipientId,
          type: 'new_message',
          title: 'Mesazh i ri',
          message: preview,
          link,
        },
      })
    })

    revalidateChatPaths(conversation.id)
    return { success: true }
  } catch (error) {
    console.error('Send message error:', error)
    return { success: false, error: 'Mesazhi nuk u dërgua.' }
  }
}

// ─── Mark conversation as read ─────────────────────────────

export async function markConversationRead(conversationId: number) {
  const authResult = await requireAuth()
  if (!authResult.ok) return { success: false, error: authResult.error }

  const { userId: callerId } = authResult

  if (!Number.isSafeInteger(conversationId) || conversationId <= 0) {
    return { success: false, error: 'Biseda nuk është e vlefshme.' }
  }

  const conversation = await requireParticipant(conversationId, callerId)
  if (!conversation) {
    return { success: false, error: 'Biseda nuk u gjet.' }
  }

  await prisma.message.updateMany({
    where: {
      conversation_id: conversationId,
      is_read: false,
      NOT: { sender_id: callerId },
    },
    data: { is_read: true, read_at: new Date() },
  })

  revalidateChatPaths()
  return { success: true }
}

// ─── Close conversation ────────────────────────────────────

export async function closeConversation(conversationId: number) {
  const authResult = await requireAuth()
  if (!authResult.ok) return { success: false, error: authResult.error }

  const conversation = await requireParticipant(
    conversationId,
    authResult.userId,
  )
  if (!conversation) {
    return { success: false, error: 'Biseda nuk u gjet.' }
  }

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { status: 'CLOSED' },
  })

  revalidateChatPaths()
  return { success: true }
}