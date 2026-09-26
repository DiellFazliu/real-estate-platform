'use server'

import { prisma } from '@/lib/db/prisma'

const ACTIVE_APPOINTMENT_STATUSES = [
    'PENDING',
    'CONFIRMED',
]

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

        // ---------------------------------------------------------
        // FIND ACTIVE AGENT
        // ---------------------------------------------------------

        const property = await prisma.property.findFirst({
            where: {
                id: propertyId,
                status: 'PUBLISHED',
                review_status: 'APPROVED',
            },
            select: {
                id: true,
                title: true,
                primary_agent_id: true,
                primary_agent: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        is_active: true,
                        role: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                agents: {
                    where: {
                        status: 'ACTIVE',
                        agent: {
                            is_active: true,
                            role: {
                                name: 'AGENT',
                            },
                        },
                    },
                    orderBy: [
                        {
                            is_primary: 'desc',
                        },
                        {
                            assigned_at: 'asc',
                        },
                    ],
                    select: {
                        agent_id: true,
                        agent: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        })

        if (!property) {
            return {
                success: false,
                error: 'Prona nuk është e disponueshme',
                slots: [],
            }
        }

        let agentId: number | null = null
        let agentName: string | null = null
        let agentEmail: string | null = null

        // 1. Prefer primary_agent_id if the primary agent is valid
        if (
            property.primary_agent_id &&
            property.primary_agent?.is_active &&
            property.primary_agent.role.name === 'AGENT'
        ) {
            agentId = property.primary_agent.id
            agentName = property.primary_agent.name
            agentEmail = property.primary_agent.email
        }

        // 2. Otherwise use an active PropertyAgent assignment
        if (!agentId && property.agents.length > 0) {
            const assignedAgent = property.agents[0]

            agentId = assignedAgent.agent_id
            agentName = assignedAgent.agent.name
            agentEmail = assignedAgent.agent.email
        }

        if (!agentId) {
            return {
                success: false,
                error: 'Kjo pronë nuk ka agjent të caktuar',
                slots: [],
            }
        }


        // ---------------------------------------------------------
        // GET APPOINTMENTS FOR SELECTED DATE
        // ---------------------------------------------------------

        const startOfDay = new Date(`${date}T00:00:00`)
        const endOfDay = new Date(`${date}T23:59:59.999`)

        const appointments = await prisma.appointment.findMany({
            where: {
                agent_id: agentId,
                scheduled_at: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                status: {
                    in: ACTIVE_APPOINTMENT_STATUSES,
                },
            },
            select: {
                scheduled_at: true,
            },
        })

        // ---------------------------------------------------------
        // CONVERT BOOKED APPOINTMENTS TO HH:mm
        // ---------------------------------------------------------

        const bookedSlots = new Set(
            appointments.map((appointment) => {
                const hours = String(
                    appointment.scheduled_at.getHours(),
                ).padStart(2, '0')

                const minutes = String(
                    appointment.scheduled_at.getMinutes(),
                ).padStart(2, '0')

                return `${hours}:${minutes}`
            }),
        )

        // ---------------------------------------------------------
        // RETURN AVAILABLE SLOTS
        // ---------------------------------------------------------

        const slots = TIME_SLOTS.map((time) => ({
            time,
            available: !bookedSlots.has(time),
        }))

        return {
            success: true,
            slots,
        }
    } catch (error) {
        console.error(
            'Get appointment availability error:',
            error,
        )

        return {
            success: false,
            error: 'Nuk mund të kontrollohet disponueshmëria.',
            slots: [],
        }
    }
}