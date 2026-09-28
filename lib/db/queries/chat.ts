import { prisma } from '@/lib/db/prisma'

// ═══════════════════════════════════════════════════════════════
// CONVERSATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Get all conversations where the user is the client.
 */
export async function getUserConversations(userId: number) {
  const conversations = await prisma.conversation.findMany({
    where: {
      user_id: userId,
    },
    orderBy: { last_message_at: 'desc' },
    include: {
      agent: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
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
            where: {
              is_read: false,
              NOT: { sender_id: userId },
            },
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

/**
 * Get all conversations where the user is the agent.
 */
export async function getAgentConversations(agentId: number) {
  const conversations = await prisma.conversation.findMany({
    where: {
      agent_id: agentId,
    },
    orderBy: { last_message_at: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
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
            where: {
              is_read: false,
              NOT: { sender_id: agentId },
            },
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

/**
 * Get a single conversation with all messages.
 * Includes a caller check to ensure only participants can access.
 */
export async function getConversationMessages(
  conversationId: number,
  callerId: number,
) {
  const conversation = await prisma.conversation.findFirst({
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
          sender: {
            select: { id: true, name: true, image: true },
          },
        },
      },
    },
  })

  return conversation
}

/**
 * Count unread messages for a user (across all conversations).
 */
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

/**
 * Check if a user has an existing OPEN conversation with a given agent
 * about a specific property (or general if property_id is null).
 */
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

/**
 * Pick the next available agent for a general conversation.
 * Round-robin: agent with fewest open conversations.
 */
export async function pickAvailableAgent() {
  const agent = await prisma.user.findFirst({
    where: {
      is_active: true,
      role: { name: 'AGENT' },
    },
    orderBy: {
      agent_conversations: {
        _count: 'asc',
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  })

  return agent
}