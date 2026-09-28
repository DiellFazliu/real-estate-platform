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

export const STATUS_ORDER: Record<string, number> = {
  CONFIRMED: 1,
  PENDING: 2,
  CANCELLED: 3,
  REJECTED: 4,
  COMPLETED: 5,
}

export async function getUserAppointments(userId: number) {
  const appointments = await prisma.appointment.findMany({
    where: {
      user_id: userId,
    },
    select: {
      id: true,
      scheduled_at: true,
      status: true,
      notes: true,
      owner_notes: true,

      property: {
        select: {
          id: true,
          title: true,
          slug: true,
          city: true,
          neighborhood: true,
          primary_image_url: true,
        },
      },

      agent: {
        select: {
          name: true,
          email: true,
          phone: true,
          image: true,
        },
      },
    },
    orderBy: {
      scheduled_at: 'desc',
    },
  })

  appointments.sort((a, b) => {
    const statusA = STATUS_ORDER[a.status] ?? 99
    const statusB = STATUS_ORDER[b.status] ?? 99

    if (statusA !== statusB) {
      return statusA - statusB
    }

    return (
      new Date(b.scheduled_at).getTime() -
      new Date(a.scheduled_at).getTime()
    )
  })

  return appointments
}