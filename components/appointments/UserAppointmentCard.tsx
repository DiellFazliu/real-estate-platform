// components/appointments/UserAppointmentCard.tsx — appointment card shown
// on /account/appointments. Renders date + time (24h format), the note the
// user left when booking, and the agent's reply note if present. Cancel
// button only appears for future appointments that are still PENDING or
// CONFIRMED.

import Link from 'next/link'
import { CalendarDays, Clock, MapPin } from 'lucide-react'

import { CancelAppointmentButton } from '@/components/appointments/CancelAppointmentButton'
import { PropertyImage } from '@/components/properties/PropertyImage'
import { FALLBACK_IMAGES } from '@/lib/properties/property-display'
import { STATUS_CONFIG } from '@/lib/appointments/status-config'

type Appointment = {
  id: number
  scheduled_at: Date
  status: string
  notes: string | null
  owner_notes: string | null

  property: {
    id: number
    title: string
    slug: string
    city: string | null
    neighborhood: string | null
    primary_image_url: string | null
  }

  agent: {
    name: string | null
    email: string | null
    phone: string | null
    image: string | null
  } | null
}

interface UserAppointmentCardProps {
  appointment: Appointment
}

// Force 24-hour output — the sq-AL locale otherwise renders AM/PM as
// "m.d." / "p.d." which looks wrong in the UI.
function formatTime(date: Date) {
  return new Intl.DateTimeFormat('sq-AL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('sq-AL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function UserAppointmentCard({
  appointment,
}: UserAppointmentCardProps) {
  const config =
    STATUS_CONFIG[appointment.status as keyof typeof STATUS_CONFIG]

  const Icon = config.icon

  const scheduledDate = new Date(appointment.scheduled_at)
  const isFuture = scheduledDate > new Date()

  const canCancel =
    isFuture &&
    (appointment.status === 'PENDING' ||
      appointment.status === 'CONFIRMED')

  return (
    <article className="overflow-hidden rounded-2xl border border-[#E8DDD2] bg-white shadow-sm">
      <div className="flex flex-col sm:flex-row">
        <div className="h-40 shrink-0 sm:h-auto sm:w-48">
          <PropertyImage
            src={
              appointment.property.primary_image_url || FALLBACK_IMAGES[0]
            }
            alt={appointment.property.title}
            className="h-full w-full object-cover"
            fallbackSrc={FALLBACK_IMAGES[0]}
          />
        </div>

        <div className="flex-1 p-5">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <Link
                href={`/properties/${appointment.property.slug}`}
                className="line-clamp-1 text-lg font-bold text-black transition hover:text-[#6B4C3B]"
              >
                {appointment.property.title}
              </Link>

              <p className="mt-1 flex items-center gap-1.5 text-sm text-[#6B4C3B]/60">
                <MapPin size={14} />

                {appointment.property.neighborhood &&
                  `${appointment.property.neighborhood}, `}

                {appointment.property.city}
              </p>
            </div>

            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${config.color}`}
            >
              <Icon size={12} />
              {config.label}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B4C3B]">
            <div className="flex items-center gap-1.5">
              <CalendarDays size={15} />
              <span className="font-medium">{formatDate(scheduledDate)}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock size={15} />
              <span className="font-medium">{formatTime(scheduledDate)}</span>
            </div>
          </div>

          {appointment.notes && (
            <div className="mt-3 rounded-lg bg-[#F7F3EE] p-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#6B4C3B]/50">
                Shënimi juaj
              </p>

              <p className="text-sm text-[#6B4C3B]/70">
                &ldquo;{appointment.notes}&rdquo;
              </p>
            </div>
          )}

          {appointment.owner_notes && (
            <div className="mt-3 rounded-lg border border-[#E8DDD2] bg-white p-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#6B4C3B]">
                Koment nga agjenti
              </p>

              <p className="text-sm text-gray-700">
                {appointment.owner_notes}
              </p>
            </div>
          )}

          {canCancel && (
            <div className="mt-4 border-t border-[#E8DDD2] pt-4">
              <CancelAppointmentButton appointmentId={appointment.id} />
            </div>
          )}
        </div>
      </div>
    </article>
  )
}