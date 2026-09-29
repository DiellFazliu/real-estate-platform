'use server'

// app/actions/appointments.ts — server actions for the appointment lifecycle.
//
// State machine (PENDING is the only entry state):
//   PENDING ──accept──▶  CONFIRMED   (agent or owner/admin)
//   PENDING ──decline─▶  REJECTED    (agent or owner/admin)
//   PENDING ──cancel──▶  CANCELLED   (owning user only)
//
// createAppointment is the most important action: it uses SELECT … FOR
// UPDATE on the property and agent rows to serialize concurrent requests,
// preventing two users from booking the same agent at the same slot.
// Every state transition writes a notification to the affected party.

import { findPropertyWithAgent } from '@/lib/appointments/find-agent'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { appointmentSchema } from '@/lib/validation/appointment'
import { revalidatePath } from 'next/cache'

// Any appointment mutation can affect these three pages.
function revalidateAppointmentPaths() {
  revalidatePath('/account/appointments')
  revalidatePath('/agent/appointments')
  revalidatePath('/owner/appointments')
}

// ADMIN, or OWNER with the appointments:approve:all permission.
function canManageAppointments(session: {
  user: { role: string; permissions?: string[] }
}): boolean {
  if (session.user.role === 'ADMIN') return true
  if (session.user.role !== 'OWNER') return false
  return session.user.permissions?.includes('appointments:approve:all') ?? false
}

// ─── Create appointment ─────────────────────────────────────

export async function createAppointment(formData: FormData) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, error: 'Duhet të jesh i loguar' }
    }

    const userId = Number(session.user.id)

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      return {
        success: false,
        error: 'Sesioni i përdoruesit nuk është i vlefshëm',
      }
    }

    const parsed = appointmentSchema.safeParse({
      propertyId: Number(formData.get('propertyId')),
      scheduledAt: formData.get('scheduledAt'),
      notes: (formData.get('notes') as string) || undefined,
    })

    if (!parsed.success) {
      return {
        success: false,
        error:
          parsed.error.flatten().fieldErrors.scheduledAt?.[0] ||
          'Të dhëna të pavlefshme',
      }
    }

    const { propertyId, scheduledAt, notes } = parsed.data

    const scheduledDate = new Date(scheduledAt)

    if (Number.isNaN(scheduledDate.getTime())) {
      return { success: false, error: 'Data/ora është e pavlefshme' }
    }

    if (scheduledDate <= new Date()) {
      return { success: false, error: 'Data duhet të jetë në të ardhmen' }
    }

    // Business hours: 09:00 – 18:00, on the hour or half hour only.
    const hour = scheduledDate.getHours()
    const minutes = scheduledDate.getMinutes()

    if (hour < 9 || hour >= 18 || (minutes !== 0 && minutes !== 30)) {
      return {
        success: false,
        error:
          'Ora duhet të jetë midis 09:00 dhe 18:00 dhe në intervale 30-minutëshe.',
      }
    }

    // Property lookup + agent selection — shared with the availability
    // endpoint via findPropertyWithAgent.
    const result = await findPropertyWithAgent(propertyId)

    if (!result.ok) {
      const message =
        result.reason === 'not-found'
          ? 'Prona nuk u gjet'
          : result.reason === 'not-available'
            ? 'Prona nuk është më e disponueshme'
            : 'Kjo pronë nuk ka aktualisht një agjent të caktuar.'

      return { success: false, error: message }
    }

    const { propertyTitle, agent } = result
    const agentId = agent.id

    // ── Pre-transaction conflict checks (fast path; tx re-checks) ──
    const userConflict = await prisma.appointment.findFirst({
      where: {
        user_id: userId,
        scheduled_at: scheduledDate,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      select: { id: true },
    })

    if (userConflict) {
      return { success: false, error: 'Ke tashmë një takim në këtë orë.' }
    }

    const agentConflict = await prisma.appointment.findFirst({
      where: {
        agent_id: agentId,
        scheduled_at: scheduledDate,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      select: { id: true },
    })

    if (agentConflict) {
      return { success: false, error: 'Agjenti nuk është i lirë në këtë orë.' }
    }

    const appointment = await prisma.$transaction(async (tx) => {
      // Row-level locks on the property and the agent. Two concurrent
      // requests targeting the same pair will serialize here, so the
      // re-checks below can't both pass and double-book the slot.
      await tx.$queryRaw`
        SELECT id FROM properties WHERE id = ${propertyId} FOR UPDATE
      `
      await tx.$queryRaw`
        SELECT id FROM users WHERE id = ${agentId} FOR UPDATE
      `

      const propertyConflict = await tx.appointment.findFirst({
        where: {
          property_id: propertyId,
          scheduled_at: scheduledDate,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
        select: { id: true },
      })

      if (propertyConflict) {
        throw new Error('PROPERTY_SLOT_TAKEN')
      }

      const agentConflictTx = await tx.appointment.findFirst({
        where: {
          agent_id: agentId,
          scheduled_at: scheduledDate,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
        select: { id: true },
      })

      if (agentConflictTx) {
        throw new Error('AGENT_SLOT_TAKEN')
      }

      const created = await tx.appointment.create({
        data: {
          user_id: userId,
          property_id: propertyId,
          agent_id: agentId,
          scheduled_at: scheduledDate,
          status: 'PENDING',
          notes: notes || null,
        },
      })

      await tx.property.update({
        where: { id: propertyId },
        data: { appointment_count: { increment: 1 } },
      })

      // Notify the agent
      await tx.notification.create({
        data: {
          user_id: agentId,
          type: 'new_appointment',
          title: 'Kërkesë e re për takim',
          message: `${session.user.name || session.user.email} kërkoi një vizitë për pronën "${propertyTitle}".`,
          link: '/agent/appointments',
        },
      })

      // Notify owners + admins
      const managers = await tx.user.findMany({
        where: {
          role: { name: { in: ['OWNER', 'ADMIN'] } },
          is_active: true,
        },
        select: { id: true },
      })

      for (const manager of managers) {
        await tx.notification.create({
          data: {
            user_id: manager.id,
            type: 'new_appointment',
            title: 'Takim i ri',
            message: `${session.user.name || session.user.email} kërkoi takim për "${propertyTitle}".`,
            link: '/owner/appointments',
          },
        })
      }

      // Notify the user that the request was received
      await tx.notification.create({
        data: {
          user_id: userId,
          type: 'appointment_submitted',
          title: 'Kërkesa u dërgua',
          message: `Kërkesa juaj për vizitë në "${propertyTitle}" u dërgua. Agjenti do të konfirmojë së shpejti.`,
          link: '/account/appointments',
        },
      })

      return created
    })

    revalidateAppointmentPaths()

    return {
      success: true,
      message: 'Takimi u krijua me sukses! Do të kontaktoheni për konfirmim.',
      appointmentId: appointment.id,
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'PROPERTY_SLOT_TAKEN') {
      return {
        success: false,
        error: 'Ky slot është i zënë. Zgjidh një orë tjetër.',
      }
    }

    if (error instanceof Error && error.message === 'AGENT_SLOT_TAKEN') {
      return {
        success: false,
        error: 'Agjenti nuk është i lirë në këtë orë. Zgjidh një orë tjetër.',
      }
    }

    console.error('Create appointment error:', error)
    return { success: false, error: 'Gabim i brendshëm' }
  }
}

// ─── Cancel appointment (user) ──────────────────────────────

export async function cancelAppointment(appointmentId: number) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Duhet të jesh i loguar' }
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    })

    if (!appointment) {
      return { success: false, error: 'Takimi nuk u gjet' }
    }

    if (appointment.user_id !== parseInt(session.user.id)) {
      return { success: false, error: 'Nuk ke leje' }
    }

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CANCELLED' },
    })

    revalidateAppointmentPaths()

    return { success: true, message: 'Takimi u anulua' }
  } catch (error) {
    console.error('Cancel appointment error:', error)
    return { success: false, error: 'Gabim i brendshëm' }
  }
}

// ─── Accept appointment (agent) ─────────────────────────────

export async function acceptAppointment(appointmentId: number) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Duhet të jesh i loguar' }
    }

    if (session.user.role !== 'AGENT') {
      return { success: false, error: 'Nuk ke leje' }
    }

    const agentId = Number(session.user.id)

    if (!Number.isSafeInteger(agentId) || agentId <= 0) {
      return {
        success: false,
        error: 'Sesioni i përdoruesit nuk është i vlefshëm',
      }
    }

    if (!Number.isSafeInteger(appointmentId) || appointmentId <= 0) {
      return { success: false, error: 'Takimi nuk është i vlefshëm' }
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        property: { select: { id: true, title: true } },
      },
    })

    if (!appointment) {
      return { success: false, error: 'Takimi nuk u gjet' }
    }

    if (appointment.agent_id !== agentId) {
      return {
        success: false,
        error: 'Ky takim nuk është i caktuar për ju',
      }
    }

    if (appointment.status !== 'PENDING') {
      return { success: false, error: 'Ky takim nuk është më në pritje' }
    }

    // Reject if the agent already has another appointment at the same slot.
    const conflict = await prisma.appointment.findFirst({
      where: {
        agent_id: agentId,
        scheduled_at: appointment.scheduled_at,
        status: { in: ['PENDING', 'CONFIRMED'] },
        id: { not: appointment.id },
      },
      select: { id: true },
    })

    if (conflict) {
      return { success: false, error: 'Ke një takim tjetër në këtë orë.' }
    }

    await prisma.$transaction(async (tx) => {
      // Guard against double-click / race: only proceed if still PENDING.
      const transition = await tx.appointment.updateMany({
        where: {
          id: appointmentId,
          agent_id: agentId,
          status: 'PENDING',
        },
        data: { status: 'CONFIRMED' },
      })

      if (transition.count !== 1) {
        throw new Error('APPOINTMENT_NOT_PENDING')
      }

      await tx.notification.create({
        data: {
          user_id: appointment.user_id,
          type: 'appointment_confirmed',
          title: 'Takimi u konfirmua',
          message: `Takimi juaj për pronën "${appointment.property.title}" u konfirmua nga agjenti.`,
          link: '/account/appointments',
        },
      })
    })

    revalidateAppointmentPaths()

    return { success: true, message: 'Takimi u pranua me sukses' }
  } catch (error) {
    if (error instanceof Error && error.message === 'APPOINTMENT_NOT_PENDING') {
      return { success: false, error: 'Ky takim nuk është më në pritje' }
    }

    console.error('Accept appointment error:', error)
    return { success: false, error: 'Gabim i brendshëm' }
  }
}

// ─── Decline appointment (agent) ────────────────────────────

export async function declineAppointment(appointmentId: number) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Duhet të jesh i loguar' }
    }

    if (session.user.role !== 'AGENT') {
      return { success: false, error: 'Nuk ke leje' }
    }

    const agentId = Number(session.user.id)

    if (!Number.isSafeInteger(agentId) || agentId <= 0) {
      return {
        success: false,
        error: 'Sesioni i përdoruesit nuk është i vlefshëm',
      }
    }

    if (!Number.isSafeInteger(appointmentId) || appointmentId <= 0) {
      return { success: false, error: 'Takimi nuk është i vlefshëm' }
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        property: { select: { id: true, title: true } },
      },
    })

    if (!appointment) {
      return { success: false, error: 'Takimi nuk u gjet' }
    }

    if (appointment.agent_id !== agentId) {
      return {
        success: false,
        error: 'Ky takim nuk është i caktuar për ju',
      }
    }

    if (appointment.status !== 'PENDING') {
      return { success: false, error: 'Ky takim nuk është më në pritje' }
    }

    await prisma.$transaction(async (tx) => {
      const transition = await tx.appointment.updateMany({
        where: {
          id: appointmentId,
          agent_id: agentId,
          status: 'PENDING',
        },
        data: { status: 'REJECTED' },
      })

      if (transition.count !== 1) {
        throw new Error('APPOINTMENT_NOT_PENDING')
      }

      await tx.notification.create({
        data: {
          user_id: appointment.user_id,
          type: 'appointment_rejected',
          title: 'Takimi u refuzua',
          message: `Takimi juaj për pronën "${appointment.property.title}" u refuzua nga agjenti.`,
          link: '/account/appointments',
        },
      })
    })

    revalidateAppointmentPaths()

    return { success: true, message: 'Takimi u refuzua' }
  } catch (error) {
    if (error instanceof Error && error.message === 'APPOINTMENT_NOT_PENDING') {
      return { success: false, error: 'Ky takim nuk është më në pritje' }
    }

    console.error('Decline appointment error:', error)
    return { success: false, error: 'Gabim i brendshëm' }
  }
}

// ─── Approve with agent (owner/admin) ───────────────────────

export async function approveAppointmentWithAgent(
  appointmentId: number,
  agentId?: number,
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, error: 'Duhet të jesh i loguar' }
    }

    if (!canManageAppointments(session)) {
      return { success: false, error: 'Nuk ke leje' }
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        property: { select: { id: true, title: true } },
      },
    })

    if (!appointment) {
      return { success: false, error: 'Takimi nuk u gjet' }
    }

    if (appointment.status !== 'PENDING') {
      return { success: false, error: 'Ky takim nuk është më në pritje' }
    }

    const finalAgentId = agentId ?? appointment.agent_id

    if (!finalAgentId) {
      return {
        success: false,
        error: 'Zgjidhni një agjent para aprovimit.',
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          status: 'CONFIRMED',
          agent_id: finalAgentId,
        },
      })

      await tx.notification.create({
        data: {
          user_id: appointment.user_id,
          type: 'appointment_confirmed',
          title: 'Takimi u konfirmua',
          message: `Takimi juaj për pronën "${appointment.property.title}" u konfirmua.`,
          link: '/account/appointments',
        },
      })
    })

    revalidateAppointmentPaths()

    return { success: true, message: 'Takimi u aprovua' }
  } catch (error) {
    console.error('Approve appointment error:', error)
    return { success: false, error: 'Gabim i brendshëm' }
  }
}

// ─── Reject appointment (owner/admin) ───────────────────────

export async function rejectAppointment(appointmentId: number) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, error: 'Duhet të jesh i loguar' }
    }

    if (!canManageAppointments(session)) {
      return { success: false, error: 'Nuk ke leje' }
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        property: { select: { id: true, title: true } },
      },
    })

    if (!appointment) {
      return { success: false, error: 'Takimi nuk u gjet' }
    }

    if (appointment.status !== 'PENDING') {
      return { success: false, error: 'Ky takim nuk është më në pritje' }
    }

    await prisma.$transaction(async (tx) => {
      await tx.appointment.update({
        where: { id: appointmentId },
        data: { status: 'REJECTED' },
      })

      await tx.notification.create({
        data: {
          user_id: appointment.user_id,
          type: 'appointment_rejected',
          title: 'Takimi u refuzua',
          message: `Kërkesa juaj për vizitë në "${appointment.property.title}" u refuzua.`,
          link: '/account/appointments',
        },
      })
    })

    revalidateAppointmentPaths()

    return { success: true, message: 'Takimi u refuzua' }
  } catch (error) {
    console.error('Reject appointment error:', error)
    return { success: false, error: 'Gabim i brendshëm' }
  }
}

// ─── Update comment (agent) ─────────────────────────────────

export async function updateAppointmentComment(
  appointmentId: number,
  comment: string,
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Duhet të jesh i loguar.' }
    }

    const agentId = Number(session.user.id)

    if (!Number.isSafeInteger(appointmentId) || appointmentId <= 0) {
      return { success: false, error: 'Takimi nuk është i vlefshëm.' }
    }

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        agent_id: agentId,
      },
      select: { id: true },
    })

    if (!appointment) {
      return { success: false, error: 'Takimi nuk u gjet.' }
    }

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        owner_notes: comment.trim() || null,
      },
    })

    return { success: true }
  } catch (error) {
    console.error('Update appointment comment error:', error)
    return { success: false, error: 'Nuk u ruajt komenti.' }
  }
}