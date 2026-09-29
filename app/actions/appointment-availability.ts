'use server'

// app/actions/appointment-availability.ts — returns the slot grid for a
// given property + date.
//
// For each of the 18 half-hour slots (09:00–17:30), we check whether the
// property's assigned agent already has a PENDING or CONFIRMED appointment
// at that time.
//
// The agent-selection logic is shared with createAppointment via
// findPropertyWithAgent — same priority rules in one place.
//
// Note: this is read-only and NOT a lock. createAppointment re-checks
// conflicts inside a transaction with SELECT … FOR UPDATE, so a slot
// shown as available here can still be rejected at creation time.

import { findPropertyWithAgent } from '@/lib/appointments/find-agent'
import { prisma } from '@/lib/db/prisma'

const ACTIVE_APPOINTMENT_STATUSES = ['PENDING', 'CONFIRMED']

const TIME_SLOTS = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '12:30',
  '13:00',
  '13:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
]

export async function getAvailableAppointmentSlots(
  propertyId: number,
  date: string,
) {
  try {
    if (!Number.isSafeInteger(propertyId) || propertyId <= 0) {
      return {
        success: false,
        error: 'Prona nuk është e vlefshme',
        slots: [],
      }
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return {
        success: false,
        error: 'Data nuk është e vlefshme',
        slots: [],
      }
    }

    const result = await findPropertyWithAgent(propertyId)

    if (!result.ok) {
      const message =
        result.reason === 'no-agent'
          ? 'Kjo pronë nuk ka agjent të caktuar'
          : 'Prona nuk është e disponueshme'

      return { success: false, error: message, slots: [] }
    }

    const agentId = result.agent.id

    // Load active appointments for the day.
    const startOfDay = new Date(`${date}T00:00:00`)
    const endOfDay = new Date(`${date}T23:59:59.999`)

    const appointments = await prisma.appointment.findMany({
      where: {
        agent_id: agentId,
        scheduled_at: { gte: startOfDay, lte: endOfDay },
        status: { in: ACTIVE_APPOINTMENT_STATUSES },
      },
      select: { scheduled_at: true },
    })

    // Convert booked timestamps to "HH:mm" for direct comparison
    // against TIME_SLOTS.
    const bookedSlots = new Set(
      appointments.map((appointment) => {
        const hours = String(appointment.scheduled_at.getHours()).padStart(
          2,
          '0',
        )
        const minutes = String(
          appointment.scheduled_at.getMinutes(),
        ).padStart(2, '0')
        return `${hours}:${minutes}`
      }),
    )

    const slots = TIME_SLOTS.map((time) => ({
      time,
      available: !bookedSlots.has(time),
    }))

    return { success: true, slots }
  } catch (error) {
    console.error('Get appointment availability error:', error)

    return {
      success: false,
      error: 'Nuk mund të kontrollohet disponueshmëria.',
      slots: [],
    }
  }
}