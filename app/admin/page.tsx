import { Activity, FileCheck2, FileClock, LayoutDashboard, Users } from 'lucide-react'
import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export default async function AdminDashboardPage() {
  const session = await auth()

  if (!session?.user) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/')

  const [users, properties, pendingReviews, approvedListings, rejectedListings, unassignedProperties, roleCounts, recentActivity] = await Promise.all([
    prisma.user.count(),
    prisma.property.count(),
    prisma.property.count({ where: { review_status: 'PENDING_REVIEW' } }),
    prisma.property.count({ where: { review_status: 'APPROVED' } }),
    prisma.property.count({ where: { review_status: 'REJECTED' } }),
    prisma.property.count({ where: { primary_agent_id: null } }),
    prisma.user.groupBy({ by: ['role_id'], _count: { _all: true } }),
    prisma.auditLog.findMany({
      orderBy: { created_at: 'desc' },
      take: 6,
      select: { id: true, action: true, resource: true, created_at: true, user: { select: { name: true, email: true } } },
    }),
  ])

  const roles = await prisma.role.findMany({
    where: { id: { in: roleCounts.map((item) => item.role_id) } },
    select: { id: true, name: true },
  })
  const roleNames = new Map(roles.map((role) => [role.id, role.name]))
  const maxRoleCount = Math.max(1, ...roleCounts.map((item) => item._count._all))
  const otherListings = Math.max(0, properties - approvedListings - pendingReviews - rejectedListings)
  const statusTotal = Math.max(1, properties)
  const approvedEnd = (approvedListings / statusTotal) * 100
  const pendingEnd = approvedEnd + (pendingReviews / statusTotal) * 100
  const rejectedEnd = pendingEnd + (rejectedListings / statusTotal) * 100
  const statusChart = `conic-gradient(#15803d 0 ${approvedEnd}%, #f59e0b ${approvedEnd}% ${pendingEnd}%, #ef4444 ${pendingEnd}% ${rejectedEnd}%, #d8c4b3 ${rejectedEnd}% 100%)`

  const metrics = [
    {
      label: 'Total users',
      value: users,
      icon: Users,
      tone: 'border-sky-200 bg-sky-50 text-sky-800',
    },
    {
      label: 'Total properties',
      value: properties,
      icon: LayoutDashboard,
      tone: 'border-[#D8C4B3] bg-[#F3E9E0] text-[#6B4C3B]',
    },
    {
      label: 'Pending reviews',
      value: pendingReviews,
      icon: FileClock,
      tone: 'border-amber-200 bg-amber-50 text-amber-800',
    },
    {
      label: 'Approved listings',
      value: approvedListings,
      icon: FileCheck2,
      tone: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    },
  ]

  return (
    <main className="min-h-screen bg-[#F7F3EE]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="border-b border-[#E8DDD2] pb-8">
          <div className="flex items-center gap-2 text-sm font-medium text-[#6B4C3B]">
            <ShieldIcon />
            Admin workspace
          </div>
          <h1 className="mt-2 text-3xl font-bold text-black sm:text-4xl">System overview</h1>
          <p className="mt-2 max-w-2xl text-[#6B4C3B]/65">
            Manage platform-level operations, users and property moderation from one place.
          </p>
        </header>

        <section aria-label="System metrics" className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <div key={metric.label} className={`rounded-xl border p-5 shadow-sm ${metric.tone}`}>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-medium">{metric.label}</span>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-3xl font-bold">{metric.value}</p>
              </div>
            )
          })}
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-[#E8DDD2] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-black">Listing status</h2>
                <p className="mt-1 text-sm text-[#6B4C3B]/60">Current moderation distribution.</p>
              </div>
              <Activity className="h-5 w-5 text-[#6B4C3B]" />
            </div>
            <div className="mt-6 flex flex-col items-center gap-8 sm:flex-row sm:items-center">
              <div className="relative h-44 w-44 shrink-0 rounded-full" style={{ background: statusChart }}>
                <div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-white">
                  <span className="text-3xl font-bold text-black">{properties}</span>
                  <span className="text-xs text-[#6B4C3B]/60">properties</span>
                </div>
              </div>
              <div className="w-full space-y-3">
                {[
                  ['Approved', approvedListings, '#15803d'],
                  ['Pending review', pendingReviews, '#f59e0b'],
                  ['Rejected', rejectedListings, '#ef4444'],
                  ['Other', otherListings, '#d8c4b3'],
                ].map(([label, value, color]) => (
                  <div key={label as string} className="flex items-center justify-between gap-4 text-sm">
                    <span className="flex items-center gap-2 text-[#6B4C3B]/75"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color as string }} />{label}</span>
                    <span className="font-semibold text-black">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-[#E8DDD2] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-black">Users by role</h2>
            <p className="mt-1 text-sm text-[#6B4C3B]/60">Account distribution across the platform.</p>
            <div className="mt-6 space-y-4">
              {roleCounts.map((item) => (
                <div key={item.role_id}>
                  <div className="flex justify-between text-sm"><span className="text-[#6B4C3B]/75">{roleNames.get(item.role_id) || 'Unknown'}</span><span className="font-semibold text-black">{item._count._all}</span></div>
                  <div className="mt-2 h-2 rounded-full bg-[#F3E9E0]"><div className="h-2 rounded-full bg-[#6B4C3B]" style={{ width: `${(item._count._all / maxRoleCount) * 100}%` }} /></div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-xl border border-[#E8DDD2] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between"><div><h2 className="text-xl font-bold text-black">Recent activity</h2><p className="mt-1 text-sm text-[#6B4C3B]/60">Latest recorded platform actions.</p></div><a href="/admin/audit" className="text-sm font-semibold text-[#6B4C3B] hover:underline">View audit log</a></div>
            <div className="mt-5 divide-y divide-[#EEE5DC]">
              {recentActivity.length === 0 ? <p className="py-6 text-sm text-[#6B4C3B]/60">No activity recorded.</p> : recentActivity.map((entry) => <div key={entry.id} className="flex items-center justify-between gap-4 py-3"><div><p className="text-sm font-medium text-black">{entry.user?.name || entry.user?.email || 'System'} <span className="font-normal text-[#6B4C3B]/65">{entry.action} {entry.resource}</span></p><p className="mt-1 text-xs text-[#8B6B5A]">{entry.created_at.toLocaleString('en-GB')}</p></div></div>)}
            </div>
          </section>
          <section className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-950 shadow-sm">
            <h2 className="text-xl font-bold">Operational attention</h2>
            <p className="mt-2 text-sm text-amber-900/75">{unassignedProperties} {unassignedProperties === 1 ? 'property has' : 'properties have'} no assigned agent.</p>
            <a href="/admin/reviews" className="mt-5 inline-flex rounded-lg bg-[#6B4C3B] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4A3328]">Open review queue</a>
          </section>
        </div>
      </div>
    </main>
  )
}

function ShieldIcon() {
  return <span aria-hidden="true" className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#6B4C3B] text-[10px] text-white">A</span>
}
