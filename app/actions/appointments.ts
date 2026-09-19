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

    if (!['OWNER', 'ADMIN'].includes(session.user.role)) {
      return { success: false, error: 'Nuk ke leje' }
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
      // 1. Update appointment
      await tx.appointment.update({
        where: { id: appointmentId },
        data: {
          status: 'CONFIRMED',
          agent_id: agentId || appointment.agent_id,
        },
      })

      // 2. Nëse agentId, cakto agjentin për pronën
      if (agentId) {
        await tx.property.update({
          where: { id: appointment.property_id },
          data: { primary_agent_id: agentId },
        })
      }

      // 3. Notification për userin
      await tx.notification.create({
        data: {
          user_id: appointment.user_id,
          type: 'appointment_confirmed',
          title: 'Takimi u konfirmua',
          message: `Takimi juaj për pronën "${appointment.property.title}" u konfirmua.`,
          link: '/account/appointments',
        },
      })

      // 4. Notification për agjentin
      if (agentId) {
        await tx.notification.create({
          data: {
            user_id: agentId,
            type: 'new_appointment_assigned',
            title: 'Takim i re i caktuar',
            message: `Ju u caktuat për takimin për pronën "${appointment.property.title}" më ${appointment.scheduled_at.toLocaleDateString('sq-AL')}.`,
            link: '/agent/appointments',
          },
        })
      }
    })

    revalidatePath('/owner/appointments')
    revalidatePath('/account/appointments')

    return { success: true, message: 'Takimi u aprovua' }
  } catch (error) {
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

    if (!['OWNER', 'ADMIN'].includes(session.user.role)) {
      return { success: false, error: 'Nuk ke leje' }
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: { property: true },
    })

    if (!appointment) {
      return { success: false, error: 'Takimi nuk u gjet' }
    }

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'REJECTED' },
    })

    // Notification për userin
    await prisma.notification.create({
      data: {
        user_id: appointment.user_id,
        type: 'appointment_rejected',
        title: 'Takimi u refuzua',
        message: `Takimi juaj për pronën "${appointment.property.title}" u refuzua.`,
        link: '/account/appointments',
      },
    })

    revalidatePath('/owner/appointments')
    revalidatePath('/account/appointments')

    return { success: true, message: 'Takimi u refuzua' }
  } catch (error) {
    console.error('Reject error:', error)
    return { success: false, error: 'Gabim i brendshëm' }
  }
}