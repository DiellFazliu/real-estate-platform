import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export default async function AgentPropertiesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (session.user.role !== 'AGENT') redirect('/')

  const agentId = Number(session.user.id)
  if (!Number.isSafeInteger(agentId) || agentId <= 0) redirect('/login')

  const assignments = await prisma.propertyAgent.findMany({
    where: { agent_id: agentId, status: 'ACTIVE' },
    include: {
      property: {
        select: { id: true, title: true, slug: true, city: true, review_status: true, status: true },
      },
    },
    orderBy: { assigned_at: 'desc' },
  })

  return (
    <main className="min-h-screen bg-[#F7F3EE]">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-3xl font-bold text-black">Pronat e mia</h1>
        <p className="mt-2 text-[#6B4C3B]/65">Pronat aktive të caktuara për ju.</p>
        {assignments.length === 0 ? (
          <p className="mt-6 rounded-xl border border-[#E8DDD2] bg-white p-6 text-[#6B4C3B]/65">Nuk keni prona të caktuara.</p>
        ) : (
          <div className="mt-6 space-y-3">
            {assignments.map(({ property }) => (
              <Link key={property.id} href={`/properties/${property.slug}`} className="block rounded-xl border border-[#E8DDD2] bg-white p-5 shadow-sm transition hover:bg-[#F3E9E0]">
                <p className="font-semibold text-black">{property.title}</p>
                <p className="mt-1 text-sm text-[#6B4C3B]/65">{property.city || 'Lokacion i paspecifikuar'} · {property.status}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
