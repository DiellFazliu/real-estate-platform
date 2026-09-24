import Link from 'next/link'
import { ArrowLeft, Check, X } from 'lucide-react'
import { prisma } from '@/lib/db/prisma'

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
        .filter((id) => Number.isInteger(id) && id > 0),
    ),
  ).slice(0, 4)
}

function formatPrice(value: number, listingType: string) {
  const formatted = `€${value.toLocaleString()}`

  return listingType === 'rent' ? `${formatted} / muaj` : formatted
}

function formatNumber(value: number | null) {
  if (value === null || value === undefined) return '—'

  return String(value)
}

function formatText(value: string | null) {
  if (!value) return '—'

  return value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function BooleanValue({ value }: { value: boolean }) {
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

function ComparisonRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[180px_repeat(var(--property-count),minmax(180px,1fr))] border-b border-[#6B4C3B]/10">
      <div className="bg-[#F7F3EE] px-5 py-4 text-sm font-semibold text-[#6B4C3B]">
        {label}
      </div>

      {children}
    </div>
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

  const dbProperties = await prisma.property.findMany({
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
    .map((id) => dbProperties.find((property) => property.id === id))
    .filter((property): property is NonNullable<typeof property> => Boolean(property))
    .map((property) => ({
      ...property,
      price: Number(property.price),
      price_per_m2:
        property.price_per_m2 !== null
          ? Number(property.price_per_m2)
          : null,
    }))

  if (properties.length === 0) {
    return <EmptyCompareState />
  }

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
            Shikoni karakteristikat kryesore të pronave të zgjedhura në
            një pamje të vetme.
          </p>

          <p className="mt-2 text-sm text-black/40">
            {properties.length}{' '}
            {properties.length === 1 ? 'pronë' : 'prona'} në krahasim
          </p>
        </div>

        {/* Comparison */}
        <div className="overflow-x-auto rounded-3xl border border-[#6B4C3B]/10 bg-white shadow-sm">
          <div
            className="min-w-[900px]"
            style={
              {
                '--property-count': properties.length,
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
                          src={property.primary_image_url}
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
                      {property.neighborhood || property.city || '—'}
                    </p>
                  </Link>
                </div>
              ))}
            </div>

            {/* Price */}
            <ComparisonRow label="Çmimi">
              {properties.map((property) => (
                <PropertyCell key={property.id}>
                  <span className="font-bold text-black">
                    {formatPrice(property.price, property.listing_type)}
                  </span>
                </PropertyCell>
              ))}
            </ComparisonRow>

            {/* Price per m² */}
            <ComparisonRow label="Çmimi / m²">
              {properties.map((property) => (
                <PropertyCell key={property.id}>
                  {property.price_per_m2 !== null
                    ? `€${property.price_per_m2.toLocaleString()} / m²`
                    : '—'}
                </PropertyCell>
              ))}
            </ComparisonRow>

            {/* Listing type */}
            <ComparisonRow label="Tipi i listimit">
              {properties.map((property) => (
                <PropertyCell key={property.id}>
                  {property.listing_type === 'rent'
                    ? 'Me qira'
                    : 'Në shitje'}
                </PropertyCell>
              ))}
            </ComparisonRow>

            {/* Property type */}
            <ComparisonRow label="Lloji i pronës">
              {properties.map((property) => (
                <PropertyCell key={property.id}>
                  {formatText(property.property_type)}
                </PropertyCell>
              ))}
            </ComparisonRow>

            {/* Location */}
            <ComparisonRow label="Qyteti">
              {properties.map((property) => (
                <PropertyCell key={property.id}>
                  {property.city || '—'}
                </PropertyCell>
              ))}
            </ComparisonRow>

            <ComparisonRow label="Lagjja">
              {properties.map((property) => (
                <PropertyCell key={property.id}>
                  {property.neighborhood || '—'}
                </PropertyCell>
              ))}
            </ComparisonRow>

            <ComparisonRow label="Lokacioni">
              {properties.map((property) => (
                <PropertyCell key={property.id}>
                  {property.location || '—'}
                </PropertyCell>
              ))}
            </ComparisonRow>

            {/* Core specs */}
            <ComparisonRow label="Sipërfaqja">
              {properties.map((property) => (
                <PropertyCell key={property.id}>
                  {property.area !== null
                    ? `${formatNumber(property.area)} m²`
                    : '—'}
                </PropertyCell>
              ))}
            </ComparisonRow>

            <ComparisonRow label="Dhoma gjumi">
              {properties.map((property) => (
                <PropertyCell key={property.id}>
                  {formatNumber(property.bedrooms)}
                </PropertyCell>
              ))}
            </ComparisonRow>

            <ComparisonRow label="Banjo">
              {properties.map((property) => (
                <PropertyCell key={property.id}>
                  {formatNumber(property.bathrooms)}
                </PropertyCell>
              ))}
            </ComparisonRow>

            <ComparisonRow label="Ballkone">
              {properties.map((property) => (
                <PropertyCell key={property.id}>
                  {formatNumber(property.balconies)}
                </PropertyCell>
              ))}
            </ComparisonRow>

            <ComparisonRow label="Kati">
              {properties.map((property) => (
                <PropertyCell key={property.id}>
                  {formatNumber(property.floor)}
                  {property.total_floors !== null &&
                    ` / ${property.total_floors}`}
                </PropertyCell>
              ))}
            </ComparisonRow>

            {/* Property details */}
            <ComparisonRow label="Viti i ndërtimit">
              {properties.map((property) => (
                <PropertyCell key={property.id}>
                  {formatNumber(property.year_built)}
                </PropertyCell>
              ))}
            </ComparisonRow>

            <ComparisonRow label="Viti i renovimit">
              {properties.map((property) => (
                <PropertyCell key={property.id}>
                  {formatNumber(property.renovation_year)}
                </PropertyCell>
              ))}
            </ComparisonRow>

            <ComparisonRow label="Gjendja">
              {properties.map((property) => (
                <PropertyCell key={property.id}>
                  {formatText(property.condition)}
                </PropertyCell>
              ))}
            </ComparisonRow>

            <ComparisonRow label="Orientimi">
              {properties.map((property) => (
                <PropertyCell key={property.id}>
                  {formatText(property.orientation)}
                </PropertyCell>
              ))}
            </ComparisonRow>

            <ComparisonRow label="Mobilimi">
              {properties.map((property) => (
                <PropertyCell key={property.id}>
                  {formatText(property.furnished)}
                </PropertyCell>
              ))}
            </ComparisonRow>

            <ComparisonRow label="Klasa energjetike">
              {properties.map((property) => (
                <PropertyCell key={property.id}>
                  {property.energy_class || '—'}
                </PropertyCell>
              ))}
            </ComparisonRow>

            {/* Features */}
            <ComparisonRow label="Ashensor">
              {properties.map((property) => (
                <PropertyCell key={property.id}>
                  <BooleanValue value={property.has_elevator} />
                </PropertyCell>
              ))}
            </ComparisonRow>

            <ComparisonRow label="Parking">
              {properties.map((property) => (
                <PropertyCell key={property.id}>
                  <BooleanValue value={property.has_parking} />
                </PropertyCell>
              ))}
            </ComparisonRow>

            <ComparisonRow label="Kopsht">
              {properties.map((property) => (
                <PropertyCell key={property.id}>
                  <BooleanValue value={property.has_garden} />
                </PropertyCell>
              ))}
            </ComparisonRow>

            <ComparisonRow label="Pishinë">
              {properties.map((property) => (
                <PropertyCell key={property.id}>
                  <BooleanValue value={property.has_pool} />
                </PropertyCell>
              ))}
            </ComparisonRow>

            <ComparisonRow label="Kondicioner">
              {properties.map((property) => (
                <PropertyCell key={property.id}>
                  <BooleanValue
                    value={property.has_air_conditioning}
                  />
                </PropertyCell>
              ))}
            </ComparisonRow>

            <ComparisonRow label="Ngrohje">
              {properties.map((property) => (
                <PropertyCell key={property.id}>
                  <BooleanValue value={property.has_heating} />
                </PropertyCell>
              ))}
            </ComparisonRow>

            <ComparisonRow label="Siguri">
              {properties.map((property) => (
                <PropertyCell key={property.id}>
                  <BooleanValue value={property.has_security} />
                </PropertyCell>
              ))}
            </ComparisonRow>

            <ComparisonRow label="Internet">
              {properties.map((property) => (
                <PropertyCell key={property.id}>
                  <BooleanValue value={property.has_internet} />
                </PropertyCell>
              ))}
            </ComparisonRow>

            {/* Features array */}
            <ComparisonRow label="Veçori të tjera">
              {properties.map((property) => (
                <PropertyCell key={property.id}>
                  {property.features.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                    {property.features.map((feature: string) => (
                        <span
                        key={feature}
                        className="inline-flex rounded-full border border-[#6B4C3B]/10 bg-[#F3E9E0] px-3 py-1.5 text-xs font-medium text-[#6B4C3B]"
                        >
                        {formatText(feature)}
                        </span>
                    ))}
                    </div>
                  ) : (
                    '—'
                  )}
                </PropertyCell>
              ))}
            </ComparisonRow>
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
          Zgjidhni të paktën një pronë nga lista e pronave për të
          filluar krahasimin.
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