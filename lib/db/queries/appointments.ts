import { prisma } from '@/lib/db/prisma'

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


export async function getBookedSlots(

  propertyId: number,

  date: Date

) {

  const startOfDay = new Date(date)

  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(date)

  endOfDay.setHours(23, 59, 59, 999)

  return prisma.appointment.findMany({

    where: {

      property_id: propertyId,

      scheduled_at: {

        gte: startOfDay,

        lte: endOfDay,

      },

      status: {

        in: ['PENDING', 'CONFIRMED'],

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