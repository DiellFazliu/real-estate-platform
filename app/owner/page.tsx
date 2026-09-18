import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ClipboardCheck,
  FileCheck2,
  FileClock,
  FileX2,
  Gauge,
  LayoutDashboard,
  Timer,
  UserRound,
} from 'lucide-react'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export default async function OwnerDashboardPage() {
  const session = await auth()

  if (!session?.user) redirect('/login')
  if (
    !['OWNER', 'ADMIN'].includes(session.user.role) ||
    (!session.user.permissions?.includes('properties:review') && session.user.role !== 'ADMIN')
  ) {
    redirect('/')
  }

  const [
    pendingCount,
    approvedCount,
    rejectedCount,
    totalListings,
    unassignedCount,
    pendingListings,
    pendingAgeRows,
  ] = await Promise.all([
    prisma.property.count({ where: { review_status: 'PENDING_REVIEW' } }),
    prisma.property.count({ where: { review_status: 'APPROVED' } }),
    prisma.property.count({ where: { review_status: 'REJECTED' } }),
    prisma.property.count(),
    prisma.property.count({ where: { primary_agent_id: null } }),
    prisma.property.findMany({
      where: { review_status: 'PENDING_REVIEW' },
      select: {
        id: true,
        title: true,
        city: true,
        price: true,
        created_at: true,
        listed_by: { select: { name: true, email: true } },
        primary_agent: { select: { name: true, email: true } },
      },
      orderBy: { created_at: 'asc' },
      take: 5,
    }),
    prisma.property.findMany({
      where: { review_status: 'PENDING_REVIEW' },
      select: { title: true, created_at: true },
      orderBy: { created_at: 'asc' },
    }),
  ])

  const now = Date.now()
  const averageReviewAgeHours = pendingAgeRows.length === 0
    ? 0
    : pendingAgeRows.reduce((total, property) => total + (now - property.created_at.getTime()) / 3_600_000, 0) / pendingAgeRows.length
  const oldestPending = pendingAgeRows[0]
  const oldestAgeHours = oldestPending ? (now - oldestPending.created_at.getTime()) / 3_600_000 : 0
  const sla = oldestAgeHours > 48
    ? { label: 'SLA at risk', tone: 'border-red-200 bg-red-50 text-red-800' }
    : oldestAgeHours > 24
      ? { label: 'Needs attention', tone: 'border-amber-200 bg-amber-50 text-amber-800' }
      : { label: 'Within SLA', tone: 'border-emerald-200 bg-emerald-50 text-emerald-800' }

  function formatAge(hours: number) {
    if (hours < 1) return 'Less than 1h'
    if (hours < 24) return `${Math.round(hours)}h`
    return `${Math.floor(hours / 24)}d ${Math.round(hours % 24)}h`
  }

  const metrics = [
    {
      label: 'Pending review',
      value: pendingCount,
      icon: FileClock,
      tone: 'border-amber-200 bg-amber-50 text-amber-800',
      href: '/owner/properties/pending',
    },
    {
      label: 'Approved listings',
      value: approvedCount,
      icon: FileCheck2,
      tone: 'border-emerald-200 bg-emerald-50 text-emerald-800',
      href: '/owner/properties/pending?status=approved',
    },
    {
      label: 'Rejected listings',
      value: rejectedCount,
      icon: FileX2,
      tone: 'border-red-200 bg-red-50 text-red-800',
      href: '/owner/properties/pending?status=rejected',
    },
    {
      label: 'Unassigned properties',
      value: unassignedCount,
      icon: UserRound,
      tone: 'border-sky-200 bg-sky-50 text-sky-800',
      href: '/owner/properties/pending',
    },
  ]

  return (
    <main className="min-h-screen bg-[#F7F3EE]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col justify-between gap-5 border-b border-[#E8DDD2] pb-8 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-[#6B4C3B]">
              <LayoutDashboard className="h-4 w-4" />
              Owner workspace
            </div>
            <h1 className="mt-2 text-3xl font-bold text-black sm:text-4xl">Operations dashboard</h1>
            <p className="mt-2 max-w-2xl text-[#6B4C3B]/65">
              Monitor listings, review seller submissions and keep the marketplace moving.
            </p>
          </div>
          <Link
            href="/owner/properties/pending"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#6B4C3B] px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-[#4A3328]"
          >
            <ClipboardCheck className="h-4 w-4" />
            Open review queue
          </Link>
        </header>

        <section aria-label="Listing metrics" className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <Link
                key={metric.label}
                href={metric.href}
                className={`rounded-xl border p-5 transition hover:-translate-y-0.5 hover:shadow-sm ${metric.tone}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-sm font-medium">{metric.label}</span>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-3xl font-bold">{metric.value}</p>
              </Link>
            )
          })}
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_1fr]">
          <section className="rounded-xl border border-[#E8DDD2] bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-black">Review queue</h2>
                <p className="mt-1 text-sm text-[#6B4C3B]/60">Oldest submissions are shown first.</p>
              </div>
              <Link href="/owner/properties/pending" className="text-sm font-semibold text-[#6B4C3B] hover:underline">
                View all
              </Link>
            </div>

            {pendingListings.length === 0 ? (
              <div className="mt-8 rounded-lg border border-dashed border-[#E8DDD2] bg-[#F7F3EE] px-5 py-10 text-center">
                <ClipboardCheck className="mx-auto h-8 w-8 text-emerald-700" />
                <p className="mt-3 font-semibold text-black">The queue is clear</p>
                <p className="mt-1 text-sm text-[#6B4C3B]/60">New seller submissions will appear here.</p>
              </div>
            ) : (
              <div className="mt-5 divide-y divide-[#EEE5DC]">
                {pendingListings.map((listing) => (
                  <Link
                    key={listing.id}
                    href={`/owner/properties/${listing.id}/review`}
                    className="flex items-center justify-between gap-4 rounded-lg px-2 py-4 first:pt-0 last:pb-0 hover:bg-[#F7F3EE]"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-black">{listing.title}</p>
                      <p className="mt-1 truncate text-sm text-[#6B4C3B]/60">
                        {listing.listed_by?.name || listing.listed_by?.email || 'Unknown seller'}
                        {listing.city ? ` · ${listing.city}` : ''}
                      </p>
                      <p className="mt-1 truncate text-xs text-[#8B6B5A]">
                        Agent: {listing.primary_agent?.name || listing.primary_agent?.email || 'Unassigned'}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-semibold text-[#6B4C3B]">€{Number(listing.price).toLocaleString()}</p>
                      <p className="mt-1 text-xs text-[#6B4C3B]/45">{formatDate(listing.created_at)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-xl border border-[#D8C4B3] bg-[#F3E9E0] p-6 text-[#6B4C3B] shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Queue health</h2>
                <p className="mt-1 text-sm text-[#6B4C3B]/70">Review workload against the 48-hour target.</p>
              </div>
              <Gauge className="h-5 w-5" />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-[#D8C4B3] bg-white/70 p-3">
                <Timer className="h-4 w-4" />
                <p className="mt-3 text-xs text-[#6B4C3B]/60">Average age</p>
                <p className="mt-1 text-lg font-bold">{formatAge(averageReviewAgeHours)}</p>
              </div>
              <div className="rounded-lg border border-[#D8C4B3] bg-white/70 p-3">
                <p className="text-xs text-[#6B4C3B]/60">Oldest listing</p>
                <p className="mt-1 text-lg font-bold">{formatAge(oldestAgeHours)}</p>
                <p className="mt-1 truncate text-xs text-[#6B4C3B]/60">{oldestPending?.title || 'Queue is clear'}</p>
              </div>
            </div>
            <div className={`mt-4 rounded-lg border px-3 py-2 text-sm font-semibold ${sla.tone}`}>
              {sla.label}
            </div>
          </section>
        </div>

        <p className="mt-6 text-right text-xs text-[#6B4C3B]/55">{totalListings} listings tracked in the marketplace</p>
      </div>
    </main>
  )
}
