import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, Info } from 'lucide-react'

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
      listed_by: { select: { name: true, email: true } },
      primary_agent: { select: { id: true } },
    },
  })

  if (!property) notFound()

  // Nëse prona nuk është më në pritje, shfaq kartë informative — jo redirect.
  if (property.review_status !== 'PENDING_REVIEW') {
    const approved = property.review_status === 'APPROVED'

    return (
      <div className="p-8 lg:p-10">
        <Link
          href={basePath}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#6B4C3B] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Kthehu te radha
        </Link>

        <div className="mx-auto mt-8 max-w-2xl rounded-2xl bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3E9E0] text-[#6B4C3B]">
            <Info className="h-6 w-6" />
          </div>

          <h1 className="mt-5 font-serif text-3xl text-[#171310]">
            {approved ? 'Prona është aprovuar' : 'Prona është refuzuar'}
          </h1>

          <p className="mt-3 text-sm text-gray-500">{property.title}</p>

          {!approved && property.rejection_reason && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-widest text-red-700">
                Arsyeja e refuzimit
              </p>
              <p className="mt-2 text-sm text-red-900">
                {property.rejection_reason}
              </p>
            </div>
          )}

          <p className="mt-5 text-xs text-gray-400">
            Ky review u përfundua më parë.
          </p>

          <Link
            href={basePath}
            className="mt-7 inline-flex rounded-xl bg-[#6B4C3B] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4A3328]"
          >
            Kthehu te radha
          </Link>
        </div>
      </div>
    )
  }

  const agents = await prisma.user.findMany({
    where: { is_active: true, role: { name: 'AGENT' } },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  })

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
    console.error('Unable to load review details from Sanity:', error)
  }

  const location = [property.location, property.city]
    .filter(Boolean)
    .join(', ')

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
      <div className="mt-6 mb-8">
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

        <ReviewDecisionForm
          propertyId={property.id}
          currentAgentId={property.primary_agent?.id ?? null}
          agents={agents}
        />
      </div>
    </div>
  )
}