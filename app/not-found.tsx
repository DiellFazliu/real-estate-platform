import Link from 'next/link'
import { prisma } from '@/lib/db/prisma'
import { serializeProperties } from '@/lib/utils/serialize'
import { BackButton } from '@/components/shared/BackButton'

// ═══════════════════════════════════════════════════════════════
// MERR 3 PRONA TË RASTËSISHME
// ═══════════════════════════════════════════════════════════════

async function getRandomProperties() {
  try {
    const total = await prisma.property.count({
      where: {
        status: 'PUBLISHED',
        review_status: 'APPROVED',
      },
    })

    if (total === 0) return []

    const skip = Math.max(0, Math.floor(Math.random() * Math.max(1, total - 3)))

    const dbProperties = await prisma.property.findMany({
      where: {
        status: 'PUBLISHED',
        review_status: 'APPROVED',
      },
      orderBy: { published_at: 'desc' },
      skip,
      take: 3,
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        price_per_m2: true,
        city: true,
        neighborhood: true,
        bedrooms: true,
        bathrooms: true,
        area: true,
        primary_image_url: true,
        listing_type: true,
        featured: true,
      },
    })

    return serializeProperties(dbProperties)
  } catch (error) {
    console.error('Error fetching random properties:', error)
    return []
  }
}

// ═══════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════

export default async function NotFound() {
  const properties = await getRandomProperties()

  return (
    <div className="min-h-screen bg-[#F7F3EE] pt-20">
      {/* ═══════════════════════════════════════════════════════ */}
      {/* 1. HERO / ERROR MESSAGE                                 */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="px-6 py-20 md:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-4xl text-center">
          {/* Error message */}
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#000000] md:text-4xl lg:text-5xl">
            Faqja Nuk u Gjet
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#000000]/55 md:text-lg">
            Na vjen keq, faqja që po kërkoni nuk ekziston ose është zhvendosur.
            Provo një nga opsionet më poshtë ose shfleto pronat e
            rekomanduara.
          </p>

          {/* ⭐ Action buttons - ME BACK BUTTON KUSHTEZUES */}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            {/* Back button - shfaqet vetëm nëse ka history */}
            <BackButton />

            {/* Home button - gjithmonë */}
            <Link
              href="/"
              className="rounded-xl bg-[#6B4C3B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#000000]"
            >
              🏠 Kthehu në Home
            </Link>

            <Link
              href="/properties"
              className="rounded-xl border-2 border-[#6B4C3B] bg-transparent px-6 py-3 text-sm font-semibold text-[#6B4C3B] transition hover:bg-[#6B4C3B] hover:text-white"
            >
              Të Gjitha Pronat
            </Link>

            <Link
              href="/properties?type=sale"
              className="rounded-xl border-2 border-[#6B4C3B] bg-transparent px-6 py-3 text-sm font-semibold text-[#6B4C3B] transition hover:bg-[#6B4C3B] hover:text-white"
            >
              Për Shitje
            </Link>

            <Link
              href="/properties?type=rent"
              className="rounded-xl border-2 border-[#6B4C3B] bg-transparent px-6 py-3 text-sm font-semibold text-[#6B4C3B] transition hover:bg-[#6B4C3B] hover:text-white"
            >
              Me Qira
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 2. RANDOM PROPERTIES                                    */}
      {/* ═══════════════════════════════════════════════════════ */}
      {properties.length > 0 && (
        <section className="bg-[#F3E9E0] px-6 py-16 md:px-12 lg:px-20">
          <div className="mx-auto w-full max-w-7xl">
            <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-3xl">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#6B4C3B]">
                  💡 Provo Këto
                </p>

                <h2 className="text-3xl font-bold tracking-tight text-[#000000] md:text-4xl">
                  Prona të Rekomanduara
                </h2>

                <p className="mt-4 text-base leading-relaxed text-[#000000]/55 md:text-lg">
                  Disa prona që mund t'ju interesojnë.
                </p>
              </div>

              <Link
                href="/properties"
                className="inline-flex items-center gap-2 rounded-xl bg-[#6B4C3B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#000000]"
              >
                Shiko të gjitha
                <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {properties.map((property: any) => {
                const isRent = property.listing_type === 'rent'

                return (
                  <Link
                    key={property.id}
                    href={`/properties/${property.slug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  >
                    <div className="relative h-64 overflow-hidden">
                      {property.primary_image_url ? (
                        <img
                          src={property.primary_image_url}
                          alt={property.title}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#F3E9E0] to-[#E8DDD2]">
                          <span className="text-5xl">🏠</span>
                        </div>
                      )}

                      <div className="absolute left-4 top-4 flex gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${
                            isRent ? 'bg-[#6B4C3B]' : 'bg-[#4A7C59]'
                          }`}
                        >
                          {isRent ? 'Me Qira' : 'Në Shitje'}
                        </span>

                        {property.featured && (
                          <span className="rounded-full bg-[#D4A574] px-3 py-1 text-xs font-semibold text-white">
                            ⭐ Featured
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-4 left-4">
                        <span className="rounded-lg bg-white/95 px-3 py-1.5 text-sm font-bold text-[#000000] shadow-lg backdrop-blur-sm">
                          €{property.price.toLocaleString()}
                          {isRent && (
                            <span className="text-xs font-normal text-[#000000]/50">
                              {' '}
                              /muaj
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="mb-2 line-clamp-1 text-lg font-bold text-[#000000] transition group-hover:text-[#6B4C3B]">
                        {property.title}
                      </h3>

                      <p className="mb-4 flex items-center gap-1 text-sm text-[#000000]/50">
                        <span>📍</span>
                        {property.neighborhood && `${property.neighborhood}, `}
                        {property.city}
                      </p>

                      <div className="mt-auto flex items-center gap-4 border-t border-[#000000]/5 pt-4 text-sm text-[#000000]/50">
                        {property.bedrooms && (
                          <span className="flex items-center gap-1.5">
                            🛏️ {property.bedrooms}
                          </span>
                        )}
                        {property.bathrooms && (
                          <span className="flex items-center gap-1.5">
                            🚿 {property.bathrooms}
                          </span>
                        )}
                        {property.area && (
                          <span className="flex items-center gap-1.5">
                            📐 {property.area}m²
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}