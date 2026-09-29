// lib/db/queries/chat.ts — read-only queries for the chat feature.
// Handles conversation lists for both parties (user + agent), single
// conversation with messages, unread counters, and the round-robin
// agent picker used by the contact form and new-conversation flow.

import { prisma } from '@/lib/db/prisma'

// ─── Conversation lists ──────────────────────────────────────

export async function getUserConversations(userId: number) {
  const conversations = await prisma.conversation.findMany({
    where: { user_id: userId },
    orderBy: { last_message_at: 'desc' },
    include: {
      agent: {
        select: { id: true, name: true, email: true, image: true },
      },
      property: {
        select: {
          id: true,
          slug: true,
          title: true,
          city: true,
          primary_image_url: true,
        },
      },
      messages: {
        orderBy: { created_at: 'desc' },
        take: 1,
        select: {
          id: true,
          content: true,
          sender_id: true,
          is_read: true,
          created_at: true,
        },
      },
      _count: {
        select: {
          messages: {
            where: { is_read: false, NOT: { sender_id: userId } },
          },
        },
      },
    },
  })

  return conversations.map((c) => ({
    ...c,
    unreadCount: c._count.messages,
    lastMessage: c.messages[0] ?? null,
  }))
}

export async function getAgentConversations(agentId: number) {
  const conversations = await prisma.conversation.findMany({
    where: { agent_id: agentId },
    orderBy: { last_message_at: 'desc' },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
      property: {
        select: {
          id: true,
          slug: true,
          title: true,
          city: true,
          primary_image_url: true,
        },
      },
      messages: {
        orderBy: { created_at: 'desc' },
        take: 1,
        select: {
          id: true,
          content: true,
          sender_id: true,
          is_read: true,
          created_at: true,
        },
      },
      _count: {
        select: {
          messages: {
            where: { is_read: false, NOT: { sender_id: agentId } },
          },
        },
      },
    },
  })

  return conversations.map((c) => ({
    ...c,
    unreadCount: c._count.messages,
    lastMessage: c.messages[0] ?? null,
  }))
}

// ─── Single conversation ────────────────────────────────────

/**
 * Includes a participant check — only the user or the agent can load it.
 */
export async function getConversationMessages(
  conversationId: number,
  callerId: number,
) {
  return prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ user_id: callerId }, { agent_id: callerId }],
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
      agent: {
        select: { id: true, name: true, email: true, image: true },
      },
      property: {
        select: {
          id: true,
          slug: true,
          title: true,
          city: true,
          primary_image_url: true,
        },
      },
      messages: {
        orderBy: { created_at: 'asc' },
        include: {
          sender: { select: { id: true, name: true, image: true } },
        },
      },
    },
  })
}

// ─── Counters ───────────────────────────────────────────────

export async function countUnreadMessages(userId: number) {
  return prisma.message.count({
    where: {
      is_read: false,
      NOT: { sender_id: userId },
      conversation: {
        OR: [{ user_id: userId }, { agent_id: userId }],
      },
    },
  })
}

// ─── Existing conversation lookup ───────────────────────────

export async function findExistingConversation(
  userId: number,
  agentId: number,
  propertyId: number | null,
) {
  return prisma.conversation.findFirst({
    where: {
      user_id: userId,
      agent_id: agentId,
      property_id: propertyId,
      status: 'OPEN',
    },
    orderBy: { last_message_at: 'desc' },
  })
}

// ─── Round-robin agent picker ───────────────────────────────

/**
 * Pick the next available agent for a new conversation.
 * Rule: agent with the fewest OPEN conversations; ties broken by user id
 * so the choice is deterministic (rather than by Postgres return order).
 * This is "least-connections" load balancing — what round-robin means here.
 */
export async function pickAvailableAgent() {
  const agents = await prisma.user.findMany({
    where: {
      is_active: true,
      role: { name: 'AGENT' },
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      _count: {
        select: {
          agent_conversations: {
            where: { status: 'OPEN' },
          },
        },
      },
    },
  })

  if (agents.length === 0) return null

  agents.sort((a, b) => {
    const load = a._count.agent_conversations - b._count.agent_conversations
    return load !== 0 ? load : a.id - b.id
  })

  const { _count, ...agent } = agents[0]
  return agent
}