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
  User,
  Phone,
  Mail,
} from 'lucide-react'
import { AppointmentDecisionButtons } from '@/components/owner/AppointmentDecisionButtons'

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

export default async function OwnerAppointmentsPage() {
  const session = await auth()

  if (!session?.user) redirect('/login')

  if (!['OWNER', 'ADMIN'].includes(session.user.role)) {
    redirect('/')
  }

  // ⭐ MERR AGJENTËT
  const agents = await prisma.user.findMany({
    where: { is_active: true, role: { name: 'AGENT' } },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  })

  const appointments = await prisma.appointment.findMany({
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
  })

  const pending = appointments.filter((a) => a.status === 'PENDING')
  const confirmed = appointments.filter((a) => a.status === 'CONFIRMED')
  const others = appointments.filter(
    (a) => !['PENDING', 'CONFIRMED'].includes(a.status)
  )

  return (
    <main className="min-h-screen bg-[#F7F3EE]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">
            Menaxhimi i Takimeve
          </h1>
          <p className="mt-2 text-[#6B4C3B]/60">
            {appointments.length}{' '}
            {appointments.length === 1 ? 'takim' : 'takime'} totale
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-medium text-amber-800">Në pritje</p>
            <p className="mt-2 text-3xl font-bold text-amber-900">
              {pending.length}
            </p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-sm font-medium text-emerald-800">Konfirmuar</p>
            <p className="mt-2 text-3xl font-bold text-emerald-900">
              {confirmed.length}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-sm font-medium text-gray-700">Të tjerë</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {others.length}
            </p>
          </div>
        </div>

        {/* Empty state */}
        {appointments.length === 0 ? (
          <div className="rounded-2xl border border-[#E8DDD2] bg-white p-12 text-center shadow-sm">
            <CalendarDays className="mx-auto h-12 w-12 text-[#6B4C3B]/40" />
            <p className="mt-4 text-lg font-semibold text-black">
              Nuk ka takime
            </p>
            <p className="mt-1 text-sm text-[#6B4C3B]/60">
              Takimet e reja do të shfaqen këtu.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* PENDING */}
            {pending.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-600" />
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

            {/* CONFIRMED */}
            {confirmed.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
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

            {/* OTHERS */}
            {others.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-black mb-4">
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
    </main>
  )
}

// ═══════════════════════════════════════════════════════════════
// CARD COMPONENT
// ═══════════════════════════════════════════════════════════════

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
    <article className="rounded-2xl border border-[#E8DDD2] bg-white shadow-sm overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        {/* Property Image */}
        {apt.property.primary_image_url && (
          <div className="lg:w-56 h-40 lg:h-auto shrink-0">
            <img
              src={apt.property.primary_image_url}
              alt={apt.property.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
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

          {/* Date & Time */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B4C3B] mb-4">
            <div className="flex items-center gap-1.5">
              <CalendarDays size={15} />
              <span className="font-medium">
                {new Date(apt.scheduled_at).toLocaleDateString('sq-AL', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={15} />
              <span className="font-medium">
                {new Date(apt.scheduled_at).toLocaleTimeString('sq-AL', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          {/* User Info */}
          <div className="grid gap-3 sm:grid-cols-2 p-4 rounded-xl bg-[#F7F3EE] mb-4">
            <div className="flex items-center gap-2 text-sm">
              <User size={15} className="text-[#6B4C3B]" />
              <span className="font-medium text-black">
                {apt.user.name || 'User'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail size={15} className="text-[#6B4C3B]" />
              <span className="text-black/60 truncate">{apt.user.email}</span>
            </div>
            {apt.user.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone size={15} className="text-[#6B4C3B]" />
                <span className="text-black/60">{apt.user.phone}</span>
              </div>
            )}
          </div>

          {/* Agent Info */}
          {apt.agent && (
            <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-xs text-blue-600 font-medium mb-1">
                Agjenti i caktuar
              </p>
              <p className="text-sm font-semibold text-blue-900">
                {apt.agent.name || apt.agent.email}
              </p>
            </div>
          )}

          {/* Notes */}
          {apt.notes && (
            <div className="p-3 rounded-lg bg-[#F7F3EE] text-sm text-[#6B4C3B]/70 mb-4">
              "{apt.notes}"
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="pt-4 border-t border-[#E8DDD2]">
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