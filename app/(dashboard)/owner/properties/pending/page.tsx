import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { client } from '@/lib/sanity/client'

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
  if (!value) return 'Nuk është deklaruar'
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('sq-AL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

export default async function PendingPropertyReviewsPage({
  searchParams,
}: PageProps) {
  const session = await auth()

  if (!session?.user) redirect('/login')

  if (
    !['OWNER', 'ADMIN'].includes(session.user.role) ||
    (!session.user.permissions?.includes('properties:review') &&
      session.user.role !== 'ADMIN')
  ) {
    redirect('/')
  }

  const params = await searchParams
  const requestedStatus = params.status?.toUpperCase()
  const reviewStatus: ReviewStatus =
    requestedStatus === 'APPROVED' || requestedStatus === 'REJECTED'
      ? requestedStatus
      : 'PENDING_REVIEW'
  const query = params.q?.trim() || ''
  const basePath =
    params.context === 'admin'
      ? '/admin/reviews'
      : '/owner/properties/pending'
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
      ? 'Review-t në pritje'
      : reviewStatus === 'APPROVED'
        ? 'Listimet e aprovuara'
        : 'Listimet e refuzuara'

  function pageHref(page: number) {
    const nextParams = new URLSearchParams()
    nextParams.set('status', reviewStatus)
    if (query) nextParams.set('q', query)
    nextParams.set('page', String(page))
    if (params.context === 'admin') nextParams.set('context', 'admin')
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
      console.error(
        'Nuk mund të ngarkohen detajet nga Sanity:',
        error,
      )
    }
  }

  const detailsBySanityId = new Map(
    sanityDetails.map((details) => [details._id, details]),
  )

  return (
    <main className="min-h-screen bg-[#F7F3EE]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-black">{pageTitle}</h1>
          <p className="mt-2 text-[#6B4C3B]/60">
            {total} {total === 1 ? 'listim' : 'listime'}
          </p>
        </header>

        <div className="mb-8 flex flex-col gap-4 rounded-xl border border-[#E8DDD2] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <form
            className="flex min-w-0 flex-1 gap-2"
            action={basePath}
            method="get"
          >
            <input type="hidden" name="status" value={reviewStatus} />
            {params.context === 'admin' && (
              <input type="hidden" name="context" value="admin" />
            )}
            <Search className="mt-2.5 h-5 w-5 shrink-0 text-[#8B6B5A]" />
            <input
              name="q"
              defaultValue={query}
              placeholder="Kërko titull, qytet ose shitës"
              className="min-w-0 flex-1 rounded-lg border border-[#E8DDD2] px-3 py-2 text-black outline-none focus:border-[#6B4C3B]"
            />
            <button
              type="submit"
              className="rounded-lg bg-[#6B4C3B] px-4 py-2 font-semibold text-white hover:bg-[#4A3328]"
            >
              Kërko
            </button>
          </form>
          <nav
            aria-label="Statusi i listimeve"
            className="flex flex-wrap gap-2 text-sm"
          >
            {[
              ['PENDING_REVIEW', 'Në pritje'],
              ['APPROVED', 'Të aprovuara'],
              ['REJECTED', 'Të refuzuara'],
            ].map(([value, label]) => (
              <Link
                key={value}
                href={pageHref(1).replace(
                  `status=${reviewStatus}`,
                  `status=${value}`,
                )}
                className={`rounded-full px-3 py-1.5 font-medium ${
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
          <section className="rounded-2xl border border-[#E8DDD2] bg-white px-6 py-14 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-black">
              Nuk u gjetën listime
            </h2>
            <p className="mt-2 text-[#6B4C3B]/60">
              Dorëzimet e shitësve që kërkojnë review do të shfaqen këtu.
            </p>
          </section>
        ) : (
          <div className="space-y-6">
            {properties.map((property) => {
              const details = detailsBySanityId.get(property.sanity_id)
              const location = [property.location, property.city]
                .filter(Boolean)
                .join(', ')

              // ═══════════════════════════════════════════════════════
              // Link routing per status:
              //   • PENDING_REVIEW → review detail (approve/reject form)
              //   • APPROVED       → public property page (opens new tab)
              //   • REJECTED       → review detail (shows rejection reason)
              // ═══════════════════════════════════════════════════════
              const reviewHref =
                params.context === 'admin'
                  ? `/admin/reviews/${property.id}?context=admin`
                  : `/owner/properties/${property.id}/review?context=owner`

              const href =
                reviewStatus === 'APPROVED'
                  ? `/properties/${property.slug}`
                  : reviewHref

              const isRejected = reviewStatus === 'REJECTED'
              const isApproved = reviewStatus === 'APPROVED'

              return (
                <article
                  key={property.id}
                  className="overflow-hidden rounded-2xl border border-[#E8DDD2] bg-white shadow-sm"
                >
                  {details?.images && details.images.length > 0 && (
                    <div className="flex gap-3 overflow-x-auto bg-[#F3E9E0] p-4">
                      {details.images.map((image, index) => (
                        <img
                          key={`${image}-${index}`}
                          src={image}
                          alt={`${property.title} ${index + 1}`}
                          className="h-40 w-56 shrink-0 rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div>
                        <p className="text-sm font-medium text-[#8B6B5A]">
                          {reviewStatus === 'PENDING_REVIEW'
                            ? 'Në pritje të review-t'
                            : reviewStatus === 'APPROVED'
                              ? 'Aprovuar'
                              : 'Refuzuar'}
                        </p>
                        <h2 className="mt-1 text-2xl font-bold text-black">
                          {property.title}
                        </h2>
                        <p className="mt-2 text-xl font-semibold text-[#6B4C3B]">
                          €{Number(property.price).toLocaleString()}
                        </p>
                      </div>

                      <Link
                        href={href}
                        target={isApproved ? '_blank' : undefined}
                        rel={isApproved ? 'noopener noreferrer' : undefined}
                        className={`inline-flex shrink-0 items-center justify-center rounded-lg px-5 py-2.5 font-semibold transition ${
                          isRejected
                            ? 'border border-red-200 bg-white text-red-700 hover:bg-red-50'
                            : 'bg-[#6B4C3B] text-white hover:bg-[#4A3328]'
                        }`}
                      >
                        {reviewStatus === 'PENDING_REVIEW' && 'Shqyrto'}
                        {reviewStatus === 'APPROVED' && 'Shiko listimin'}
                        {reviewStatus === 'REJECTED' &&
                          'Shiko arsyen e refuzimit'}
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
                            'Shitës i panjohur'}
                        </dd>
                        {property.listed_by?.name && (
                          <dd className="text-[#6B4C3B]/60">
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
                          {property.bedrooms ?? 'Nuk është deklaruar'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[#8B6B5A]">Banjo</dt>
                        <dd className="mt-1 font-medium text-black">
                          {property.bathrooms ?? 'Nuk është deklaruar'}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[#8B6B5A]">Sipërfaqja</dt>
                        <dd className="mt-1 font-medium text-black">
                          {property.area
                            ? `${property.area} m²`
                            : 'Nuk është deklaruar'}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-6 border-t border-[#E8DDD2] pt-5">
                      <h3 className="font-semibold text-black">
                        Përshkrimi
                      </h3>
                      <p className="mt-2 whitespace-pre-line text-[#6B4C3B]/75">
                        {details?.description || 'Nuk ka përshkrim.'}
                      </p>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {totalPages > 1 && (
          <nav
            className="mt-8 flex items-center justify-between rounded-xl border border-[#D8E1E8] bg-white p-4 shadow-sm"
            aria-label="Faqosja"
          >
            <Link
              href={pageHref(currentPage - 1)}
              aria-disabled={currentPage === 1}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 font-medium ${
                currentPage === 1
                  ? 'pointer-events-none text-gray-300'
                  : 'text-[#6B4C3B] hover:bg-[#F7F3EE]'
              }`}
            >
              <ChevronLeft className="h-4 w-4" /> Përpara
            </Link>
            <span className="text-sm text-[#6B4C3B]/70">
              Faqja {currentPage} nga {totalPages}
            </span>
            <Link
              href={pageHref(currentPage + 1)}
              aria-disabled={currentPage === totalPages}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 font-medium ${
                currentPage === totalPages
                  ? 'pointer-events-none text-gray-300'
                  : 'text-[#6B4C3B] hover:bg-[#F7F3EE]'
              }`}
            >
              Pas <ChevronRight className="h-4 w-4" />
            </Link>
          </nav>
        )}
      </div>
    </main>
  )
}