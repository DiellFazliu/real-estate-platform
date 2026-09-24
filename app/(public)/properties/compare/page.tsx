import Link from 'next/link'
import { ArrowLeft, Check, X } from 'lucide-react'
import { prisma } from '@/lib/db/prisma'
import { CompareInsights } from '@/components/compare/CompareInsights'

interface ComparePageProps {
  searchParams: Promise<{
    ids?: string
  }>
}

interface ComparisonProperty {
  id: number
  slug: string
  title: string
  price: number
  price_per_m2: number | null
  listing_type: string
  property_type: string | null
  primary_image_url: string | null

  city: string | null
  neighborhood: string | null
  location: string | null

  bedrooms: number | null
  bathrooms: number | null
  area: number | null
  balconies: number
  floor: number | null
  total_floors: number | null

  year_built: number | null
  renovation_year: number | null
  condition: string | null
  orientation: string | null
  furnished: string | null
  energy_class: string | null

  has_elevator: boolean
  has_parking: boolean
  has_garden: boolean
  has_pool: boolean
  has_air_conditioning: boolean
  has_heating: boolean
  has_security: boolean
  has_internet: boolean

  features: string[]
}

function parseIds(value?: string): number[] {
  if (!value) return []

  return Array.from(
    new Set(
      value
        .split(',')
        .map((id) => Number(id.trim()))
        .filter(
          (id) => Number.isInteger(id) && id > 0,
        ),
    ),
  ).slice(0, 4)
}

function formatPrice(
  value: number,
  listingType: string,
) {
  const formatted = `€${value.toLocaleString()}`

  return listingType === 'rent'
    ? `${formatted} / muaj`
    : formatted
}

function formatNumber(value: number | null) {
  if (value === null || value === undefined) {
    return '—'
  }

  return String(value)
}

function formatText(value: string | null) {
  if (!value) return '—'

  return value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function hasDifferentValues<T>(
  properties: ComparisonProperty[],
  getter: (property: ComparisonProperty) => T,
) {
  const values = properties.map(getter)

  return (
    new Set(
      values.map((value) => String(value ?? '—')),
    ).size > 1
  )
}

function getUniqueValues(
  properties: ComparisonProperty[],
  getter: (
    property: ComparisonProperty,
  ) => string | null,
) {
  return Array.from(
    new Set(
      properties
        .map(getter)
        .filter(
          (value): value is string => Boolean(value),
        ),
    ),
  )
}

function getPropertyTypeSummary(
  properties: ComparisonProperty[],
) {
  const types = getUniqueValues(
    properties,
    (property) => property.property_type,
  )

  if (types.length === 0) return '—'

  if (types.length === 1) {
    return formatText(types[0])
  }

  return `${types.length} lloje të ndryshme`
}

function getListingTypeSummary(
  properties: ComparisonProperty[],
) {
  const saleCount = properties.filter(
    (property) => property.listing_type === 'sale',
  ).length

  const rentCount = properties.filter(
    (property) => property.listing_type === 'rent',
  ).length

  const parts: string[] = []

  if (saleCount > 0) {
    parts.push(`${saleCount} në shitje`)
  }

  if (rentCount > 0) {
    parts.push(`${rentCount} me qira`)
  }

  return parts.join(' · ') || '—'
}

function getCitySummary(
  properties: ComparisonProperty[],
) {
  const cities = getUniqueValues(
    properties,
    (property) => property.city,
  )

  if (cities.length === 0) return '—'

  return cities.join(' · ')
}

function getRange(
  values: number[],
  suffix = '',
) {
  if (values.length === 0) return '—'

  const min = Math.min(...values)
  const max = Math.max(...values)

  if (min === max) {
    return `${min.toLocaleString()}${suffix}`
  }

  return `${min.toLocaleString()}–${max.toLocaleString()}${suffix}`
}

function getAreaSummary(
  properties: ComparisonProperty[],
) {
  const areas = properties
    .map((property) => property.area)
    .filter(
      (area): area is number => area !== null,
    )

  return getRange(areas, ' m²')
}

function getBedroomSummary(
  properties: ComparisonProperty[],
) {
  const bedrooms = properties
    .map((property) => property.bedrooms)
    .filter(
      (bedrooms): bedrooms is number =>
        bedrooms !== null,
    )

  if (bedrooms.length === 0) return '—'

  return `${getRange(bedrooms)} (${bedrooms.length} me të dhëna)`
}

function getCategorySummary(
  properties: ComparisonProperty[],
) {
  const residentialTypes = new Set([
    'apartment',
    'penthouse',
    'house',
    'villa',
    'duplex',
    'studio',
    'townhouse',
    'bungalow',
  ])

  const commercialTypes = new Set([
    'office',
    'shop',
    'store',
    'commercial',
    'warehouse',
    'business',
    'restaurant',
    'hotel',
  ])

  let residentialCount = 0
  let commercialCount = 0
  let unknownCount = 0

  properties.forEach((property) => {
    const type = property.property_type
      ?.trim()
      .toLowerCase()

    if (!type) {
      unknownCount++
      return
    }

    if (residentialTypes.has(type)) {
      residentialCount++
    } else if (commercialTypes.has(type)) {
      commercialCount++
    } else {
      unknownCount++
    }
  })

  const parts: string[] = []

  if (residentialCount > 0) {
    parts.push(`${residentialCount} rezidenciale`)
  }

  if (commercialCount > 0) {
    parts.push(`${commercialCount} komerciale`)
  }

  if (unknownCount > 0) {
    parts.push(
      `${unknownCount} të pakategorizuara`,
    )
  }

  return (
    parts.join(' · ') || 'Nuk u përcaktua'
  )
}

function hasMixedListingTypes(
  properties: ComparisonProperty[],
) {
  return (
    new Set(
      properties.map(
        (property) => property.listing_type,
      ),
    ).size > 1
  )
}

function hasMixedPropertyTypes(
  properties: ComparisonProperty[],
) {
  return (
    new Set(
      properties
        .map(
          (property) => property.property_type,
        )
        .filter(Boolean),
    ).size > 1
  )
}

function getCommonFeatures(
  properties: ComparisonProperty[],
) {
  if (properties.length === 0) return []

  const featureSets = properties.map(
    (property) =>
      new Set(
        property.features.map((feature) =>
          feature.trim().toLowerCase(),
        ),
      ),
  )

  return properties[0].features.filter(
    (feature) =>
      featureSets.every((set) =>
        set.has(feature.trim().toLowerCase()),
      ),
  )
}

function hasDifferentFeatures(
  properties: ComparisonProperty[],
) {
  const normalizedSets = properties.map(
    (property) =>
      Array.from(
        new Set(
          property.features.map((feature) =>
            feature.trim().toLowerCase(),
          ),
        ),
      ).sort(),
  )

  return (
    new Set(
      normalizedSets.map((features) =>
        features.join('|'),
      ),
    ).size > 1
  )
}

function BooleanValue({
  value,
}: {
  value: boolean
}) {
  if (value) {
    return (
      <span className="inline-flex items-center gap-2 font-semibold text-[#6B4C3B]">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F3E9E0]">
          <Check className="h-3.5 w-3.5" />
        </span>
        Po
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-2 text-black/40">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/5">
        <X className="h-3.5 w-3.5" />
      </span>
      Jo
    </span>
  )
}

function ComparisonContext({
  properties,
}: {
  properties: ComparisonProperty[]
}) {
  const propertyTypeSummary =
    getPropertyTypeSummary(properties)

  const categorySummary =
    getCategorySummary(properties)

  const listingTypeSummary =
    getListingTypeSummary(properties)

  const citySummary =
    getCitySummary(properties)

  const areaSummary =
    getAreaSummary(properties)

  const bedroomSummary =
    getBedroomSummary(properties)

  const mixedListingTypes =
    hasMixedListingTypes(properties)

  const mixedPropertyTypes =
    hasMixedPropertyTypes(properties)

  const hasImportantDifferences =
    mixedListingTypes ||
    mixedPropertyTypes ||
    new Set(
      properties.map(
        (property) => property.city,
      ),
    ).size > 1

  return (
    <section className="mb-8 rounded-3xl border border-[#6B4C3B]/10 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6B4C3B]">
          Konteksti i krahasimit
        </p>

        <h2 className="mt-2 text-2xl font-bold text-black">
          Çfarë ndryshon mes këtyre pronave?
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-black/50">
          Një përmbledhje e shpejtë e kategorive
          dhe karakteristikave kryesore të pronave
          të zgjedhura.
        </p>
      </div>

      {hasImportantDifferences && (
        <div className="mb-6 rounded-2xl border border-[#6B4C3B]/10 bg-[#F7F3EE] px-5 py-4">
          <p className="text-sm leading-relaxed text-black/65">
            Këto prona kanë dallime të rëndësishme
            në kategorinë, llojin e listimit ose
            lokacionin. Për këtë arsye, disa
            karakteristika duhet të interpretohen në
            kontekst dhe jo si matje direkte mes
            pronave.
          </p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <ContextItem
          label="Kategoria"
          value={categorySummary}
        />

        <ContextItem
          label="Lloji i pronës"
          value={propertyTypeSummary}
        />

        <ContextItem
          label="Listimi"
          value={listingTypeSummary}
        />

        <ContextItem
          label="Qyteti"
          value={citySummary}
        />

        <ContextItem
          label="Sipërfaqja"
          value={areaSummary}
        />

        <ContextItem
          label="Dhoma gjumi"
          value={bedroomSummary}
        />
      </div>

      {(mixedListingTypes ||
        mixedPropertyTypes) && (
        <p className="mt-5 text-xs leading-relaxed text-black/40">
          Disa nga metrikat në tabelën më poshtë nuk
          janë drejtpërdrejt të krahasueshme kur
          pronat kanë lloje ose mënyra të ndryshme
          listimi.
        </p>
      )}
    </section>
  )
}

function ContextItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-[#6B4C3B]/10 bg-[#FCFAF8] p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-black/40">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-[#6B4C3B]">
        {value}
      </p>
    </div>
  )
}

function ComparisonRow({
  label,
  children,
  highlighted = false,
}: {
  label: string
  children: React.ReactNode
  highlighted?: boolean
}) {
  return (
    <div
      className={`grid grid-cols-[180px_repeat(var(--property-count),minmax(180px,1fr))] border-b border-[#6B4C3B]/10 ${
        highlighted
          ? 'bg-[#F3E9E0]/70'
          : 'bg-white'
      }`}
    >
      <div
        className={`px-5 py-4 text-sm font-semibold ${
        highlighted
        ? 'bg-[#F3E9E0]/70 text-[#6B4C3B]'
        : 'bg-[#F7F3EE] text-[#6B4C3B]'
        }`}
      >
        {label}
      </div>

      {children}
    </div>
  )
}

function ComparisonSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="border-b border-[#6B4C3B]/10 bg-[#F7F3EE] px-5 py-5">
        <h2 className="text-base font-bold text-black">
          {title}
        </h2>

        {description && (
          <p className="mt-1 text-sm text-black/45">
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  )
}

function PropertyCell({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={`border-l border-[#6B4C3B]/10 px-5 py-4 text-sm text-black/75 ${className}`}
    >
      {children}
    </div>
  )
}

export default async function ComparePage({
  searchParams,
}: ComparePageProps) {
  const params = await searchParams
  const ids = parseIds(params.ids)

  if (ids.length === 0) {
    return <EmptyCompareState />
  }

  const dbProperties =
    await prisma.property.findMany({
      where: {
        id: {
          in: ids,
        },
        status: 'PUBLISHED',
        review_status: 'APPROVED',
      },
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        price_per_m2: true,
        listing_type: true,
        property_type: true,
        primary_image_url: true,

        city: true,
        neighborhood: true,
        location: true,

        bedrooms: true,
        bathrooms: true,
        area: true,
        balconies: true,
        floor: true,
        total_floors: true,

        year_built: true,
        renovation_year: true,
        condition: true,
        orientation: true,
        furnished: true,
        energy_class: true,

        has_elevator: true,
        has_parking: true,
        has_garden: true,
        has_pool: true,
        has_air_conditioning: true,
        has_heating: true,
        has_security: true,
        has_internet: true,

        features: true,
      },
    })

  const properties: ComparisonProperty[] = ids
    .map((id) =>
      dbProperties.find(
        (property) => property.id === id,
      ),
    )
    .filter(
      (
        property,
      ): property is NonNullable<
        typeof property
      > => Boolean(property),
    )
    .map((property) => ({
      ...property,
      price: Number(property.price),
      price_per_m2:
        property.price_per_m2 !== null
          ? Number(property.price_per_m2)
          : null,
    }))

  if (properties.length < 2) {
    return <EmptyCompareState />
  }

  const commonFeatures =
    getCommonFeatures(properties)

  const differentFeatures =
    hasDifferentFeatures(properties)

  return (
    <main className="min-h-screen bg-[#F7F3EE] px-5 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/properties"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#6B4C3B] transition hover:text-black"
          >
            <ArrowLeft className="h-4 w-4" />
            Kthehu te pronat
          </Link>

          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#6B4C3B]">
            Krahasimi
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-black md:text-5xl">
            Krahaso pronat
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-black/55">
            Shikoni karakteristikat kryesore të
            pronave të zgjedhura në një pamje të
            vetme.
          </p>

          <p className="mt-2 text-sm text-black/40">
            {properties.length} prona në krahasim
          </p>
        </div>

        {/* Comparison context */}
        <ComparisonContext
          properties={properties}
        />

        {/* Detailed comparison */}
        <div className="overflow-x-auto overflow-hidden rounded-3xl border border-[#6B4C3B]/10 bg-white shadow-sm">
          <div
            className="min-w-[900px]"
            style={
              {
                '--property-count':
                  properties.length,
              } as React.CSSProperties
            }
          >
            {/* Property headers */}
            <div className="grid grid-cols-[180px_repeat(var(--property-count),minmax(180px,1fr))] border-b border-[#6B4C3B]/10">
              <div className="bg-[#F7F3EE] px-5 py-5">
                <span className="text-sm font-semibold text-[#6B4C3B]">
                  Prona
                </span>
              </div>

              {properties.map((property) => (
                <div
                  key={property.id}
                  className="border-l border-[#6B4C3B]/10 p-4"
                >
                  <Link
                    href={`/properties/${property.slug}`}
                    className="group block"
                  >
                    <div className="mb-4 h-40 overflow-hidden rounded-2xl bg-[#F3E9E0]">
                      {property.primary_image_url ? (
                        <img
                          src={
                            property.primary_image_url
                          }
                          alt={property.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-black/30">
                          Pa imazh
                        </div>
                      )}
                    </div>

                    <h2 className="line-clamp-2 text-base font-bold text-black transition-colors group-hover:text-[#6B4C3B]">
                      {property.title}
                    </h2>

                    <p className="mt-1 text-sm text-black/50">
                      {property.neighborhood ||
                        property.city ||
                        '—'}
                    </p>
                  </Link>
                </div>
              ))}
            </div>

            <CompareInsights
            properties={properties.map((property) => ({
                id: property.id,
                title: property.title,
            }))}
            />

            {/* ====================================================== */}
            {/* SUMMARY */}
            {/* ====================================================== */}

            <ComparisonSection
              title="Përmbledhje"
              description="Karakteristikat kryesore për një krahasim të shpejtë."
            >
              {/* Price */}
              <ComparisonRow
                label="Çmimi"
                highlighted={hasDifferentValues(
                  properties,
                  (property) =>
                    `${property.price}|${property.listing_type}`,
                )}
              >
                {properties.map((property) => (
                  <PropertyCell key={property.id}>
                    <span className="font-bold text-black">
                      {formatPrice(
                        property.price,
                        property.listing_type,
                      )}
                    </span>
                  </PropertyCell>
                ))}
              </ComparisonRow>

              {/* Price per m² */}
              <ComparisonRow
                label="Çmimi / m²"
                highlighted={hasDifferentValues(
                  properties,
                  (property) =>
                    property.price_per_m2,
                )}
              >
                {properties.map((property) => (
                  <PropertyCell key={property.id}>
                    {property.price_per_m2 !== null
                      ? `€${property.price_per_m2.toLocaleString()} / m²`
                      : '—'}
                  </PropertyCell>
                ))}
              </ComparisonRow>

              {/* Area */}
              <ComparisonRow
                label="Sipërfaqja"
                highlighted={hasDifferentValues(
                  properties,
                  (property) =>
                    property.area,
                )}
              >
                {properties.map((property) => (
                  <PropertyCell key={property.id}>
                    {property.area !== null
                      ? `${formatNumber(property.area)} m²`
                      : '—'}
                  </PropertyCell>
                ))}
              </ComparisonRow>

              {/* Bedrooms */}
              <ComparisonRow
                label="Dhoma gjumi"
                highlighted={hasDifferentValues(
                  properties,
                  (property) =>
                    property.bedrooms,
                )}
              >
                {properties.map((property) => (
                  <PropertyCell key={property.id}>
                    {formatNumber(
                      property.bedrooms,
                    )}
                  </PropertyCell>
                ))}
              </ComparisonRow>

              {/* Bathrooms */}
              <ComparisonRow
                label="Banjo"
                highlighted={hasDifferentValues(
                  properties,
                  (property) =>
                    property.bathrooms,
                )}
              >
                {properties.map((property) => (
                  <PropertyCell key={property.id}>
                    {formatNumber(
                      property.bathrooms,
                    )}
                  </PropertyCell>
                ))}
              </ComparisonRow>

              {/* City */}
              <ComparisonRow
                label="Qyteti"
                highlighted={hasDifferentValues(
                  properties,
                  (property) =>
                    property.city,
                )}
              >
                {properties.map((property) => (
                  <PropertyCell key={property.id}>
                    {property.city || '—'}
                  </PropertyCell>
                ))}
              </ComparisonRow>
            </ComparisonSection>

            {/* ====================================================== */}
            {/* PROPERTY DETAILS */}
            {/* ====================================================== */}

            <ComparisonSection
              title="Detajet e pronës"
              description="Informacion më i detajuar rreth llojit dhe gjendjes së pronës."
            >
              {/* Listing type */}
              <ComparisonRow
                label="Tipi i listimit"
                highlighted={hasDifferentValues(
                  properties,
                  (property) =>
                    property.listing_type,
                )}
              >
                {properties.map((property) => (
                  <PropertyCell key={property.id}>
                    {property.listing_type === 'rent'
                      ? 'Me qira'
                      : 'Në shitje'}
                  </PropertyCell>
                ))}
              </ComparisonRow>

              {/* Property type */}
              <ComparisonRow
                label="Lloji i pronës"
                highlighted={hasDifferentValues(
                  properties,
                  (property) =>
                    property.property_type,
                )}
              >
                {properties.map((property) => (
                  <PropertyCell key={property.id}>
                    {formatText(
                      property.property_type,
                    )}
                  </PropertyCell>
                ))}
              </ComparisonRow>

              {/* Neighborhood */}
              <ComparisonRow
                label="Lagjja"
                highlighted={hasDifferentValues(
                  properties,
                  (property) =>
                    property.neighborhood,
                )}
              >
                {properties.map((property) => (
                  <PropertyCell key={property.id}>
                    {property.neighborhood || '—'}
                  </PropertyCell>
                ))}
              </ComparisonRow>

              {/* Location */}
              <ComparisonRow
                label="Lokacioni"
                highlighted={hasDifferentValues(
                  properties,
                  (property) =>
                    property.location,
                )}
              >
                {properties.map((property) => (
                  <PropertyCell key={property.id}>
                    {property.location || '—'}
                  </PropertyCell>
                ))}
              </ComparisonRow>

              {/* Balconies */}
              <ComparisonRow
                label="Ballkone"
                highlighted={hasDifferentValues(
                  properties,
                  (property) =>
                    property.balconies,
                )}
              >
                {properties.map((property) => (
                  <PropertyCell key={property.id}>
                    {formatNumber(
                      property.balconies,
                    )}
                  </PropertyCell>
                ))}
              </ComparisonRow>

              {/* Floor */}
              <ComparisonRow
                label="Kati"
                highlighted={hasDifferentValues(
                  properties,
                  (property) =>
                    `${property.floor}|${property.total_floors}`,
                )}
              >
                {properties.map((property) => (
                  <PropertyCell key={property.id}>
                    {formatNumber(
                      property.floor,
                    )}

                    {property.total_floors !== null &&
                      ` / ${property.total_floors}`}
                  </PropertyCell>
                ))}
              </ComparisonRow>

              {/* Year built */}
              <ComparisonRow
                label="Viti i ndërtimit"
                highlighted={hasDifferentValues(
                  properties,
                  (property) =>
                    property.year_built,
                )}
              >
                {properties.map((property) => (
                  <PropertyCell key={property.id}>
                    {formatNumber(
                      property.year_built,
                    )}
                  </PropertyCell>
                ))}
              </ComparisonRow>

              {/* Renovation year */}
              <ComparisonRow
                label="Viti i renovimit"
                highlighted={hasDifferentValues(
                  properties,
                  (property) =>
                    property.renovation_year,
                )}
              >
                {properties.map((property) => (
                  <PropertyCell key={property.id}>
                    {formatNumber(
                      property.renovation_year,
                    )}
                  </PropertyCell>
                ))}
              </ComparisonRow>

              {/* Condition */}
              <ComparisonRow
                label="Gjendja"
                highlighted={hasDifferentValues(
                  properties,
                  (property) =>
                    property.condition,
                )}
              >
                {properties.map((property) => (
                  <PropertyCell key={property.id}>
                    {formatText(
                      property.condition,
                    )}
                  </PropertyCell>
                ))}
              </ComparisonRow>

              {/* Orientation */}
              <ComparisonRow
                label="Orientimi"
                highlighted={hasDifferentValues(
                  properties,
                  (property) =>
                    property.orientation,
                )}
              >
                {properties.map((property) => (
                  <PropertyCell key={property.id}>
                    {formatText(
                      property.orientation,
                    )}
                  </PropertyCell>
                ))}
              </ComparisonRow>

              {/* Furnished */}
              <ComparisonRow
                label="Mobilimi"
                highlighted={hasDifferentValues(
                  properties,
                  (property) =>
                    property.furnished,
                )}
              >
                {properties.map((property) => (
                  <PropertyCell key={property.id}>
                    {formatText(
                      property.furnished,
                    )}
                  </PropertyCell>
                ))}
              </ComparisonRow>

              {/* Energy class */}
              <ComparisonRow
                label="Klasa energjetike"
                highlighted={hasDifferentValues(
                  properties,
                  (property) =>
                    property.energy_class,
                )}
              >
                {properties.map((property) => (
                  <PropertyCell key={property.id}>
                    {property.energy_class || '—'}
                  </PropertyCell>
                ))}
              </ComparisonRow>
            </ComparisonSection>

            {/* ====================================================== */}
            {/* AMENITIES */}
            {/* ====================================================== */}

            <ComparisonSection
              title="Pajisje dhe komoditete"
              description="Pajisjet dhe shërbimet e disponueshme në secilën pronë."
            >
              {/* Elevator */}
              <ComparisonRow
                label="Ashensor"
                highlighted={hasDifferentValues(
                  properties,
                  (property) =>
                    property.has_elevator,
                )}
              >
                {properties.map((property) => (
                  <PropertyCell key={property.id}>
                    <BooleanValue
                      value={
                        property.has_elevator
                      }
                    />
                  </PropertyCell>
                ))}
              </ComparisonRow>

              {/* Parking */}
              <ComparisonRow
                label="Parking"
                highlighted={hasDifferentValues(
                  properties,
                  (property) =>
                    property.has_parking,
                )}
              >
                {properties.map((property) => (
                  <PropertyCell key={property.id}>
                    <BooleanValue
                      value={
                        property.has_parking
                      }
                    />
                  </PropertyCell>
                ))}
              </ComparisonRow>

              {/* Garden */}
              <ComparisonRow
                label="Kopsht"
                highlighted={hasDifferentValues(
                  properties,
                  (property) =>
                    property.has_garden,
                )}
              >
                {properties.map((property) => (
                  <PropertyCell key={property.id}>
                    <BooleanValue
                      value={
                        property.has_garden
                      }
                    />
                  </PropertyCell>
                ))}
              </ComparisonRow>

              {/* Pool */}
              <ComparisonRow
                label="Pishinë"
                highlighted={hasDifferentValues(
                  properties,
                  (property) =>
                    property.has_pool,
                )}
              >
                {properties.map((property) => (
                  <PropertyCell key={property.id}>
                    <BooleanValue
                      value={property.has_pool}
                    />
                  </PropertyCell>
                ))}
              </ComparisonRow>

              {/* Air conditioning */}
              <ComparisonRow
                label="Kondicioner"
                highlighted={hasDifferentValues(
                  properties,
                  (property) =>
                    property.has_air_conditioning,
                )}
              >
                {properties.map((property) => (
                  <PropertyCell key={property.id}>
                    <BooleanValue
                      value={
                        property.has_air_conditioning
                      }
                    />
                  </PropertyCell>
                ))}
              </ComparisonRow>

              {/* Heating */}
              <ComparisonRow
                label="Ngrohje"
                highlighted={hasDifferentValues(
                  properties,
                  (property) =>
                    property.has_heating,
                )}
              >
                {properties.map((property) => (
                  <PropertyCell key={property.id}>
                    <BooleanValue
                      value={property.has_heating}
                    />
                  </PropertyCell>
                ))}
              </ComparisonRow>

              {/* Security */}
              <ComparisonRow
                label="Siguri"
                highlighted={hasDifferentValues(
                  properties,
                  (property) =>
                    property.has_security,
                )}
              >
                {properties.map((property) => (
                  <PropertyCell key={property.id}>
                    <BooleanValue
                      value={
                        property.has_security
                      }
                    />
                  </PropertyCell>
                ))}
              </ComparisonRow>

              {/* Internet */}
              <ComparisonRow
                label="Internet"
                highlighted={hasDifferentValues(
                  properties,
                  (property) =>
                    property.has_internet,
                )}
              >
                {properties.map((property) => (
                  <PropertyCell key={property.id}>
                    <BooleanValue
                      value={
                        property.has_internet
                      }
                    />
                  </PropertyCell>
                ))}
              </ComparisonRow>
            </ComparisonSection>

            {/* ====================================================== */}
            {/* FEATURES */}
            {/* ====================================================== */}

            <ComparisonSection
              title="Veçori të tjera"
              description="Karakteristika shtesë të deklaruara për secilën pronë."
            >
              <ComparisonRow
                label="Veçori"
                highlighted={differentFeatures}
              >
                {properties.map((property) => (
                  <PropertyCell key={property.id}>
                    {property.features.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {property.features.map(
                          (feature: string) => {
                            const isCommon =
                              commonFeatures.some(
                                (commonFeature) =>
                                  commonFeature
                                    .trim()
                                    .toLowerCase() ===
                                  feature
                                    .trim()
                                    .toLowerCase(),
                              )

                            return (
                              <span
                                key={feature}
                                className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-medium ${
                                  isCommon
                                    ? 'border-[#6B4C3B]/10 bg-[#F3E9E0] text-[#6B4C3B]'
                                    : 'border-[#6B4C3B]/20 bg-white text-[#6B4C3B]'
                                }`}
                              >
                                {formatText(
                                  feature,
                                )}
                              </span>
                            )
                          },
                        )}
                      </div>
                    ) : (
                      '—'
                    )}
                  </PropertyCell>
                ))}
              </ComparisonRow>

              {differentFeatures &&
                commonFeatures.length > 0 && (
                  <div className="border-b border-[#6B4C3B]/10 bg-[#FCFAF8] px-5 py-4">
                    <p className="text-xs leading-relaxed text-black/45">
                      Veçoritë me sfond të plotë janë
                      të përbashkëta për të gjitha
                      pronat. Veçoritë e tjera
                      dallojnë mes pronave.
                    </p>
                  </div>
                )}
            </ComparisonSection>
          </div>
        </div>
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
          Zgjidhni të paktën dy prona nga lista e
          pronave për të filluar krahasimin.
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