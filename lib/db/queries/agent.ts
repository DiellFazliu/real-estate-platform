// lib/db/queries/agent.ts — read-only Prisma queries used by the agent dashboard.
//
//   • getAgentById              — profile data for the sidebar/layout
//   • getAgentAllProperties     — unfiltered property list (rarely used)
//   • getAgentProperties        — properties the agent is primary or ACTIVE
//                                 assigned to (the main dashboard query)
//   • getAgentAppointments      — appointments booked with this agent


import { prisma } from '@/lib/db/prisma'
import { serializeProperties } from '@/lib/utils/serialize'

export async function getAgentById(agentId: number) {
  return prisma.user.findUnique({
    where: { id: agentId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      bio: true,
      image: true,
      is_active: true,
      is_seller: true,
      seller_verified: true,

      role: {
        select: { id: true, name: true },
      },
    },
  })
}

export async function getAgentAllProperties() {
  return prisma.property.findMany({
    orderBy: { created_at: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      status: true,
      listing_type: true,
      city: true,
      location: true,
      property_type: true,
      bedrooms: true,
      bathrooms: true,
      area: true,
      featured: true,
      primary_agent_id: true,
      listed_by_id: true,
    },
  })
}

export async function getAgentProperties(agentId: number) {
  const properties = await prisma.property.findMany({
    where: {
      OR: [
        { primary_agent_id: agentId },
        {
          agents: {
            some: {
              agent_id: agentId,
              status: 'ACTIVE',
            },
          },
        },
      ],
    },
    orderBy: { created_at: 'desc' },
  })

  return serializeProperties(properties)
}

export async function getAgentAppointments(agentId: number) {
  return prisma.appointment.findMany({
    where: { agent_id: agentId },
    orderBy: { scheduled_at: 'asc' },
    include: {
      user: {
        select: { id: true, name: true, email: true, phone: true },
      },
      property: {
        select: {
          id: true,
          slug: true,
          title: true,
          city: true,
          location: true,
          price: true,
          listing_type: true,
        },
      },
    },
  })
}