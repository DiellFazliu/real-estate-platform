import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Edit3,
  Plus,
  Trash2,
  XCircle,
} from 'lucide-react'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { ListingStatusActions } from '@/components/owner/ListingStatusActions'

const REVIEW_CONFIG = {
  PENDING_REVIEW: {
    label: 'Në pritje',
    icon: Clock,
    tone: 'bg-amber-100 text-amber-800',
    note: 'Review-i zgjat zakonisht deri në 48 orë.',
  },
  APPROVED: {
    label: 'E aprovuar',
    icon: CheckCircle2,
    tone: 'bg-emerald-100 text-emerald-800',
    note: 'Listimi është publik. Çdo editim kërkon review të ri.',
  },
  REJECTED: {
    label: 'E refuzuar',
    icon: XCircle,
    tone: 'bg-red-100 text-red-800',
    note: 'Rregullo arsyen e refuzimit dhe ridërgoje për review.',
  },
} as const

const LIFECYCLE_CONFIG = {
  PUBLISHED: {
    label: 'Aktive',
    tone: 'bg-emerald-100 text-emerald-800',
  },
  SOLD: {
    label: 'Shitur',
    tone: 'bg-[#6B4C3B] text-white',
  },
  UNAVAILABLE: {
    label: 'E tërhequr',
    tone: 'bg-gray-200 text-gray-700',
  },
  DRAFT: {
    label: 'Draft',
    tone: 'bg-gray-100 text-gray-600',
  },
} as const

export default async function MyListingsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=/account/listings')

  const listings = await prisma.property.findMany({
    where: { listed_by_id: parseInt(session.user.id) },
    orderBy: { created_at: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      neighborhood: true,
      city: true,
      bedrooms: true,
      bathrooms: true,
      area: true,
      review_status: true,
      status: true,
      rejection_reason: true,
      created_at: true,
      reviewed_at: true,
    },
  })

  return (
    <div className="min-h-screen bg-[#F7F3EE] pt-20">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-[#6B4C3B]">
              Listimet
            </p>
            <h1 className="font-serif text-4xl text-[#171310]">
              Listimet e Mia
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              {listings.length}{' '}
              {listings.length === 1 ? 'listim' : 'listime'} totale
            </p>
          </div>

          <Link
            href="/sell"
            className="inline-flex items-center gap-2 rounded-xl bg-[#6B4C3B] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#4A3328]"
          >
            <Plus className="h-4 w-4" />
            Shto Pronë të Re
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="rounded-2xl bg-white p-16 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3E9E0] text-[#6B4C3B]">
              <Plus className="h-6 w-6" />
            </div>
            <h2 className="mt-5 font-serif text-2xl text-[#171310]">
              Nuk ke listime ende
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Fillo duke shtuar pronën e parë.
            </p>
            <Link
              href="/sell"
              className="mt-6 inline-flex rounded-xl bg-[#6B4C3B] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#4A3328]"
            >
              Shto Pronë
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {listings.map((listing) => {
              const reviewConfig =
                REVIEW_CONFIG[
                  listing.review_status as keyof typeof REVIEW_CONFIG
                ] ?? REVIEW_CONFIG.PENDING_REVIEW

              const lifecycleConfig =
                LIFECYCLE_CONFIG[
                  listing.status as keyof typeof LIFECYCLE_CONFIG
                ] ?? LIFECYCLE_CONFIG.PUBLISHED

              const ReviewIcon = reviewConfig.icon

              const isPending = listing.review_status === 'PENDING_REVIEW'
              const isRejected = listing.review_status === 'REJECTED'
              const isApproved = listing.review_status === 'APPROVED'
              const isSold = listing.status === 'SOLD'
              const isUnavailable = listing.status === 'UNAVAILABLE'

              const canEdit =
                !isPending && !isSold && !isUnavailable && isApproved
              const canResubmit = isRejected

              return (
                <article
                  key={listing.id}
                  className={`overflow-hidden rounded-2xl bg-white shadow-sm ${
                    isUnavailable ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex flex-col gap-5 p-6 lg:flex-row lg:items-start">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h2 className="font-serif text-xl text-[#171310]">
                          {listing.title}
                        </h2>

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${reviewConfig.tone}`}
                        >
                          <ReviewIcon className="h-3 w-3" />
                          {reviewConfig.label}
                        </span>

                        {isApproved && (
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${lifecycleConfig.tone}`}
                          >
                            {lifecycleConfig.label}
                          </span>
                        )}
                      </div>

                      <p className="text-lg font-semibold text-[#6B4C3B]">
                        €{Number(listing.price).toLocaleString()}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                        {listing.neighborhood && (
                          <span>{listing.neighborhood}</span>
                        )}
                        {listing.city && <span>{listing.city}</span>}
                        {listing.bedrooms != null && (
                          <span>{listing.bedrooms} dhoma</span>
                        )}
                        {listing.bathrooms != null && (
                          <span>{listing.bathrooms} banjo</span>
                        )}
                        {listing.area != null && (
                          <span>{listing.area} m²</span>
                        )}
                      </div>

                      {isRejected && listing.rejection_reason && (
                        <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-700" />
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-red-700">
                              Arsyeja e refuzimit
                            </p>
                            <p className="mt-1 text-sm text-red-900">
                              {listing.rejection_reason}
                            </p>
                          </div>
                        </div>
                      )}

                      {isUnavailable && (
                        <div className="mt-4 flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                          <Trash2 className="mt-0.5 h-4 w-4 shrink-0 text-gray-600" />
                          <p className="text-sm text-gray-700">
                            Kjo pronë është tërhequr dhe nuk shfaqet në
                            platformë. Mund ta rikthesh kur të duash.
                          </p>
                        </div>
                      )}

                      <p className="mt-3 text-xs text-gray-400">
                        {reviewConfig.note}
                        {isApproved &&
                          !isSold &&
                          !isUnavailable &&
                          ' Edito vetëm nëse ke nevojë për ndryshime të mëdha.'}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 lg:w-52">
                      {canResubmit && (
                        <Link
                          href={`/account/listings/${listing.id}/edit`}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-800"
                        >
                          <Edit3 className="h-4 w-4" />
                          Rregullo dhe ridërgo
                        </Link>
                      )}

                      {canEdit && (
                        <Link
                          href={`/account/listings/${listing.id}/edit`}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6B4C3B] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#4A3328]"
                        >
                          <Edit3 className="h-4 w-4" />
                          Ndrysho
                        </Link>
                      )}

                      <Link
                        href={`/properties/${listing.slug}`}
                        className="inline-flex items-center justify-center rounded-xl border border-[#E8DDD2] bg-white px-4 py-2.5 text-sm font-medium text-[#6B4C3B] transition hover:bg-[#F7F3EE]"
                      >
                        Shiko faqen
                      </Link>

                      {/* ⭐ Veprimet për statusin e pronës */}
                      {isApproved && (isSold || isUnavailable) && (
                        <ListingStatusActions
                          propertyId={listing.id}
                          propertyTitle={listing.title}
                          status={listing.status as 'SOLD' | 'UNAVAILABLE'}
                          action="restore"
                        />
                      )}

                      {isApproved && !isSold && !isUnavailable && (
                        <ListingStatusActions
                          propertyId={listing.id}
                          propertyTitle={listing.title}
                          status="PUBLISHED"
                          action="mark"
                        />
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}