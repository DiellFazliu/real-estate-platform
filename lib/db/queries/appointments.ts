import { prisma } from '@/lib/db/prisma'

const ACTIVE_APPOINTMENT_STATUSES = [
  'PENDING',
  'CONFIRMED',
]

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

export async function getAgentAppointmentsForDate(
  agentId: number,
  startOfDay: Date,
  endOfDay: Date,
) {
  return prisma.appointment.findMany({
    where: {
      agent_id: agentId,
      scheduled_at: {
        gte: startOfDay,
        lt: endOfDay,
      },
      status: {
        in: ACTIVE_APPOINTMENT_STATUSES,
      },
    },
    select: {
      scheduled_at: true,
    },
    orderBy: {
      scheduled_at: 'asc',
    },
  })
}