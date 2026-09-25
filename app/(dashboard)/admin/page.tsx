import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Activity,
  ArrowRight,
  FileCheck2,
  FileClock,
  FileX2,
  ShieldCheck,
  Users,
} from 'lucide-react'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export default async function AdminDashboardPage() {
  const session = await auth()

  if (!session?.user) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/')

  const [
    users,
    properties,
    pendingReviews,
    approvedListings,
    rejectedListings,
    unassignedPending,
    roleCounts,
    recentActivity,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.property.count(),
    prisma.property.count({ where: { review_status: 'PENDING_REVIEW' } }),
    prisma.property.count({ where: { review_status: 'APPROVED' } }),
    prisma.property.count({ where: { review_status: 'REJECTED' } }),
    prisma.property.count({
      where: {
        primary_agent_id: null,
        review_status: 'PENDING_REVIEW',
      },
    }),
    prisma.user.groupBy({
      by: ['role_id'],
      _count: { _all: true },
    }),
    prisma.auditLog.findMany({
      orderBy: { created_at: 'desc' },
      take: 6,
      select: {
        id: true,
        action: true,
        resource: true,
        created_at: true,
        user: { select: { name: true, email: true } },
      },
    }),
  ])

  const roles = await prisma.role.findMany({
    where: { id: { in: roleCounts.map((item) => item.role_id) } },
    select: { id: true, name: true },
  })
  const roleNames = new Map(roles.map((role) => [role.id, role.name]))
  const maxRoleCount = Math.max(
    1,
    ...roleCounts.map((item) => item._count._all),
  )

  const otherListings = Math.max(
    0,
    properties - approvedListings - pendingReviews - rejectedListings,
  )
  const statusTotal = Math.max(1, properties)
  const approvedEnd = (approvedListings / statusTotal) * 100
  const pendingEnd = approvedEnd + (pendingReviews / statusTotal) * 100
  const rejectedEnd = pendingEnd + (rejectedListings / statusTotal) * 100
  const statusChart = `conic-gradient(#15803d 0 ${approvedEnd}%, #f59e0b ${approvedEnd}% ${pendingEnd}%, #ef4444 ${pendingEnd}% ${rejectedEnd}%, #d8c4b3 ${rejectedEnd}% 100%)`

  return (
    <div className="p-8 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <p className="mb-2 flex items-center gap-2 text-sm font-medium uppercase tracking-widest text-[#6B4C3B]">
          <ShieldCheck className="h-4 w-4" />
          Platforma
        </p>
        <h1 className="font-serif text-4xl text-[#171310]">Përmbledhje</h1>
        <p className="mt-2 text-sm text-gray-500">
          Menaxho përdoruesit dhe moderimin e pronave nga një vend.
        </p>
      </div>

      {/* Metrics — neutral, no rainbow */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/admin/users"
          className="group rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Përdorues</p>
            <Users className="h-4 w-4 text-[#6B4C3B]/40 transition group-hover:text-[#6B4C3B]" />
          </div>
          <p className="mt-3 font-serif text-3xl text-[#171310]">{users}</p>
        </Link>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Prona totale</p>
            <Activity className="h-4 w-4 text-[#6B4C3B]/40" />
          </div>
          <p className="mt-3 font-serif text-3xl text-[#171310]">
            {properties}
          </p>
        </div>

        <Link
          href="/admin/reviews"
          className="group rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Reviews në pritje</p>
            <FileClock className="h-4 w-4 text-[#6B4C3B]/40 transition group-hover:text-[#6B4C3B]" />
          </div>
          <p
            className={`mt-3 font-serif text-3xl ${
              pendingReviews > 0 ? 'text-amber-700' : 'text-[#171310]'
            }`}
          >
            {pendingReviews}
          </p>
        </Link>

        <Link
          href="/admin/reviews?status=APPROVED"
          className="group rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Të aprovuara</p>
            <FileCheck2 className="h-4 w-4 text-[#6B4C3B]/40 transition group-hover:text-[#6B4C3B]" />
          </div>
          <p className="mt-3 font-serif text-3xl text-[#171310]">
            {approvedListings}
          </p>
        </Link>
      </section>

      {/* Status + Roles */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-serif text-xl text-[#171310]">
                Statusi i listimeve
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Shpërndarja aktuale e moderimit.
              </p>
            </div>
            <Activity className="h-5 w-5 text-[#6B4C3B]" />
          </div>

          <div className="mt-6 flex flex-col items-center gap-8 sm:flex-row">
            <div
              className="relative h-40 w-40 shrink-0 rounded-full"
              style={{ background: statusChart }}
            >
              <div className="absolute inset-4 flex flex-col items-center justify-center rounded-full bg-white">
                <span className="font-serif text-3xl text-[#171310]">
                  {properties}
                </span>
                <span className="text-xs text-gray-500">prona</span>
              </div>
            </div>

            <div className="w-full space-y-3">
              {[
                ['Aprovuar', approvedListings, '#15803d'],
                ['Në pritje', pendingReviews, '#f59e0b'],
                ['Refuzuar', rejectedListings, '#ef4444'],
                ['Të tjera', otherListings, '#d8c4b3'],
              ].map(([label, value, color]) => (
                <div
                  key={label as string}
                  className="flex items-center justify-between gap-4 text-sm"
                >
                  <span className="flex items-center gap-2 text-gray-600">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: color as string }}
                    />
                    {label}
                  </span>
                  <span className="font-medium text-[#171310]">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl text-[#171310]">
            Përdorues sipas rolit
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Shpërndarja e llogarive në platformë.
          </p>

          <div className="mt-6 space-y-4">
            {roleCounts.map((item) => (
              <div key={item.role_id}>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {roleNames.get(item.role_id) || 'I panjohur'}
                  </span>
                  <span className="font-medium text-[#171310]">
                    {item._count._all}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F3E9E0]">
                  <div
                    className="h-full rounded-full bg-[#6B4C3B]"
                    style={{
                      width: `${(item._count._all / maxRoleCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Activity + Attention */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_0.5fr]">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl text-[#171310]">
                Aktivitete të fundit
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Veprimet e fundit të regjistruara.
              </p>
            </div>
            <Link
              href="/admin/audit"
              className="text-sm font-medium text-[#6B4C3B] hover:underline"
            >
              Shiko të gjitha →
            </Link>
          </div>

          <div className="mt-5 divide-y divide-[#EEE5DC]">
            {recentActivity.length === 0 ? (
              <p className="py-6 text-sm text-gray-500">
                Nuk ka aktivitet të regjistruar.
              </p>
            ) : (
              recentActivity.map((entry) => (
                <div key={entry.id} className="py-3">
                  <p className="text-sm text-[#171310]">
                    <span className="font-medium">
                      {entry.user?.name || entry.user?.email || 'Sistemi'}
                    </span>{' '}
                    <span className="text-gray-500">
                      {entry.action} {entry.resource}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-[#8B6B5A]">
                    {entry.created_at.toLocaleString('sq-AL')}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-serif text-xl text-[#171310]">
            Vëmendje operative
          </h2>

          {unassignedPending === 0 ? (
            <p className="mt-3 text-sm text-gray-500">
              Të gjitha reviews në pritje kanë agjent të caktuar.
            </p>
          ) : (
            <>
              <p className="mt-3 font-serif text-3xl text-amber-700">
                {unassignedPending}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {unassignedPending === 1
                  ? 'review në pritje pa agjent'
                  : 'reviews në pritje pa agjent'}
              </p>
            </>
          )}

          <Link
            href="/admin/reviews"
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#6B4C3B] hover:underline"
          >
            Hap radhën e review
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </div>
  )
}