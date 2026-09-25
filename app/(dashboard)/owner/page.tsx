import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowRight,
  CalendarDays,
  ClipboardCheck,
  FileCheck2,
  FileClock,
  FileX2,
  UserRound,
} from 'lucide-react'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('sq-AL', {
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
    (!session.user.permissions?.includes('properties:review') &&
      session.user.role !== 'ADMIN')
  ) {
    redirect('/')
  }

  const [
    pendingCount,
    approvedCount,
    rejectedCount,
    unassignedPending,
    pendingListings,
    pendingAppointmentsCount,
    confirmedAppointmentsCount,
  ] = await Promise.all([
    prisma.property.count({ where: { review_status: 'PENDING_REVIEW' } }),
    prisma.property.count({ where: { review_status: 'APPROVED' } }),
    prisma.property.count({ where: { review_status: 'REJECTED' } }),
    prisma.property.count({
      where: {
        review_status: 'PENDING_REVIEW',
        primary_agent_id: null,
      },
    }),
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
    prisma.appointment.count({ where: { status: 'PENDING' } }),
    prisma.appointment.count({ where: { status: 'CONFIRMED' } }),
  ])

  return (
    <div className="p-8 lg:p-10">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-[#6B4C3B]">
            Operacionet
          </p>
          <h1 className="font-serif text-4xl text-[#171310]">Përmbledhje</h1>
          <p className="mt-2 text-sm text-gray-500">
            Monitoro listimet dhe menaxho review-t e shitësve.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/owner/appointments"
            className="inline-flex items-center gap-2 rounded-xl border border-[#6B4C3B]/20 bg-white px-5 py-2.5 text-sm font-medium text-[#6B4C3B] transition hover:border-[#6B4C3B]/40"
          >
            <CalendarDays className="h-4 w-4" />
            Takimet
            {pendingAppointmentsCount > 0 && (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[#6B4C3B] px-1.5 py-0.5 text-[10px] font-bold text-white">
                {pendingAppointmentsCount}
              </span>
            )}
          </Link>
          <Link
            href="/owner/properties/pending"
            className="inline-flex items-center gap-2 rounded-xl bg-[#6B4C3B] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#4A3328]"
          >
            <ClipboardCheck className="h-4 w-4" />
            Radha e review
          </Link>
        </div>
      </div>

      {/* Metrics — neutral */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/owner/properties/pending"
          className="group rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Në pritje</p>
            <FileClock className="h-4 w-4 text-[#6B4C3B]/40 transition group-hover:text-[#6B4C3B]" />
          </div>
          <p
            className={`mt-3 font-serif text-3xl ${
              pendingCount > 0 ? 'text-amber-700' : 'text-[#171310]'
            }`}
          >
            {pendingCount}
          </p>
        </Link>

        <Link
          href="/owner/properties/pending?status=APPROVED"
          className="group rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Të aprovuara</p>
            <FileCheck2 className="h-4 w-4 text-[#6B4C3B]/40 transition group-hover:text-[#6B4C3B]" />
          </div>
          <p className="mt-3 font-serif text-3xl text-[#171310]">
            {approvedCount}
          </p>
        </Link>

        <Link
          href="/owner/properties/pending?status=REJECTED"
          className="group rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Të refuzuara</p>
            <FileX2 className="h-4 w-4 text-[#6B4C3B]/40 transition group-hover:text-[#6B4C3B]" />
          </div>
          <p className="mt-3 font-serif text-3xl text-[#171310]">
            {rejectedCount}
          </p>
        </Link>

        <Link
          href="/owner/properties/pending"
          className="group rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Pa agjent</p>
            <UserRound className="h-4 w-4 text-[#6B4C3B]/40 transition group-hover:text-[#6B4C3B]" />
          </div>
          <p
            className={`mt-3 font-serif text-3xl ${
              unassignedPending > 0 ? 'text-amber-700' : 'text-[#171310]'
            }`}
          >
            {unassignedPending}
          </p>
        </Link>
      </section>

      {/* Appointments */}
      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl text-[#171310]">Takimet</h2>
            <p className="mt-1 text-sm text-gray-500">
              Aprovo dhe cakto agjentë për takimet e reja.
            </p>
          </div>
          <Link
            href="/owner/appointments"
            className="text-sm font-medium text-[#6B4C3B] hover:underline"
          >
            Shiko të gjitha →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/owner/appointments"
            className="group rounded-2xl bg-[#F7F3EE] p-5 transition hover:bg-[#F3E9E0]"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Në pritje</p>
              <FileClock className="h-4 w-4 text-[#6B4C3B]/40 transition group-hover:text-[#6B4C3B]" />
            </div>
            <p
              className={`mt-3 font-serif text-3xl ${
                pendingAppointmentsCount > 0
                  ? 'text-amber-700'
                  : 'text-[#171310]'
              }`}
            >
              {pendingAppointmentsCount}
            </p>
          </Link>

          <Link
            href="/owner/appointments"
            className="group rounded-2xl bg-[#F7F3EE] p-5 transition hover:bg-[#F3E9E0]"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Konfirmuar</p>
              <CalendarDays className="h-4 w-4 text-[#6B4C3B]/40 transition group-hover:text-[#6B4C3B]" />
            </div>
            <p className="mt-3 font-serif text-3xl text-[#171310]">
              {confirmedAppointmentsCount}
            </p>
          </Link>
        </div>
      </section>

      {/* Review queue */}
      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-serif text-xl text-[#171310]">
              Radha e review
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Dorëzimet më të vjetra shfaqen të parat.
            </p>
          </div>
          <Link
            href="/owner/properties/pending"
            className="text-sm font-medium text-[#6B4C3B] hover:underline"
          >
            Shiko të gjitha →
          </Link>
        </div>

        {pendingListings.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-[#E8DDD2] bg-[#F7F3EE] px-5 py-10 text-center">
            <ClipboardCheck className="mx-auto h-7 w-7 text-[#6B4C3B]/40" />
            <p className="mt-3 text-sm font-medium text-[#171310]">
              Radha është bosh
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Dorëzimet e reja do të shfaqen këtu.
            </p>
          </div>
        ) : (
          <div className="mt-5 divide-y divide-[#EEE5DC]">
            {pendingListings.map((listing) => (
              <Link
                key={listing.id}
                href={`/owner/properties/${listing.id}/review?context=owner`}
                className="group flex items-center justify-between gap-4 py-4 transition"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[#171310] group-hover:text-[#6B4C3B]">
                    {listing.title}
                  </p>
                  <p className="mt-1 truncate text-xs text-gray-500">
                    {listing.listed_by?.name ||
                      listing.listed_by?.email ||
                      'Shitës i panjohur'}
                    {listing.city ? ` · ${listing.city}` : ''}
                  </p>
                  <p className="mt-1 truncate text-xs text-[#8B6B5A]">
                    Agjent:{' '}
                    {listing.primary_agent?.name ||
                      listing.primary_agent?.email ||
                      'Pa agjent'}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-medium text-[#171310]">
                    €{Number(listing.price).toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    {formatDate(listing.created_at)}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-[#6B4C3B]/40 transition group-hover:translate-x-0.5 group-hover:text-[#6B4C3B]" />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}