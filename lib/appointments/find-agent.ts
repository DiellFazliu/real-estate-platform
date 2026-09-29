// lib/appointments/find-agent.ts — shared agent-selection logic for the
// appointment feature.
//
// Both createAppointment and getAvailableAppointmentSlots need to answer
// the same question: "which agent handles this property?" The priority
// rules must stay in sync, so they live here.
//
// Priority:
//   1. primary_agent — only if active and has role AGENT
//   2. The first ACTIVE PropertyAgent assignment
//      (is_primary first, then oldest assigned_at)
//
// Returns a discriminated union so callers can produce the right error
// message for each failure reason.

import { prisma } from '@/lib/db/prisma'

export type AssignedAgent = {
  id: number
  name: string | null
  email: string | null
}

export type FindPropertyWithAgentResult =
  | {
      ok: true
      propertyId: number
      propertyTitle: string
      agent: AssignedAgent
    }
  | { ok: false; reason: 'not-found' | 'not-available' | 'no-agent' }

export async function findPropertyWithAgent(
  propertyId: number,
): Promise<FindPropertyWithAgentResult> {
  const property = await prisma.property.findFirst({
    where: { id: propertyId },
    select: {
      id: true,
      title: true,
      status: true,
      review_status: true,
      primary_agent_id: true,
      primary_agent: {
        select: {
          id: true,
          name: true,
          email: true,
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
          agent: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
  })

  if (!property) {
    return { ok: false, reason: 'not-found' }
  }

  if (
    property.status !== 'PUBLISHED' ||
    property.review_status !== 'APPROVED'
  ) {
    return { ok: false, reason: 'not-available' }
  }

  // Prefer primary_agent when active and role-correct.
  if (
    property.primary_agent_id &&
    property.primary_agent?.is_active &&
    property.primary_agent.role.name === 'AGENT'
  ) {
    return {
      ok: true,
      propertyId: property.id,
      propertyTitle: property.title,
      agent: {
        id: property.primary_agent.id,
        name: property.primary_agent.name,
        email: property.primary_agent.email,
      },
    }
  }

  // Fall back to the first active assignment.
  const first = property.agents[0]
  if (!first) {
    return { ok: false, reason: 'no-agent' }
  }

  return {
    ok: true,
    propertyId: property.id,
    propertyTitle: property.title,
    agent: {
      id: first.agent.id,
      name: first.agent.name,
      email: first.agent.email,
    },
  }
}