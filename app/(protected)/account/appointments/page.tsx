// app/(protected)/account/appointments/page.tsx — "Takimet e mia" for the
// signed-in user. Lists their own appointments; each card handles status
// display and the cancel action.
//
// Auth is enforced by the layout; this page re-checks to fail fast.

import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CalendarDays } from 'lucide-react'

import { getUserAppointments } from '@/lib/db/queries/appointments'
import { UserAppointmentCard } from '@/components/appointments/UserAppointmentCard'

export default async function AppointmentsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const appointments = await getUserAppointments(Number(session.user.id))

  return (
    <main className="min-h-screen bg-[#F7F3EE] pt-20">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black">Takimet e mia</h1>

          <p className="mt-2 text-[#6B4C3B]/60">
            {appointments.length}{' '}
            {appointments.length === 1 ? 'takim' : 'takime'}
          </p>
        </div>

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
            {appointments.map((appointment) => (
              <UserAppointmentCard
                key={appointment.id}
                appointment={appointment}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}