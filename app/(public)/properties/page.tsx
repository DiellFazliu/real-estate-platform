import Link from 'next/link'
import { PropertyImage } from '@/components/shared/PropertyImage'
import { CompareButton } from '@/components/compare/CompareButton'
import { AISearch } from '@/components/search/AISearch'
import { SortDropdown } from '@/components/search/SortDropdown'
import { Pagination } from '@/components/properties/Pagiantion'
import { ScrollToHash } from '@/components/scroll/ScrollToHash'
import {
  searchProperties,
  type PropertiesSearchParams,
} from '@/lib/db/queries/properties'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { CardFavoriteButton } from '@/components/properties/CardFavoriteButton'

// ═══════════════════════════════════════════════════════════════
// LABELS (UI-only — no DB knowledge)
// ═══════════════════════════════════════════════════════════════

const FEATURE_LABELS: Record<string, string> = {
  elevator: 'Ashensor',
  parking: 'Parking',
  garden: 'Kopsht',
  pool: 'Pishinë',
  air_conditioning: 'Kondicioner',
  heating: 'Ngrohje',
  security: 'Siguri',
  internet: 'Internet',
}

const TYPE_LABELS: Record<string, string> = {
  apartment: '🏠 Apartament',
  house: '🏡 Shtëpi',
  villa: '🏘 Vilë',
  penthouse: '🏙 Penthouse',
  studio: '🚪 Studio',
  land: '🌱 Tokë',
  commercial: '🏪 Lokal',
  office: '🏢 Zyrë',
}

interface Props {
  searchParams: Promise<PropertiesSearchParams>
}

export default async function PropertiesPage({ searchParams }: Props) {
  const params = await searchParams
  const { properties, total, page, totalPages, hasStructuredFilters } =
    await searchProperties(params, { pageSize: 30 })
  // ⭐ Gjej cilat prona janë favorite nga user-i aktual (batch)
  const session = await auth()
  let favoritedIds = new Set<number>()

  if (session?.user?.id) {
    const favs = await prisma.favorite.findMany({
      where: {
        user_id: parseInt(session.user.id),
        property_id: { in: properties.map((p: any) => p.id) },
      },
      select: { property_id: true },
    })
    favoritedIds = new Set(favs.map((f) => f.property_id))
  }
  const hasAnyFilter =
    hasStructuredFilters || Boolean(params.q)

  const basePath =
    params.type === 'rent'
      ? '/properties?type=rent'
      : params.type === 'sale'
        ? '/properties?type=sale'
        : '/properties'

  return (
    <main className="min-h-screen bg-[#F7F3EE] pt-24">
      {/* ⭐ Scroll automatik kur ka hash në URL */}
      <ScrollToHash />

      {/* ═══════════════════════════════════════════════════
          HEADER
      ═══════════════════════════════════════════════════ */}
      <section className="bg-[#F3E9E0] px-6 py-16 md:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-7xl">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#6B4C3B]">
              Prona
            </p>

            <h1 className="text-4xl font-bold tracking-tight text-[#000000] md:text-5xl">
              {params.q
                ? `Kërkim për "${params.q}"`
                : 'Gjeni pronën tuaj të ardhshme'}
            </h1>

            <p className="mt-4 text-base leading-relaxed text-[#000000]/55 md:text-lg">
              Eksploroni pronat tona dhe gjeni hapësirën që përshtatet me
              nevojat dhe stilin tuaj të jetesës.
            </p>
          </div>

          <div className="mt-8 w-full">
            <AISearch />
          </div>

          {hasStructuredFilters && (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {params.city && <FilterChip>📍 {params.city}</FilterChip>}
              {params.neighborhood && (
                <FilterChip>📌 {params.neighborhood}</FilterChip>
              )}
              {params.propertyType && (
                <FilterChip>
                  {TYPE_LABELS[params.propertyType] || params.propertyType}
                </FilterChip>
              )}
              {params.type && (
                <FilterChip>
                  {params.type === 'rent' ? '💰 Me Qira' : '💰 Në Shitje'}
                </FilterChip>
              )}
              {params.bedrooms && (
                <FilterChip>🛏 {params.bedrooms}+ Dhoma</FilterChip>
              )}
              {params.bathrooms && (
                <FilterChip>♨ {params.bathrooms}+ Banjo</FilterChip>
              )}
              {params.minPrice && (
                <FilterChip>
                  ≥ €{Number(params.minPrice).toLocaleString()}
                </FilterChip>
              )}
              {params.maxPrice && (
                <FilterChip>
                  ≤ €{Number(params.maxPrice).toLocaleString()}
                </FilterChip>
              )}
              {params.features?.split(',').map((f) =>
                f ? (
                  <FilterChip key={f}>✓ {FEATURE_LABELS[f] || f}</FilterChip>
                ) : null
              )}
            </div>
          )}

          <div
            id="results"
            className="scroll-mt-32 mt-8 flex flex-wrap items-center justify-between gap-4"
          >
            <p className="text-sm font-medium text-[#000000]/60">
              <span className="font-bold text-[#000000]">{total}</span>{' '}
              {total === 1 ? 'pronë' : 'prona'} u gjetën
            </p>

            <div className="flex items-center gap-4">
              {hasAnyFilter && (
                <Link
                  href={basePath}
                  className="text-sm font-semibold text-[#6B4C3B] transition hover:text-[#000000]"
                >
                  Pastro filtrat
                </Link>
              )}

              <SortDropdown />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          PROPERTIES GRID
      ═══════════════════════════════════════════════════ */}
      <section
        id="properties"
        className="scroll-mt-32 mx-auto w-full max-w-7xl px-5 py-10 sm:px-6 md:py-12 lg:px-8"
      >
        {properties.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-[#6B4C3B]/10 bg-white px-6 text-center shadow-sm">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#F3E9E0]">
              <span className="text-2xl">⌂</span>
            </div>

            <h2 className="mb-2 text-2xl font-bold text-[#000000]">
              Nuk u gjet asnjë pronë
            </h2>

            <p className="mb-7 max-w-md text-sm leading-relaxed text-[#000000]/50">
              Provoni të ndryshoni kriteret e kërkimit ose shikoni të gjitha
              pronat tona.
            </p>

            <Link
              href="/properties"
              className="rounded-xl bg-[#6B4C3B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#000000]"
            >
              Shiko të gjitha pronat
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
{properties.map((property: any) => (
  <article
    key={property.id}
    className="group overflow-hidden rounded-2xl border border-[#6B4C3B]/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
  >
    <div className="relative">
      <Link
        href={`/properties/${property.slug}`}
        className="block"
      >
        <div className="relative h-64 overflow-hidden bg-[#F3E9E0]">
          <PropertyImage
            src={property.primary_image_url}
            alt={property.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />

          <div className="absolute left-4 top-4">
            <span
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide shadow-sm ${
                property.listing_type === 'rent'
                  ? 'bg-[#F3E9E0] text-[#6B4C3B]'
                  : 'bg-[#6B4C3B] text-white'
              }`}
            >
              {property.listing_type === 'rent'
                ? 'Me Qira'
                : 'Në Shitje'}
            </span>
          </div>

          <div className="absolute bottom-4 left-4">
            <div className="rounded-xl bg-white px-4 py-2.5 shadow-lg">
              <span className="text-lg font-bold text-[#000000]">
                €{Number(property.price).toLocaleString()}
              </span>

              {property.listing_type === 'rent' && (
                <span className="ml-1 text-xs text-[#000000]/45">
                  / muaj
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-5">
          <h2 className="mb-2 line-clamp-1 text-lg font-bold text-[#000000] transition-colors group-hover:text-[#6B4C3B]">
            {property.title}
          </h2>

          <p className="mb-5 flex items-center gap-2 text-sm text-[#000000]/50">
            <span className="text-[#6B4C3B]">●</span>
            {property.neighborhood &&
              `${property.neighborhood}, `}
            {property.city}
          </p>

          <div className="flex items-center gap-5 border-t border-[#6B4C3B]/10 pt-4 text-sm text-[#000000]/55">
            {property.bedrooms && (
              <div className="flex items-center gap-1.5">
                <span className="text-[#6B4C3B]">🛏</span>
                <span>{property.bedrooms}</span>
                <span className="hidden sm:inline">Dhoma</span>
              </div>
            )}

            {property.bathrooms && (
              <div className="flex items-center gap-1.5">
                <span className="text-[#6B4C3B]">♨</span>
                <span>{property.bathrooms}</span>
                <span className="hidden sm:inline">Banjo</span>
              </div>
            )}

            {property.area && (
              <div className="flex items-center gap-1.5">
                <span className="text-[#6B4C3B]">□</span>
                <span>{property.area}m²</span>
              </div>
            )}
          </div>
        </div>
      </Link>

      <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
        {property.status !== 'SOLD' && (
          <CardFavoriteButton
            propertyId={property.id}
            initialIsFavorite={favoritedIds.has(property.id)}
            isAuthenticated={!!session?.user}
          />
        )}

        <CompareButton
          property={{
            id: property.id,
            slug: property.slug,
            title: property.title,
            price: Number(property.price),
            city: property.city,
            neighborhood: property.neighborhood,
            primary_image_url: property.primary_image_url,
          }}
        />
      </div>
    </div>
  </article>
))}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} />

            <p className="mt-4 text-center text-xs text-[#000000]/40">
              Faqja {page} nga {totalPages} · {total} prona gjithsej
            </p>
          </>
        )}
      </section>
    </main>
  )
}

function FilterChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[#6B4C3B]/15 bg-white px-3 py-1 text-xs font-medium text-[#6B4C3B]">
      {children}
    </span>
  )
}