// app/(public)/properties/compare/page.tsx — public comparison page.
// Reachable at /properties/compare?ids=1,2,3. Reads property ids from the
// URL (so it survives page reloads, unlike the in-memory CompareProvider
// state), fetches the rows, and hands them to <CompareInsights /> for the
// AI-assisted analysis.

import Link from 'next/link'

import { ArrowLeft, X } from 'lucide-react'

import { prisma } from '@/lib/db/prisma'

import { CompareInsights } from '@/components/compare/CompareInsights'

interface ComparePageProps {
  searchParams: Promise<{ ids?: string }>
}

interface ComparisonProperty {
  id: number
  slug: string
  title: string
  price: number
  area: number | null
  bedrooms: number | null
  city: string | null
  listing_type: string
  primary_image_url: string | null
}

// Parses ?ids=1,2,3 → [1, 2, 3]. Deduplicates, drops invalid numbers,
// caps at 4 (matches MAX_COMPARE in CompareProvider).
function parseIds(value?: string): number[] {
  if (!value) return []

  return Array.from(
    new Set(
      value
        .split(',')
        .map((id) => Number(id.trim()))
        .filter((id) => Number.isInteger(id) && id > 0),
    ),
  ).slice(0, 4)
}

export default async function ComparePage({
  searchParams,
}: ComparePageProps) {
  const params = await searchParams
  const ids = parseIds(params.ids)

  if (ids.length === 0) return <EmptyCompareState />

  const dbProperties = await prisma.property.findMany({
    where: {
      id: { in: ids },
      status: 'PUBLISHED',
      review_status: 'APPROVED',
    },
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      area: true,
      bedrooms: true,
      city: true,
      listing_type: true,
      primary_image_url: true,
    },
  })

  // Preserve the order the ids appeared in the URL — that's the order
  // the user picked them in on the compare bar.
  const properties: ComparisonProperty[] = ids
    .map((id) => dbProperties.find((p) => p.id === id))
    .filter(
      (p): p is NonNullable<typeof p> => Boolean(p),
    )
    .map((p) => ({ ...p, price: Number(p.price) }))

  if (properties.length < 2) return <EmptyCompareState />

  return (
    <main className="min-h-screen bg-[#F7F3EE] px-5 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <Link
            href="/properties"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#6B4C3B] transition hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Kthehu te pronat
          </Link>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6B4C3B]">
                Krahasimi
              </p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight text-black md:text-5xl">
                Krahaso pronat
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-black/50">
                Shihni dallimet që kanë më shumë rëndësi dhe zgjidhni me
                më shumë siguri.
              </p>
            </div>
            <p className="text-sm text-black/40">
              {properties.length} prona të përzgjedhura
            </p>
          </div>
        </header>

        <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {properties.map((property) => (
            <Link
              key={property.id}
              href={`/properties/${property.slug}`}
              className="group overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[#F3E9E0]">
                {property.primary_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={property.primary_image_url}
                    alt=""
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-black/30">
                    Pa foto
                  </div>
                )}

                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-black backdrop-blur">
                  {property.listing_type === 'rent'
                    ? 'Me qira'
                    : 'Në shitje'}
                </span>
              </div>

              <div className="p-4">
                <h2 className="line-clamp-2 min-h-10 text-sm font-bold text-black group-hover:text-[#6B4C3B]">
                  {property.title}
                </h2>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-base font-bold text-[#6B4C3B]">
                    €{property.price.toLocaleString('de-DE')}
                    {property.listing_type === 'rent' ? ' / muaj' : ''}
                  </p>

                  {property.area !== null && (
                    <p className="text-xs text-black/45">
                      {property.area} m²
                    </p>
                  )}
                </div>

                <div className="mt-1 flex gap-3 text-xs text-black/40">
                  {property.city && <span>{property.city}</span>}
                  {property.bedrooms !== null && (
                    <span>{property.bedrooms} dhoma</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </section>

        <CompareInsights properties={properties} />

        <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-5 text-black/35">
          Krahasimi përdor vetëm informacionin e publikuar për pronat.
          Përputhja është një ndihmë për krahasim, jo një vlerësim
          profesional.
        </p>
      </div>
    </main>
  )
}

function EmptyCompareState() {
  return (
    <main className="min-h-screen bg-[#F7F3EE] px-5 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#F3E9E0]">
          <X className="h-7 w-7 text-[#6B4C3B]" />
        </div>

        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#6B4C3B]">
          Krahasimi
        </p>

        <h1 className="text-3xl font-bold text-black">
          Nuk ka prona për krahasim
        </h1>

        <p className="mt-4 max-w-md text-sm leading-relaxed text-black/50">
          Zgjidhni të paktën dy prona nga lista e pronave për të filluar
          krahasimin.
        </p>

        <Link
          href="/properties"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#6B4C3B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Shiko pronat
        </Link>
      </div>
    </main>
  )
}