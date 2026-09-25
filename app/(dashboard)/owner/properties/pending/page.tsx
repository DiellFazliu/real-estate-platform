import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { client } from '@/lib/sanity/client'
import {
  canReviewProperties,
  getReviewBasePath,
  normalizeReviewContext,
} from '@/lib/reviews/context'

type SanityPropertyDetails = {
  _id: string
  description?: string
  listingType?: string
  images?: string[]
}

type PageProps = {
  searchParams: Promise<{
    q?: string
    status?: string
    page?: string
    context?: string
  }>
}

type ReviewStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'

function formatLabel(value?: string | null) {
  if (!value) return 'Not specified'
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export default async function PendingPropertyReviewsPage({
  searchParams,
}: PageProps) {
  const session = await auth()

  if (!session?.user) redirect('/login')
  if (!canReviewProperties(session)) redirect('/')

  const params = await searchParams
  const context = normalizeReviewContext(params.context)
  const basePath = getReviewBasePath(context)
  const reviewDetailBase =
    context === 'admin' ? '/admin/reviews' : '/owner/properties'

  const requestedStatus = params.status?.toUpperCase()
  const reviewStatus: ReviewStatus =
    requestedStatus === 'APPROVED' || requestedStatus === 'REJECTED'
      ? requestedStatus
      : 'PENDING_REVIEW'

  const query = params.q?.trim() || ''
  const currentPage = Math.max(
    1,
    Number.parseInt(params.page || '1', 10) || 1,
  )
  const pageSize = 20
  const where: any = { review_status: reviewStatus }

  if (query) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { city: { contains: query, mode: 'insensitive' } },
      { neighborhood: { contains: query, mode: 'insensitive' } },
      { listed_by: { name: { contains: query, mode: 'insensitive' } } },
      { listed_by: { email: { contains: query, mode: 'insensitive' } } },
    ]
  }

  const [total, properties] = await Promise.all([
    prisma.property.count({ where }),
    prisma.property.findMany({
      where,
      include: {
        listed_by: { select: { name: true, email: true } },
      },
      orderBy: { created_at: 'asc' },
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const pageTitle =
    reviewStatus === 'PENDING_REVIEW'
      ? 'Reviews në pritje'
      : reviewStatus === 'APPROVED'
        ? 'Reviews të aprovuara'
        : 'Reviews të refuzuara'

  function pageHref(page: number) {
    const nextParams = new URLSearchParams()
    nextParams.set('status', reviewStatus)
    if (query) nextParams.set('q', query)
    nextParams.set('page', String(page))
    if (context === 'admin') nextParams.set('context', 'admin')
    return `${basePath}?${nextParams.toString()}`
  }

  let sanityDetails: SanityPropertyDetails[] = []

  if (properties.length > 0) {
    try {
      sanityDetails = await client.fetch(
        `*[_type == "property" && _id in $ids] {
          _id,
          description,
          listingType,
          "images": images[].asset->url
        }`,
        { ids: properties.map((property) => property.sanity_id) },
      )
    } catch (error) {
      console.error('Unable to load pending property details:', error)
    }
  }

  const detailsBySanityId = new Map(
    sanityDetails.map((details) => [details._id, details]),
  )

  return (
    <div className="p-8 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-[#6B4C3B]">
          Moderimi
        </p>
        <h1 className="font-serif text-4xl text-[#171310]">{pageTitle}</h1>
        <p className="mt-2 text-sm text-gray-500">
          {total} {total === 1 ? 'listim' : 'listime'}
        </p>
      </div>

      {/* Filter bar */}
      <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <form className="flex min-w-0 flex-1 gap-2" action={basePath} method="get">
          <input type="hidden" name="status" value={reviewStatus} />
          {context === 'admin' && (
            <input type="hidden" name="context" value="admin" />
          )}
          <Search className="mt-2.5 h-5 w-5 shrink-0 text-[#8B6B5A]" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Kërko titull, qytet ose shitës"
            className="min-w-0 flex-1 rounded-xl border border-[#E8DDD2] px-3 py-2 text-black outline-none focus:border-[#6B4C3B]"
          />
          <button
            type="submit"
            className="rounded-xl bg-[#6B4C3B] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4A3328]"
          >
            Kërko
          </button>
        </form>

        <nav className="flex flex-wrap gap-2 text-sm">
          {[
            ['PENDING_REVIEW', 'Në pritje'],
            ['APPROVED', 'Aprovuar'],
            ['REJECTED', 'Refuzuar'],
          ].map(([value, label]) => (
            <Link
              key={value}
              href={pageHref(1).replace(
                `status=${reviewStatus}`,
                `status=${value}`,
              )}
              className={`rounded-full px-3 py-1.5 font-medium transition ${
                reviewStatus === value
                  ? 'bg-[#6B4C3B] text-white'
                  : 'bg-[#F3E9E0] text-[#6B4C3B] hover:bg-[#E8DDD2]'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>

      {properties.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
          <h2 className="font-serif text-xl text-[#171310]">
            Nuk ka listime
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Listimet e reja për review do të shfaqen këtu.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {properties.map((property) => {
            const details = detailsBySanityId.get(property.sanity_id)
            const location = [property.location, property.city]
              .filter(Boolean)
              .join(', ')

            return (
              <article
                key={property.id}
                className="overflow-hidden rounded-2xl bg-white shadow-sm"
              >
                {details?.images && details.images.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto bg-[#F3E9E0] p-4">
                    {details.images.map((image, index) => (
                      <img
                        key={`${image}-${index}`}
                        src={image}
                        alt={`${property.title} ${index + 1}`}
                        className="h-40 w-56 shrink-0 rounded-xl object-cover"
                      />
                    ))}
                  </div>
                )}

                <div className="p-6">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-widest text-[#8B6B5A]">
                        {reviewStatus === 'PENDING_REVIEW'
                          ? 'Në pritje'
                          : reviewStatus === 'APPROVED'
                            ? 'Aprovuar'
                            : 'Refuzuar'}
                      </p>
                      <h2 className="mt-2 font-serif text-2xl text-[#171310]">
                        {property.title}
                      </h2>
                      <p className="mt-2 text-xl font-semibold text-[#6B4C3B]">
                        €{Number(property.price).toLocaleString()}
                      </p>
                    </div>

                    <Link
                      href={
                        reviewStatus === 'PENDING_REVIEW'
                          ? context === 'admin'
                            ? `/admin/reviews/${property.id}`
                            : `/owner/properties/${property.id}/review?context=owner`
                          : `/properties/${property.slug}`
                      }
                      className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#6B4C3B] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4A3328]"
                    >
                      {reviewStatus === 'PENDING_REVIEW'
                        ? 'Shqyrto'
                        : 'Shiko listimin'}
                    </Link>
                  </div>

                  <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <dt className="text-[#8B6B5A]">Lokacioni</dt>
                      <dd className="mt-1 font-medium text-black">
                        {location || 'Nuk është deklaruar'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#8B6B5A]">Shitësi</dt>
                      <dd className="mt-1 font-medium text-black">
                        {property.listed_by?.name ||
                          property.listed_by?.email ||
                          'I panjohur'}
                      </dd>
                      {property.listed_by?.name && (
                        <dd className="text-gray-500">
                          {property.listed_by.email}
                        </dd>
                      )}
                    </div>
                    <div>
                      <dt className="text-[#8B6B5A]">Tipi i pronës</dt>
                      <dd className="mt-1 font-medium text-black">
                        {formatLabel(property.property_type)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#8B6B5A]">Tipi i listimit</dt>
                      <dd className="mt-1 font-medium text-black">
                        {formatLabel(details?.listingType)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#8B6B5A]">Dhoma gjumi</dt>
                      <dd className="mt-1 font-medium text-black">
                        {property.bedrooms ?? '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#8B6B5A]">Banjo</dt>
                      <dd className="mt-1 font-medium text-black">
                        {property.bathrooms ?? '—'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#8B6B5A]">Sipërfaqja</dt>
                      <dd className="mt-1 font-medium text-black">
                        {property.area ? `${property.area} m²` : '—'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
          <Link
            href={pageHref(currentPage - 1)}
            aria-disabled={currentPage === 1}
            className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium ${
              currentPage === 1
                ? 'pointer-events-none text-gray-300'
                : 'text-[#6B4C3B] hover:bg-[#F7F3EE]'
            }`}
          >
            <ChevronLeft className="h-4 w-4" /> Mbrapa
          </Link>
          <span className="text-sm text-gray-500">
            Faqja {currentPage} nga {totalPages}
          </span>
          <Link
            href={pageHref(currentPage + 1)}
            aria-disabled={currentPage === totalPages}
            className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium ${
              currentPage === totalPages
                ? 'pointer-events-none text-gray-300'
                : 'text-[#6B4C3B] hover:bg-[#F7F3EE]'
            }`}
          >
            Përpara <ChevronRight className="h-4 w-4" />
          </Link>
        </nav>
      )}
    </div>
  )
}