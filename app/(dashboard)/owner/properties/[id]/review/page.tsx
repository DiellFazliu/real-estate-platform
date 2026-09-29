// app/(dashboard)/owner/properties/[id]/review/page.tsx — review detail page.
//
// Renders one property for the owner/admin to approve or reject. Which
// section is shown depends on the property's review_status:
//   • PENDING_REVIEW → ReviewDecisionForm
//   • APPROVED       → success card with reviewer + assigned agent
//   • REJECTED       → card with the rejection reason

import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  UserCheck,
  XCircle,
} from 'lucide-react'

import { ReviewDecisionForm } from '@/components/owner/ReviewDecisionForm'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { client } from '@/lib/sanity/client'
import {
  canReviewProperties,
  getReviewBasePath,
  normalizeReviewContext,
} from '@/lib/reviews/context'

type PageProps = {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ context?: string }>
}

type SanityPropertyDetails = {
  description?: string
  listingType?: string
  images?: string[]
}

function formatLabel(value?: string | null) {
  return value
    ? value
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase())
    : 'Nuk është deklaruar'
}

// 24h time — the sq-AL locale otherwise renders AM/PM as m.d. / p.d.
function formatDate(date: Date) {
  return new Intl.DateTimeFormat('sq-AL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

export default async function PropertyReviewPage({
  params,
  searchParams,
}: PageProps) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (!canReviewProperties(session)) redirect('/')

  const { id } = await params
  const rawContext = searchParams ? (await searchParams).context : undefined
  const context = normalizeReviewContext(rawContext)
  const basePath = getReviewBasePath(context)

  const propertyId = Number(id)
  if (!Number.isSafeInteger(propertyId) || propertyId <= 0) notFound()

  const property = await prisma.property.findFirst({
    where: { id: propertyId },
    select: {
      id: true,
      sanity_id: true,
      title: true,
      slug: true,
      price: true,
      location: true,
      city: true,
      property_type: true,
      bedrooms: true,
      bathrooms: true,
      area: true,
      review_status: true,
      rejection_reason: true,
      reviewed_at: true,
      published_at: true,
      listed_by: { select: { name: true, email: true } },
      primary_agent: { select: { id: true, name: true, email: true } },
      reviewed_by: { select: { name: true, email: true } },
    },
  })

  if (!property) notFound()

  const agents = await prisma.user.findMany({
    where: { is_active: true, role: { name: 'AGENT' } },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  })

  // Sanity is optional — a failure shouldn't block the review page.
  let details: SanityPropertyDetails | null = null
  try {
    details = await client.fetch(
      `*[_type == "property" && _id == $id][0] {
        description,
        listingType,
        "images": images[].asset->url
      }`,
      { id: property.sanity_id },
    )
  } catch (error) {
    console.error('Unable to load property review details:', error)
  }

  const location = [property.location, property.city]
    .filter(Boolean)
    .join(', ')

  const isPending = property.review_status === 'PENDING_REVIEW'
  const isApproved = property.review_status === 'APPROVED'

  return (
    <div className="p-8 lg:p-10">
      <Link
        href={basePath}
        className="inline-flex items-center gap-2 text-sm font-medium text-[#6B4C3B] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Kthehu te radha
      </Link>

      {/* Header */}
      <div className="mb-8 mt-6">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-[#6B4C3B]">
          Review
        </p>
        <h1 className="font-serif text-4xl text-[#171310]">
          {property.title}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          €{Number(property.price).toLocaleString()} ·{' '}
          {location || 'Pa lokacion'}
        </p>
      </div>

      <div className="mx-auto max-w-5xl space-y-6">
        {/* Property card */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {details?.images && details.images.length > 0 && (
            <div className="flex gap-3 overflow-x-auto bg-[#F3E9E0] p-4">
              {details.images.map((image, index) => (
                <img
                  key={`${image}-${index}`}
                  src={image}
                  alt={`${property.title} ${index + 1}`}
                  className="h-52 w-72 shrink-0 rounded-xl object-cover"
                />
              ))}
            </div>
          )}

          <div className="p-6">
            <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-xs font-medium uppercase tracking-widest text-[#8B6B5A]">
                  Lokacioni
                </dt>
                <dd className="mt-2 text-sm font-medium text-black">
                  {location || 'Nuk është deklaruar'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-widest text-[#8B6B5A]">
                  Shitësi
                </dt>
                <dd className="mt-2 text-sm font-medium text-black">
                  {property.listed_by?.name ||
                    property.listed_by?.email ||
                    'I panjohur'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-widest text-[#8B6B5A]">
                  Tipi i pronës
                </dt>
                <dd className="mt-2 text-sm font-medium text-black">
                  {formatLabel(property.property_type)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-widest text-[#8B6B5A]">
                  Tipi i listimit
                </dt>
                <dd className="mt-2 text-sm font-medium text-black">
                  {formatLabel(details?.listingType)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-widest text-[#8B6B5A]">
                  Dhoma gjumi
                </dt>
                <dd className="mt-2 text-sm font-medium text-black">
                  {property.bedrooms ?? '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-widest text-[#8B6B5A]">
                  Banjo
                </dt>
                <dd className="mt-2 text-sm font-medium text-black">
                  {property.bathrooms ?? '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-widest text-[#8B6B5A]">
                  Sipërfaqja
                </dt>
                <dd className="mt-2 text-sm font-medium text-black">
                  {property.area ? `${property.area} m²` : '—'}
                </dd>
              </div>
            </dl>

            <section className="mt-7 border-t border-[#EEE5DC] pt-5">
              <h2 className="text-xs font-medium uppercase tracking-widest text-[#8B6B5A]">
                Përshkrimi
              </h2>
              <p className="mt-2 whitespace-pre-line text-sm text-gray-600">
                {details?.description || 'Nuk ka përshkrim.'}
              </p>
            </section>
          </div>
        </div>

        {/* PENDING: decision form */}
        {isPending && (
          <ReviewDecisionForm
            propertyId={property.id}
            currentAgentId={property.primary_agent?.id ?? null}
            agents={agents}
          />
        )}

        {/* APPROVED: result card */}
        {isApproved && (
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-serif text-2xl text-[#171310]">
                  Prona është aprovuar
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Listimi është publik dhe i dukshëm për të gjithë
                  përdoruesit.
                </p>

                <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                  {property.reviewed_at && (
                    <div>
                      <dt className="text-xs uppercase tracking-widest text-gray-400">
                        Rishikuar më
                      </dt>
                      <dd className="mt-1 text-[#171310]">
                        {formatDate(property.reviewed_at)}
                      </dd>
                    </div>
                  )}
                  {property.reviewed_by && (
                    <div>
                      <dt className="text-xs uppercase tracking-widest text-gray-400">
                        Rishikuar nga
                      </dt>
                      <dd className="mt-1 text-[#171310]">
                        {property.reviewed_by.name ||
                          property.reviewed_by.email}
                      </dd>
                    </div>
                  )}
                  {property.primary_agent && (
                    <div className="sm:col-span-2">
                      <dt className="text-xs uppercase tracking-widest text-gray-400">
                        Agjenti i caktuar
                      </dt>
                      <dd className="mt-1 flex items-center gap-2 text-[#171310]">
                        <UserCheck className="h-4 w-4 text-[#6B4C3B]" />
                        {property.primary_agent.name ||
                          property.primary_agent.email}
                      </dd>
                    </div>
                  )}
                </dl>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/properties/${property.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-[#E8DDD2] bg-white px-5 py-2.5 text-sm font-semibold text-[#6B4C3B] transition hover:bg-[#F7F3EE]"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Shiko faqen publike
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REJECTED: result card */}
        {property.review_status === 'REJECTED' && (
          <div className="rounded-2xl bg-white p-8 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-700">
                <XCircle className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-serif text-2xl text-[#171310]">
                  Prona është refuzuar
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Listimi nuk është publik. Shitësi u njoftua me arsyen e
                  refuzimit dhe mund ta rregullojë vetë.
                </p>

                {property.rejection_reason && (
                  <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-red-700">
                      Arsyeja e refuzimit
                    </p>
                    <p className="mt-2 text-sm text-red-900">
                      {property.rejection_reason}
                    </p>
                  </div>
                )}

                <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                  {property.reviewed_at && (
                    <div>
                      <dt className="text-xs uppercase tracking-widest text-gray-400">
                        Rishikuar më
                      </dt>
                      <dd className="mt-1 text-[#171310]">
                        {formatDate(property.reviewed_at)}
                      </dd>
                    </div>
                  )}
                  {property.reviewed_by && (
                    <div>
                      <dt className="text-xs uppercase tracking-widest text-gray-400">
                        Rishikuar nga
                      </dt>
                      <dd className="mt-1 text-[#171310]">
                        {property.reviewed_by.name ||
                          property.reviewed_by.email}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}