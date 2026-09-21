import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export default async function AgentAppointmentsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'AGENT') redirect('/')

  const agentId = Number(session.user.id)
  if (!Number.isSafeInteger(agentId) || agentId <= 0) redirect('/login')

  const appointments = await prisma.appointment.findMany({
    where: { agent_id: agentId },
    include: {
      property: { select: { title: true, slug: true, city: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { scheduled_at: 'asc' },
  })

  return (
    <main className="min-h-screen bg-[#F7F3EE]">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-3xl font-bold text-black">Takimet e mia</h1>
        <p className="mt-2 text-[#6B4C3B]/65">Takimet që ju janë caktuar.</p>
        {appointments.length === 0 ? (
          <p className="mt-6 rounded-xl border border-[#E8DDD2] bg-white p-6 text-[#6B4C3B]/65">Nuk keni takime të caktuara.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {appointments.map((appointment) => (
              <article key={appointment.id} className="rounded-xl border border-[#E8DDD2] bg-white p-5 shadow-sm">
                <Link href={`/properties/${appointment.property.slug}`} className="font-semibold text-black hover:underline">{appointment.property.title}</Link>
                <p className="mt-1 text-sm text-[#6B4C3B]/65">{appointment.user.name || appointment.user.email} · {appointment.scheduled_at.toLocaleString('sq-AL')}</p>
                <p className="mt-2 text-sm font-medium text-[#6B4C3B]">{appointment.status}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
