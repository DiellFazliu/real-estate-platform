import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  Phone,
  User,
  XCircle,
} from 'lucide-react'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { AppointmentDecisionButtons } from '@/components/owner/AppointmentDecisionButtons'

const STATUS_CONFIG = {
  PENDING: {
    label: 'Në pritje',
    icon: Clock,
    color: 'bg-amber-100 text-amber-800',
  },
  CONFIRMED: {
    label: 'Konfirmuar',
    icon: CheckCircle2,
    color: 'bg-emerald-100 text-emerald-800',
  },
  REJECTED: {
    label: 'Refuzuar',
    icon: XCircle,
    color: 'bg-red-100 text-red-800',
  },
  CANCELLED: {
    label: 'Anuluar',
    icon: XCircle,
    color: 'bg-gray-100 text-gray-700',
  },
  COMPLETED: {
    label: 'Përfunduar',
    icon: CheckCircle2,
    color: 'bg-blue-100 text-blue-800',
  },
} as const

export default async function OwnerAppointmentsPage() {
  const session = await auth()

  if (!session?.user) redirect('/login')

  const canManageAppointments =
    session.user.role === 'ADMIN' ||
    (session.user.role === 'OWNER' &&
      session.user.permissions?.includes('appointments:approve:all'))

  if (!canManageAppointments) redirect('/')

  const [agents, appointments] = await Promise.all([
    prisma.user.findMany({
      where: { is_active: true, role: { name: 'AGENT' } },
      select: { id: true, name: true, email: true },
      orderBy: { name: 'asc' },
    }),
    prisma.appointment.findMany({
      include: {
        user: {
          select: { name: true, email: true, phone: true, image: true },
        },
        property: {
          select: {
            id: true,
            title: true,
            slug: true,
            city: true,
            neighborhood: true,
            primary_image_url: true,
            primary_agent_id: true,
          },
        },
        agent: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: [{ status: 'asc' }, { scheduled_at: 'asc' }],
    }),
  ])

  const pending = appointments.filter((a) => a.status === 'PENDING')
  const confirmed = appointments.filter((a) => a.status === 'CONFIRMED')
  const others = appointments.filter(
    (a) => !['PENDING', 'CONFIRMED'].includes(a.status),
  )

  return (
    <div className="p-8 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-[#6B4C3B]">
          Orari
        </p>
        <h1 className="font-serif text-4xl text-[#171310]">Takimet</h1>
        <p className="mt-2 text-sm text-gray-500">
          {appointments.length}{' '}
          {appointments.length === 1 ? 'takim' : 'takime'} totale
        </p>
      </div>

      {/* Metrics */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Në pritje</p>
            <Clock className="h-4 w-4 text-[#6B4C3B]/40" />
          </div>
          <p
            className={`mt-3 font-serif text-3xl ${
              pending.length > 0 ? 'text-amber-700' : 'text-[#171310]'
            }`}
          >
            {pending.length}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Konfirmuar</p>
            <CheckCircle2 className="h-4 w-4 text-[#6B4C3B]/40" />
          </div>
          <p className="mt-3 font-serif text-3xl text-[#171310]">
            {confirmed.length}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Të tjerë</p>
            <CalendarDays className="h-4 w-4 text-[#6B4C3B]/40" />
          </div>
          <p className="mt-3 font-serif text-3xl text-[#171310]">
            {others.length}
          </p>
        </div>
      </section>

      {/* Empty */}
      {appointments.length === 0 ? (
        <section className="mt-6 rounded-2xl bg-white p-12 text-center shadow-sm">
          <CalendarDays className="mx-auto h-8 w-8 text-[#6B4C3B]/40" />
          <p className="mt-4 text-sm font-medium text-[#171310]">
            Nuk ka takime
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Takimet e reja do të shfaqen këtu.
          </p>
        </section>
      ) : (
        <div className="mt-6 space-y-8">
          {pending.length > 0 && (
            <section>
              <h2 className="mb-4 font-serif text-xl text-[#171310]">
                Në pritje ({pending.length})
              </h2>
              <div className="space-y-4">
                {pending.map((apt) => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    agents={agents}
                    showActions
                  />
                ))}
              </div>
            </section>
          )}

          {confirmed.length > 0 && (
            <section>
              <h2 className="mb-4 font-serif text-xl text-[#171310]">
                Konfirmuar ({confirmed.length})
              </h2>
              <div className="space-y-4">
                {confirmed.map((apt) => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    agents={agents}
                    showActions={false}
                  />
                ))}
              </div>
            </section>
          )}

          {others.length > 0 && (
            <section>
              <h2 className="mb-4 font-serif text-xl text-[#171310]">
                Historiku ({others.length})
              </h2>
              <div className="space-y-4 opacity-70">
                {others.map((apt) => (
                  <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    agents={agents}
                    showActions={false}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function AppointmentCard({
  appointment: apt,
  agents,
  showActions,
}: {
  appointment: any
  agents: any[]
  showActions: boolean
}) {
  const config = STATUS_CONFIG[apt.status as keyof typeof STATUS_CONFIG]
  const Icon = config.icon

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="flex flex-col lg:flex-row">
        {apt.property.primary_image_url && (
          <div className="h-40 shrink-0 lg:h-auto lg:w-56">
            <img
              src={apt.property.primary_image_url}
              alt={apt.property.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="flex-1 p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <Link
                href={`/properties/${apt.property.slug}`}
                className="line-clamp-1 font-serif text-lg text-[#171310] hover:text-[#6B4C3B]"
              >
                {apt.property.title}
              </Link>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                <MapPin size={12} />
                {apt.property.neighborhood && `${apt.property.neighborhood}, `}
                {apt.property.city}
              </p>
            </div>

            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${config.color}`}
            >
              <Icon size={12} />
              {config.label}
            </span>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <CalendarDays size={14} className="text-[#6B4C3B]" />
              <span>
                {new Date(apt.scheduled_at).toLocaleDateString('sq-AL', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-[#6B4C3B]" />
              <span>
                {new Date(apt.scheduled_at).toLocaleTimeString('sq-AL', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          <div className="mb-4 grid gap-3 rounded-xl bg-[#F7F3EE] p-4 sm:grid-cols-2">
            <div className="flex items-center gap-2 text-sm">
              <User size={14} className="text-[#6B4C3B]" />
              <span className="font-medium text-[#171310]">
                {apt.user.name || 'User'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail size={14} className="text-[#6B4C3B]" />
              <span className="truncate text-gray-500">{apt.user.email}</span>
            </div>
            {apt.user.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone size={14} className="text-[#6B4C3B]" />
                <span className="text-gray-500">{apt.user.phone}</span>
              </div>
            )}
          </div>

          {apt.agent && (
            <div className="mb-4 rounded-xl bg-[#F3E9E0] px-4 py-3">
              <p className="text-[10px] font-medium uppercase tracking-widest text-[#6B4C3B]">
                Agjenti i caktuar
              </p>
              <p className="mt-1 text-sm font-medium text-[#171310]">
                {apt.agent.name || apt.agent.email}
              </p>
            </div>
          )}

          {apt.notes && (
            <div className="mb-4 rounded-xl bg-[#F7F3EE] px-4 py-3 text-sm text-gray-600">
              &ldquo;{apt.notes}&rdquo;
            </div>
          )}

          {showActions && (
            <div className="border-t border-[#EEE5DC] pt-4">
              <AppointmentDecisionButtons
                appointmentId={apt.id}
                agents={agents}
                currentAgentId={apt.agent?.id}
              />
            </div>
          )}
        </div>
      </div>
    </article>
  )
}