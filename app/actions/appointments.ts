'use server'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { appointmentSchema } from '@/lib/validation/appointment'
import { revalidatePath } from 'next/cache'

// ═══════════════════════════════════════════════════════════════
// CREATE APPOINTMENT
// ═══════════════════════════════════════════════════════════════

export async function createAppointment(formData: FormData) {
  try {
    // 1. AUTHENTICATE
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Duhet të jesh i loguar' }
    }

    // 2. VALIDATE
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

    // 3. KONVERTO DATEN
    const scheduledDate = new Date(scheduledAt)

    if (isNaN(scheduledDate.getTime())) {
      return { success: false, error: 'Data/orа është e pavlefshme' }
    }

    // 4. BUSINESS RULES
    if (scheduledDate < new Date()) {
      return { success: false, error: 'Data duhet të jetë në të ardhmen' }
    }

    const hour = scheduledDate.getHours()
    if (hour < 9 || hour >= 18) {
      return { success: false, error: 'Ora duhet të jetë midis 9:00 dhe 18:00' }
    }

    // 5. CHECK PROPERTY
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        title: true,
        status: true,
        primary_agent_id: true,
        sanity_id: true,
      },
    })

    if (!property) {
      return { success: false, error: 'Prona nuk u gjet' }
    }

    if (property.status !== 'PUBLISHED') {
      return { success: false, error: 'Prona nuk është më e disponueshme' }
    }

    // 6. CHECK USER CONFLICT
    const userConflict = await prisma.appointment.findFirst({
      where: {
        user_id: parseInt(session.user.id),
        scheduled_at: scheduledDate,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    })

    if (userConflict) {
      return { success: false, error: 'Ke tashmë një takim në këtë orë' }
    }

    // 7. TRANSACTION ME CONCURRENCY PROTECTION
    const appointment = await prisma.$transaction(async (tx) => {
      // Lock property row
      await tx.$queryRaw`
        SELECT id FROM properties WHERE id = ${propertyId} FOR UPDATE
      `

      // Check for conflict
      const existing = await tx.appointment.findFirst({
        where: {
          property_id: propertyId,
          scheduled_at: scheduledDate,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      })

      if (existing) {
        throw new Error('SLOT_TAKEN')
      }

      // Create appointment
      const created = await tx.appointment.create({
        data: {
          user_id: parseInt(session.user.id),
          property_id: propertyId,
          agent_id: property.primary_agent_id || null,
          scheduled_at: scheduledDate,
          status: 'PENDING',
          notes: notes || null,
        },
      })

      // Create notifications për owners
      const owners = await tx.user.findMany({
        where: { role: { name: { in: ['OWNER', 'ADMIN'] } } },
        select: { id: true },
      })

      for (const owner of owners) {
        await tx.notification.create({
          data: {
            user_id: owner.id,
            type: 'new_appointment',
            title: 'Takim i ri',
            message: `${session.user.name || session.user.email} kërkoi takim për "${property.title}" më ${scheduledDate.toLocaleDateString('sq-AL')} në ${scheduledDate.toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' })}.`,
            link: '/owner/appointments',
          },
        })
      }

      return created
    })

    // 8. REVALIDATE
    revalidatePath('/account/appointments')
    revalidatePath('/owner/appointments')

    return {
      success: true,
      message: 'Takimi u krijua me sukses! Do të kontaktoheni për konfirmim.',
      appointmentId: appointment.id,
    }
  } catch (error: any) {
    if (error.message === 'SLOT_TAKEN') {
      return {
        success: false,
        error: 'Ky slot është i zënë. Zgjidh një orë tjetër.',
      }
    }
    console.error('Create appointment error:', error)
    return { success: false, error: 'Gabim i brendshëm' }
  }
}

// ═══════════════════════════════════════════════════════════════
// CANCEL APPOINTMENT (nga user)
// ═══════════════════════════════════════════════════════════════

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

    // Vetëm pronari i takimit mund ta anulojë
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

// ═══════════════════════════════════════════════════════════════
// APPROVE + ASSIGN AGENT (i ri)
// ═══════════════════════════════════════════════════════════════

export async function approveAppointmentWithAgent(
  appointmentId: number,
  agentId?: number
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Duhet të jesh i loguar' }
    }

    const canManageAppointments =
      session.user.role === 'ADMIN' ||
      (session.user.role === 'OWNER' &&
        session.user.permissions?.includes('appointments:approve:all'))

    if (!canManageAppointments) {
      return { success: false, error: 'Nuk ke leje' }
    }

    const managerId = Number(session.user.id)
    if (!Number.isSafeInteger(managerId) || managerId <= 0) {
      return { success: false, error: 'Sesioni i përdoruesit nuk është i vlefshëm' }
    }

    if (!Number.isSafeInteger(appointmentId) || appointmentId <= 0) {
      return { success: false, error: 'Takimi nuk është i vlefshëm' }
    }

    if (agentId !== undefined && (!Number.isSafeInteger(agentId) || agentId <= 0)) {
      return { success: false, error: 'Agjenti nuk është i vlefshëm' }
    }

    const agent = agentId === undefined
      ? null
      : await prisma.user.findFirst({
          where: { id: agentId, is_active: true, role: { name: 'AGENT' } },
          select: { id: true, name: true, email: true },
        })

    if (agentId !== undefined && !agent) {
      return { success: false, error: 'Zgjidhni një agjent aktiv.' }
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { property: true },
    })

    if (!appointment) {
      return { success: false, error: 'Takimi nuk u gjet' }
    }

    if (appointment.status !== 'PENDING') {
      return { success: false, error: 'Takimi nuk është në pritje' }
    }

    await prisma.$transaction(async (tx) => {
      const transition = await tx.appointment.updateMany({
        where: { id: appointmentId, status: 'PENDING' },
        data: {
          status: 'CONFIRMED',
          agent_id: agent?.id ?? appointment.agent_id,
        },
      })

      if (transition.count !== 1) {
        throw new Error('APPOINTMENT_NOT_PENDING')
      }

      if (agent) {
        await tx.property.update({
          where: { id: appointment.property_id },
          data: { primary_agent_id: agent.id },
        })
      }

      await tx.notification.create({
        data: {
          user_id: appointment.user_id,
          type: 'appointment_confirmed',
          title: 'Takimi u konfirmua',
          message: `Takimi juaj për pronën "${appointment.property.title}" u konfirmua.`,
          link: '/account/appointments',
        },
      })

      if (agent) {
        await tx.notification.create({
          data: {
            user_id: agent.id,
            type: 'new_appointment_assigned',
            title: 'Takim i re i caktuar',
            message: `Ju u caktuat për takimin për pronën "${appointment.property.title}" më ${appointment.scheduled_at.toLocaleDateString('sq-AL')}.`,
            link: '/agent/appointments',
          },
        })
      }

      await tx.auditLog.create({
        data: {
          user_id: managerId,
          action: 'confirm_appointment',
          resource: 'appointment',
          resource_id: String(appointmentId),
          old_values: { status: 'PENDING', agent_id: appointment.agent_id },
          new_values: { status: 'CONFIRMED', agent_id: agent?.id ?? appointment.agent_id },
        },
      })
    })

    revalidatePath('/owner/appointments')
    revalidatePath('/account/appointments')

    return { success: true, message: 'Takimi u aprovua' }
  } catch (error) {
    if (error instanceof Error && error.message === 'APPOINTMENT_NOT_PENDING') {
      return { success: false, error: 'Takimi nuk është më në pritje' }
    }
    console.error('Approve with agent error:', error)
    return { success: false, error: 'Gabim i brendshëm' }
  }
}

// ═══════════════════════════════════════════════════════════════
// REJECT APPOINTMENT (nga owner/admin)
// ═══════════════════════════════════════════════════════════════

export async function rejectAppointment(appointmentId: number) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, error: 'Duhet të jesh i loguar' }
    }

    const canManageAppointments =
      session.user.role === 'ADMIN' ||
      (session.user.role === 'OWNER' &&
        session.user.permissions?.includes('appointments:approve:all'))

    if (!canManageAppointments) {
      return { success: false, error: 'Nuk ke leje' }
    }

    const managerId = Number(session.user.id)
    if (!Number.isSafeInteger(managerId) || managerId <= 0) {
      return { success: false, error: 'Sesioni i përdoruesit nuk është i vlefshëm' }
    }

    if (!Number.isSafeInteger(appointmentId) || appointmentId <= 0) {
      return { success: false, error: 'Takimi nuk është i vlefshëm' }
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { property: true },
    })

    if (!appointment) {
      return { success: false, error: 'Takimi nuk u gjet' }
    }

    if (appointment.status !== 'PENDING') {
      return { success: false, error: 'Takimi nuk është në pritje' }
    }

    await prisma.$transaction(async (tx) => {
      const transition = await tx.appointment.updateMany({
        where: { id: appointmentId, status: 'PENDING' },
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
          message: `Takimi juaj për pronën "${appointment.property.title}" u refuzua.`,
          link: '/account/appointments',
        },
      })

      await tx.auditLog.create({
        data: {
          user_id: managerId,
          action: 'reject_appointment',
          resource: 'appointment',
          resource_id: String(appointmentId),
          old_values: { status: 'PENDING' },
          new_values: { status: 'REJECTED' },
        },
      })
    })

    revalidatePath('/owner/appointments')
    revalidatePath('/account/appointments')

    return { success: true, message: 'Takimi u refuzua' }
  } catch (error) {
    if (error instanceof Error && error.message === 'APPOINTMENT_NOT_PENDING') {
      return { success: false, error: 'Takimi nuk është më në pritje' }
    }
    console.error('Reject error:', error)
    return { success: false, error: 'Gabim i brendshëm' }
  }
}
