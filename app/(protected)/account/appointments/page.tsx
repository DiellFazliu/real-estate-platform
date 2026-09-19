import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MapPin,
} from 'lucide-react'
import { CancelAppointmentButton } from '@/components/appointments/CancelAppointmentButton'

const STATUS_CONFIG = {
  PENDING: {
    label: 'Në pritje',
    icon: Clock,
    color: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  CONFIRMED: {
    label: 'Konfirmuar',
    icon: CheckCircle2,
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  REJECTED: {
    label: 'Refuzuar',
    icon: XCircle,
    color: 'bg-red-100 text-red-800 border-red-200',
  },
  CANCELLED: {
    label: 'Anuluar',
    icon: AlertCircle,
    color: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  COMPLETED: {
    label: 'Përfunduar',
    icon: CheckCircle2,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
} as const

export default async function AppointmentsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const appointments = await prisma.appointment.findMany({
    where: { user_id: parseInt(session.user.id) },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          slug: true,
          city: true,
          neighborhood: true,
          primary_image_url: true,
        },
      },
      agent: {
        select: { name: true, email: true, phone: true, image: true },
      },
    },
    orderBy: { scheduled_at: 'desc' },
  })

  return (
    <main className="min-h-screen bg-[#F7F3EE] pt-20">
      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">Takimet e mia</h1>
          <p className="mt-2 text-[#6B4C3B]/60">
            {appointments.length}{' '}
            {appointments.length === 1 ? 'takim' : 'takime'}
          </p>
        </div>

        {/* Empty state */}
        {appointments.length === 0 ? (
          <div className="rounded-2xl border border-[#E8DDD2] bg-white p-12 text-center shadow-sm">
            <CalendarDays className="mx-auto h-12 w-12 text-[#6B4C3B]/40" />
            <p className="mt-4 text-lg font-semibold text-black">
              Nuk ke takime
            </p>
            <p className="mt-1 text-sm text-[#6B4C3B]/60">
              Rezervo një vizitë për të parë një pronë.
            </p>
            <Link
              href="/properties"
              className="mt-6 inline-flex rounded-lg bg-[#6B4C3B] px-6 py-2.5 font-semibold text-white transition hover:bg-[#4A3328]"
            >
              Shfleto pronat
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((apt) => {
              const config =
                STATUS_CONFIG[apt.status as keyof typeof STATUS_CONFIG]
              const Icon = config.icon
              const isFuture = new Date(apt.scheduled_at) > new Date()
              const canCancel =
                isFuture &&
                (apt.status === 'PENDING' || apt.status === 'CONFIRMED')

              return (
                <article
                  key={apt.id}
                  className="rounded-2xl border border-[#E8DDD2] bg-white shadow-sm overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row">
                    {apt.property.primary_image_url && (
                      <div className="sm:w-48 h-40 sm:h-auto shrink-0">
                        <img
                          src={apt.property.primary_image_url}
                          alt={apt.property.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/properties/${apt.property.slug}`}
                            className="text-lg font-bold text-black hover:text-[#6B4C3B] transition line-clamp-1"
                          >
                            {apt.property.title}
                          </Link>
                          <p className="mt-1 flex items-center gap-1.5 text-sm text-[#6B4C3B]/60">
                            <MapPin size={14} />
                            {apt.property.neighborhood &&
                              `${apt.property.neighborhood}, `}
                            {apt.property.city}
                          </p>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold shrink-0 ${config.color}`}
                        >
                          <Icon size={12} />
                          {config.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B4C3B]">
                        <div className="flex items-center gap-1.5">
                          <CalendarDays size={15} />
                          <span className="font-medium">
                            {new Date(apt.scheduled_at).toLocaleDateString(
                              'sq-AL',
                              {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              }
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={15} />
                          <span className="font-medium">
                            {new Date(apt.scheduled_at).toLocaleTimeString(
                              'sq-AL',
                              {
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </span>
                        </div>
                      </div>

                      {apt.notes && (
                        <div className="mt-3 p-3 rounded-lg bg-[#F7F3EE] text-sm text-[#6B4C3B]/70">
                          "{apt.notes}"
                        </div>
                      )}

                      {canCancel && (
                        <div className="mt-4 pt-4 border-t border-[#E8DDD2]">
                          <CancelAppointmentButton appointmentId={apt.id} />
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}