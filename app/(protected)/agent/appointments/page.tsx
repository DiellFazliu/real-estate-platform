import Link from 'next/link'
import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import {
    CalendarDays,
    Clock,
    MapPin,
    User,
    Phone,
    Mail,
} from 'lucide-react'
import { getAgentAppointments } from '@/lib/db/queries/agent'
import AppointmentActions from '@/components/agent/AppointmentActions'

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

export default async function AgentAppointmentsPage() {
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/login')
    }

    const appointments = await getAgentAppointments(
        Number(session.user.id)
    )

    const upcomingAppointments = appointments.filter(
        (appointment) =>
            new Date(appointment.scheduled_at) >= new Date()
    )

    const pastAppointments = appointments.filter(
        (appointment) =>
            new Date(appointment.scheduled_at) < new Date()
    )

    return (
        <div className="p-8 lg:p-10">
            {/* Header */}
            <div className="mb-8">
                <p className="mb-2 text-sm font-medium uppercase tracking-widest text-[#6B4C3B]">
                    Orari
                </p>

                <h1 className="font-serif text-4xl text-[#171310]">
                    Takimet
                </h1>

                <p className="mt-2 text-sm text-gray-500">
                    Menaxho takimet me klientët për pronat e tua.
                </p>
            </div>

            {/* Stats */}
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Gjithsej
                    </p>

                    <p className="mt-2 text-3xl font-semibold">
                        {appointments.length}
                    </p>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Të ardhshme
                    </p>

                    <p className="mt-2 text-3xl font-semibold text-[#6B4C3B]">
                        {upcomingAppointments.length}
                    </p>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">
                        Të përfunduara
                    </p>

                    <p className="mt-2 text-3xl font-semibold text-green-600">
                        {
                            appointments.filter(
                                (appointment) =>
                                    appointment.status.toUpperCase() === 'COMPLETED'
                            ).length
                        }
                    </p>
                </div>
            </div>

            {/* Upcoming */}
            <section className="mb-10">
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="font-serif text-2xl text-[#171310]">
                        Takimet e ardhshme
                    </h2>

                    <span className="text-sm text-gray-400">
                        {upcomingAppointments.length} takime
                    </span>
                </div>

                {upcomingAppointments.length === 0 ? (
                    <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                        <CalendarDays
                            size={32}
                            className="mx-auto mb-3 text-gray-300"
                        />

                        <p className="text-sm text-gray-500">
                            Nuk ka takime të ardhshme.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {upcomingAppointments.map((appointment) => (
                            <div
                                key={appointment.id}
                                className="rounded-2xl bg-white p-6 shadow-sm"
                            >
                                <div className="flex flex-col gap-6 lg:flex-row">
                                    {/* Date */}
                                    <div className="flex shrink-0 items-center gap-4 lg:w-60 lg:border-r lg:border-gray-100">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3E9E0] text-[#6B4C3B]">
                                            <CalendarDays size={22} />
                                        </div>

                                        <div>
                                            <p className="text-sm font-semibold capitalize text-[#171310]">
                                                {formatDate(
                                                    new Date(appointment.scheduled_at)
                                                )}
                                            </p>

                                            <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                                                <Clock size={14} />
                                                {formatTime(
                                                    new Date(appointment.scheduled_at)
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Property */}
                                    <div className="flex-1">
                                        <p className="mb-1 text-xs uppercase tracking-wider text-gray-400">
                                            Prona
                                        </p>

                                        <Link
                                            href={`/properties/${appointment.property.slug}`}
                                            className="font-serif text-xl text-[#171310] hover:text-[#6B4C3B]"
                                        >
                                            {appointment.property.title}
                                        </Link>

                                        <p className="mt-2 flex items-center gap-1 text-sm text-gray-500">
                                            <MapPin size={14} />
                                            {appointment.property.location ||
                                                appointment.property.city ||
                                                'Pa lokacion'}
                                        </p>

                                        <p className="mt-2 font-semibold text-[#6B4C3B]">
                                            €{Number(appointment.property.price).toLocaleString()}
                                        </p>
                                    </div>

                                    {/* Client */}
                                    <div className="lg:w-60">
                                        <p className="mb-2 text-xs uppercase tracking-wider text-gray-400">
                                            Klienti
                                        </p>

                                        <p className="flex items-center gap-2 text-sm font-medium text-[#171310]">
                                            <User size={15} />
                                            {appointment.user.name || 'Pa emër'}
                                        </p>

                                        {appointment.user.email && (
                                            <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                                <Mail size={14} />
                                                {appointment.user.email}
                                            </p>
                                        )}

                                        {appointment.user.phone && (
                                            <p className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                                                <Phone size={14} />
                                                {appointment.user.phone}
                                            </p>
                                        )}
                                    </div>

                                    {/* Status */}
                                    <div className="flex items-start">
                                        <span
                                            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(
                                                appointment.status
                                            )}`}
                                        >
                                            {getStatusLabel(appointment.status)}
                                        </span>
                                    </div>
                                </div>

                                {appointment.notes && (
                                    <div className="mt-5 border-t border-gray-100 pt-4">
                                        <p className="text-xs uppercase tracking-wider text-gray-400">
                                            Shënime të klientit
                                        </p>

                                        <p className="mt-1 text-sm text-gray-600">
                                            {appointment.notes}
                                        </p>
                                    </div>
                                )}

                                {appointment.status.toUpperCase() === 'PENDING' && (
                                    <AppointmentActions appointmentId={appointment.id} />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Past */}
            {pastAppointments.length > 0 && (
                <section>
                    <h2 className="mb-5 font-serif text-2xl text-[#171310]">
                        Takimet e kaluara
                    </h2>

                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                        <div className="divide-y divide-gray-100">
                            {pastAppointments.map((appointment) => (
                                <div
                                    key={appointment.id}
                                    className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between"
                                >
                                    <div>
                                        <p className="font-medium text-[#171310]">
                                            {appointment.property.title}
                                        </p>

                                        <p className="mt-1 text-sm text-gray-500">
                                            {appointment.user.name || appointment.user.email}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <span className="text-sm text-gray-400">
                                            {formatDate(
                                                new Date(appointment.scheduled_at)
                                            )}
                                        </span>

                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(
                                                appointment.status
                                            )}`}
                                        >
                                            {getStatusLabel(appointment.status)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    )
}