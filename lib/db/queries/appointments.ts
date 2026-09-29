// lib/db/queries/appointments.ts — appointment queries for the end-user view.

import { prisma } from '@/lib/db/prisma'

// Sort priority for the user's appointment list: active states first,
// then historical. Lower = higher up.
const STATUS_ORDER: Record<string, number> = {
  CONFIRMED: 1,
  PENDING: 2,
  CANCELLED: 3,
  REJECTED: 4,
  COMPLETED: 5,
}

export async function getUserAppointments(userId: number) {
  const appointments = await prisma.appointment.findMany({
    where: { user_id: userId },
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
    orderBy: { scheduled_at: 'desc' },
  })

  // Prisma can't orderBy a computed priority, so we sort in memory:
  // by status group first, then most-recent-first within the group.
  appointments.sort((a, b) => {
    const statusA = STATUS_ORDER[a.status] ?? 99
    const statusB = STATUS_ORDER[b.status] ?? 99

    if (statusA !== statusB) return statusA - statusB

    return (
      new Date(b.scheduled_at).getTime() -
      new Date(a.scheduled_at).getTime()
    )
  })

  return appointments
}