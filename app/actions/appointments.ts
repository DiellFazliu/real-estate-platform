'use server'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { appointmentSchema } from '@/lib/validation/appointment'
import { revalidatePath } from 'next/cache'

/* ═══════════════════════════════════════════════════════════════
   CREATE APPOINTMENT
   ═══════════════════════════════════════════════════════════════ */

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

    const now = new Date()

    if (scheduledDate <= now) {
      return { success: false, error: 'Data duhet të jetë në të ardhmen' }
    }

    const hour = scheduledDate.getHours()

    if (hour < 9 || hour >= 18) {
      return {
        success: false,
        error: 'Ora duhet të jetë midis 09:00 dhe 18:00',
      }
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        title: true,
        status: true,
        review_status: true,
      },
    })

    if (!property) {
      return { success: false, error: 'Prona nuk u gjet' }
    }

    if (
      property.status !== 'PUBLISHED' ||
      property.review_status !== 'APPROVED'
    ) {
      return { success: false, error: 'Prona nuk është më e disponueshme' }
    }

    const propertyAgent = await prisma.propertyAgent.findFirst({
      where: {
        property_id: propertyId,
        status: 'ACTIVE',
        agent: {
          is_active: true,
          role: { name: 'AGENT' },
        },
      },
      orderBy: [{ is_primary: 'desc' }, { assigned_at: 'asc' }],
      select: {
        agent_id: true,
        agent: { select: { id: true, name: true, email: true } },
      },
    })

    if (!propertyAgent) {
      return {
        success: false,
        error: 'Kjo pronë nuk ka aktualisht një agjent të caktuar.',
      }
    }

    const agentId = propertyAgent.agent_id

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
      await tx.$queryRaw`
        SELECT id
        FROM properties
        WHERE id = ${propertyId}
        FOR UPDATE
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
          message: `${session.user.name || session.user.email} kërkoi një vizitë për pronën "${property.title}".`,
          link: '/agent/appointments',
        },
      })

      // Notify all owners + admins
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
            message: `${session.user.name || session.user.email} kërkoi takim për "${property.title}".`,
            link: '/owner/appointments',
          },
        })
      }

      // Notify the user that their request was submitted
      await tx.notification.create({
        data: {
          user_id: userId,
          type: 'appointment_submitted',
          title: 'Kërkesa u dërgua',
          message: `Kërkesa juaj për vizitë në "${property.title}" u dërgua. Agjenti do të konfirmojë së shpejti.`,
          link: '/account/appointments',
        },
      })

      return created
    })

    revalidatePath('/account/appointments')
    revalidatePath('/agent/appointments')
    revalidatePath('/owner/appointments')

    return {
      success: true,
      message:
        'Takimi u krijua me sukses! Do të kontaktoheni për konfirmim.',
      appointmentId: appointment.id,
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'PROPERTY_SLOT_TAKEN'
    ) {
      return {
        success: false,
        error: 'Ky slot është i zënë. Zgjidh një orë tjetër.',
      }
    }

    if (
      error instanceof Error &&
      error.message === 'AGENT_SLOT_TAKEN'
    ) {
      return {
        success: false,
        error: 'Agjenti nuk është i lirë në këtë orë. Zgjidh një orë tjetër.',
      }
    }

    console.error('Create appointment error:', error)
    return { success: false, error: 'Gabim i brendshëm' }
  }
}

/* ═══════════════════════════════════════════════════════════════
   CANCEL APPOINTMENT (from user)
   ═══════════════════════════════════════════════════════════════ */

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

    revalidatePath('/account/appointments')
    revalidatePath('/owner/appointments')

    return { success: true, message: 'Takimi u anulua' }
  } catch (error) {
    console.error('Cancel appointment error:', error)
    return { success: false, error: 'Gabim i brendshëm' }
  }
}

/* ═══════════════════════════════════════════════════════════════
   ACCEPT APPOINTMENT (by agent)
   ═══════════════════════════════════════════════════════════════ */

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

    revalidatePath('/agent/appointments')
    revalidatePath('/account/appointments')
    revalidatePath('/owner/appointments')

    return { success: true, message: 'Takimi u pranua me sukses' }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'APPOINTMENT_NOT_PENDING'
    ) {
      return { success: false, error: 'Ky takim nuk është më në pritje' }
    }

    console.error('Accept appointment error:', error)
    return { success: false, error: 'Gabim i brendshëm' }
  }
}

/* ═══════════════════════════════════════════════════════════════
   DECLINE APPOINTMENT (by agent)
   ═══════════════════════════════════════════════════════════════ */

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

    revalidatePath('/agent/appointments')
    revalidatePath('/account/appointments')
    revalidatePath('/owner/appointments')

    return { success: true, message: 'Takimi u refuzua' }
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'APPOINTMENT_NOT_PENDING'
    ) {
      return { success: false, error: 'Ky takim nuk është më në pritje' }
    }

    console.error('Decline appointment error:', error)
    return { success: false, error: 'Gabim i brendshëm' }
  }
}

/* ═══════════════════════════════════════════════════════════════
   APPROVE APPOINTMENT WITH AGENT (owner/admin)
   ═══════════════════════════════════════════════════════════════ */

export async function approveAppointmentWithAgent(
  appointmentId: number,
  agentId?: number,
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, error: 'Duhet të jesh i loguar' }
    }

    const canApprove =
      session.user.role === 'ADMIN' ||
      (session.user.role === 'OWNER' &&
        session.user.permissions?.includes('appointments:approve:all'))

    if (!canApprove) {
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

    revalidatePath('/owner/appointments')
    revalidatePath('/agent/appointments')
    revalidatePath('/account/appointments')

    return { success: true, message: 'Takimi u aprovua' }
  } catch (error) {
    console.error('Approve appointment error:', error)
    return { success: false, error: 'Gabim i brendshëm' }
  }
}

/* ═══════════════════════════════════════════════════════════════
   REJECT APPOINTMENT (owner/admin)
   ═══════════════════════════════════════════════════════════════ */

export async function rejectAppointment(appointmentId: number) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, error: 'Duhet të jesh i loguar' }
    }

    const canReject =
      session.user.role === 'ADMIN' ||
      (session.user.role === 'OWNER' &&
        session.user.permissions?.includes('appointments:approve:all'))

    if (!canReject) {
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

    revalidatePath('/owner/appointments')
    revalidatePath('/account/appointments')

    return { success: true, message: 'Takimi u refuzua' }
  } catch (error) {
    console.error('Reject appointment error:', error)
    return { success: false, error: 'Gabim i brendshëm' }
  }
}