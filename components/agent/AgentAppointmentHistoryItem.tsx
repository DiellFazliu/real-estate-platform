'use client'

import Link from 'next/link'
import {
    CalendarDays,
    Clock,
    ChevronDown,
    User,
    Phone,
    Mail,
    MapPin,
} from 'lucide-react'
import { useState } from 'react'

interface AgentAppointmentHistoryItemProps {
    appointment: {
        id: number
        scheduled_at: string
        status: string
        notes: string | null
        owner_notes: string | null

        property: {
            title: string
            slug: string
            city: string | null
            location: string | null
            price: number
        }

        user: {
            name: string | null
            email: string | null
            phone: string | null
        }
    }
}

function formatDate(date: Date) {
    return new Intl.DateTimeFormat('sq-AL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date)
}

function formatTime(date: Date) {
    return new Intl.DateTimeFormat('sq-AL', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(date)
}

function getStatusStyle(status: string) {
    switch (status.toUpperCase()) {
        case 'APPROVED':
        case 'CONFIRMED':
            return 'bg-green-100 text-green-700'

        case 'REJECTED':
        case 'CANCELLED':
            return 'bg-red-100 text-red-700'

        case 'COMPLETED':
            return 'bg-blue-100 text-blue-700'

        default:
            return 'bg-yellow-100 text-yellow-700'
    }
}

function getStatusLabel(status: string) {
    switch (status.toUpperCase()) {
        case 'APPROVED':
            return 'Aprovuar'

        case 'CONFIRMED':
            return 'Konfirmuar'

        case 'REJECTED':
            return 'Refuzuar'

        case 'CANCELLED':
            return 'Anuluar'

        case 'COMPLETED':
            return 'Përfunduar'

        case 'PENDING':
            return 'Në pritje'

        default:
            return status
    }
}

export function AgentAppointmentHistoryItem({
    appointment,
}: AgentAppointmentHistoryItemProps) {
    const [isOpen, setIsOpen] = useState(false)

    const statusLabel = getStatusLabel(appointment.status)
    const statusStyle = getStatusStyle(appointment.status)

    const scheduledDate = new Date(appointment.scheduled_at)

    return (
        <div className="border-b border-gray-100 last:border-b-0">
            {/* Header */}
            <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                className="flex w-full flex-col gap-3 p-5 text-left transition hover:bg-[#F7F3EE]/50 md:flex-row md:items-center md:justify-between"
            >
                {/* Appointment summary */}
                <div className="min-w-0">
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 ${
                                isOpen
                                    ? 'rotate-180 bg-[#F3E9E0] text-[#6B4C3B]'
                                    : 'bg-gray-100 text-gray-500'
                            }`}
                        >
                            <ChevronDown size={18} />
                        </div>

                        <div className="min-w-0">
                            <p className="truncate font-medium text-[#171310]">
                                {appointment.property.title}
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                                {appointment.user.name ||
                                    appointment.user.email ||
                                    'Pa emër'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Date + status */}
                <div className="flex items-center gap-4 pl-12 md:pl-0">
                    <span className="text-sm text-gray-400">
                        {formatDate(scheduledDate)}
                    </span>

                    <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle}`}
                    >
                        {statusLabel}
                    </span>
                </div>
            </button>

            {/* Expanded content */}
            {isOpen && (
                <div className="border-t border-gray-100 bg-[#FAF8F5] px-5 pb-6 pt-5">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Client information */}
                        <div>
                            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                Informacioni i klientit
                            </p>

                            <div className="space-y-3">
                                {/* Name */}
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#6B4C3B]">
                                        <User size={16} />
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400">
                                            Emri
                                        </p>

                                        <p className="text-sm font-medium text-[#171310]">
                                            {appointment.user.name ||
                                                'Pa emër'}
                                        </p>
                                    </div>
                                </div>

                                {/* Email */}
                                {appointment.user.email && (
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#6B4C3B]">
                                            <Mail size={16} />
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-400">
                                                Email
                                            </p>

                                            <p className="text-sm text-gray-600">
                                                {appointment.user.email}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Phone */}
                                {appointment.user.phone && (
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#6B4C3B]">
                                            <Phone size={16} />
                                        </div>

                                        <div>
                                            <p className="text-xs text-gray-400">
                                                Telefon
                                            </p>

                                            <p className="text-sm text-gray-600">
                                                {appointment.user.phone}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Appointment information */}
                        <div>
                            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                                Detajet e takimit
                            </p>

                            <div className="space-y-3">
                                {/* Date */}
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#6B4C3B]">
                                        <CalendarDays size={16} />
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400">
                                            Data
                                        </p>

                                        <p className="text-sm font-medium capitalize text-[#171310]">
                                            {formatDate(scheduledDate)}
                                        </p>
                                    </div>
                                </div>

                                {/* Time */}
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#6B4C3B]">
                                        <Clock size={16} />
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400">
                                            Ora
                                        </p>

                                        <p className="text-sm font-medium text-[#171310]">
                                            {formatTime(scheduledDate)}
                                        </p>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#6B4C3B]">
                                        <MapPin size={16} />
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400">
                                            Lokacioni
                                        </p>

                                        <p className="text-sm text-gray-600">
                                            {appointment.property.location ||
                                                appointment.property.city ||
                                                'Pa lokacion'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Property */}
                    <div className="mt-6 border-t border-gray-200 pt-5">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                            Prona
                        </p>

                        <Link
                            href={`/properties/${appointment.property.slug}`}
                            className="font-serif text-lg text-[#171310] transition hover:text-[#6B4C3B]"
                        >
                            {appointment.property.title}
                        </Link>

                        <p className="mt-1 font-semibold text-[#6B4C3B]">
                            €{Number(appointment.property.price).toLocaleString()}
                        </p>
                    </div>

                    {/* Client notes */}
                    {appointment.notes && (
                        <div className="mt-5 border-t border-gray-200 pt-5">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                Shënime të klientit
                            </p>

                            <p className="mt-2 text-sm leading-6 text-gray-600">
                                {appointment.notes}
                            </p>
                        </div>
                    )}

                    {/* Agent comment */}
                    {appointment.owner_notes && (
                        <div className="mt-5 border-t border-gray-200 pt-5">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                Komenti i agjentit
                            </p>

                            <p className="mt-2 text-sm leading-6 text-gray-600">
                                {appointment.owner_notes}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}