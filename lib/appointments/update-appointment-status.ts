'use server'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { revalidatePath } from 'next/cache'

const ALLOWED_STATUSES = [
    'PENDING',
    'CONFIRMED',
    'COMPLETED',
    'CANCELLED',
    'REJECTED',
] as const

type AppointmentStatus = (typeof ALLOWED_STATUSES)[number]

export async function updateAppointmentStatus(
    appointmentId: number,
    status: AppointmentStatus
) {
    const session = await auth()

    if (!session?.user?.id) {
        return {
            success: false,
            error: 'Duhet të jesh i kyçur.',
        }
    }

    const agentId = Number(session.user.id)

    if (!ALLOWED_STATUSES.includes(status)) {
        return {
            success: false,
            error: 'Statusi nuk është i vlefshëm.',
        }
    }

    const appointment = await prisma.appointment.findFirst({
        where: {
            id: appointmentId,
            agent_id: agentId,
        },
        select: {
            id: true,
        },
    })

    if (!appointment) {
        return {
            success: false,
            error: 'Takimi nuk u gjet.',
        }
    }

    await prisma.appointment.update({
        where: {
            id: appointmentId,
        },
        data: {
            status,
        },
    })

    revalidatePath('/agent/appointments')
    revalidatePath('/appointments')

    return {
        success: true,
    }
}