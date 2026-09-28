'use client'

import { useState } from 'react'
import { updateAppointmentStatus } from '@/lib/appointments/update-appointment-status'

interface AppointmentStatusSelectProps {
    appointmentId: number
    currentStatus: string
}

const STATUS_OPTIONS = [
    {
        value: 'PENDING',
        label: 'Në pritje',
    },
    {
        value: 'CONFIRMED',
        label: 'Konfirmuar',
    },
    {
        value: 'COMPLETED',
        label: 'Përfunduar',
    },
    {
        value: 'CANCELLED',
        label: 'Anuluar',
    },
    {
        value: 'REJECTED',
        label: 'Refuzuar',
    },
]

export function AppointmentStatusSelect({
    appointmentId,
    currentStatus,
}: AppointmentStatusSelectProps) {
    const [status, setStatus] = useState(
        currentStatus.toUpperCase()
    )

    const [isUpdating, setIsUpdating] = useState(false)

    async function handleChange(
        event: React.ChangeEvent<HTMLSelectElement>
    ) {
        const newStatus = event.target.value as
            | 'PENDING'
            | 'CONFIRMED'
            | 'COMPLETED'
            | 'CANCELLED'
            | 'REJECTED'

        const previousStatus = status

        setStatus(newStatus)
        setIsUpdating(true)

        const result = await updateAppointmentStatus(
            appointmentId,
            newStatus
        )

        if (!result.success) {
            setStatus(previousStatus)
        }

        setIsUpdating(false)
    }

    function getStatusSelectStyle(status: string) {
    switch (status.toUpperCase()) {
        case 'CONFIRMED':
        case 'APPROVED':
            return 'border-green-200 bg-green-50 text-green-700'

        case 'COMPLETED':
            return 'border-blue-200 bg-blue-50 text-blue-700'

        case 'CANCELLED':
        case 'REJECTED':
            return 'border-red-200 bg-red-50 text-red-700'

        case 'PENDING':
            return 'border-yellow-200 bg-yellow-50 text-yellow-700'

        default:
            return 'border-gray-200 text-gray-700'
    }
}

    return (
        <div className="flex flex-col gap-2">
            <label className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Statusi
            </label>

            <div className="relative w-full sm:w-44">
                <select
                    value={status}
                    onChange={handleChange}
                    disabled={isUpdating}
                    className={`
                w-full appearance-none rounded-xl border
                bg-white px-4 py-2.5 pr-10
                text-sm font-semibold
                shadow-sm outline-none
                transition-all duration-200
                hover:shadow-md
                focus:ring-2 focus:ring-[#6B4C3B]/20
                disabled:cursor-not-allowed
                disabled:opacity-50
                ${getStatusSelectStyle(status)}
            `}
                >
                    {STATUS_OPTIONS.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                        >
                            {option.label}
                        </option>
                    ))}
                </select>

                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <svg
                        className="h-4 w-4 text-gray-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
            </div>

            {isUpdating && (
                <p className="text-xs text-gray-400">
                    Duke përditësuar...
                </p>
            )}
        </div>
    )
}