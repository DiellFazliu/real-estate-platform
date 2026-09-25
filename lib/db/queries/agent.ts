import { prisma } from '@/lib/db/prisma'
import { serializeProperties } from '@/lib/utils/serialize'

/**
 * Get the currently logged-in agent.
 */
export async function getAgentById(agentId: number) {
  return prisma.user.findUnique({
    where: {
      id: agentId,
    },
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
        select: {
          id: true,
          name: true,
        },
      },
    },
  })
}

/**
 * Get all properties.
 *
 * Used by the agent dashboard's "All Properties" page.
 */
export async function getAgentAllProperties() {
  return prisma.property.findMany({
    orderBy: {
      created_at: 'desc',
    },
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

/**
 * Get properties belonging to / assigned to an agent.
 */
export async function getAgentProperties(agentId: number) {
  const properties = await prisma.property.findMany({
    where: {
      OR: [
        {
          primary_agent_id: agentId,
        },
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
    orderBy: {
      created_at: 'desc',
    },
  })

  return serializeProperties(properties)
}

/**
 * Get appointments assigned to an agent.
 */
export async function getAgentAppointments(agentId: number) {
  return prisma.appointment.findMany({
    where: {
      agent_id: agentId,
    },
    orderBy: {
      scheduled_at: 'asc',
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
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