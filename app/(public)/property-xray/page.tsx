import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getPropertyBySlug } from '@/lib/db/queries/queries'
import { PropertyXRay } from '@/components/property-xray/PropertyXRay'
import type { PropertyXRayContext } from '@/lib/property-xray/types'

export const metadata = {
  title: 'Property X-Ray | Villaron',
  description:
    'Analizë e listing-ut për përgatitje para vizitës dhe negocimit.',
}

type Props = {
  searchParams: Promise<{
    property?: string
  }>
}

export default async function PropertyXRayPage({
  searchParams,
}: Props) {
  const { property: slug } = await searchParams

  if (!slug) {
    return (
      <main className="min-h-screen bg-[#F7F3EE] pt-28">
        <div className="mx-auto max-w-xl px-6 text-center">
          <h1 className="text-3xl font-bold">
            Zgjidh një pronë për analizë
          </h1>

          <p className="mt-3 text-black/60">
            Property X-Ray punon me të dhënat e
            listing-ut në Villaron.
          </p>

          <Link
            href="/properties"
            className="mt-6 inline-flex rounded-xl bg-black px-5 py-3 font-semibold text-white"
          >
            Shfleto pronat
          </Link>
        </div>
      </main>
    )
  }

  const property = await getPropertyBySlug(slug)

  if (
    !property ||
    property.status !== 'PUBLISHED'
  ) {
    notFound()
  }

  const context: PropertyXRayContext = {
    slug: property.slug,
    title: property.title,

    listingType:
      property.listing_type === 'rent'
        ? 'rent'
        : 'sale',

    propertyType:
      property.property_type ?? 'unknown',

    price: Number(property.price),

    city: property.city ?? null,

    neighborhood:
      property.neighborhood ?? null,

    location:
      property.location ?? null,

    postalCode:
      property.postal_code ?? null,

    area:
      property.area !== null &&
      property.area !== undefined
        ? Number(property.area)
        : null,

    bedrooms:
      property.bedrooms !== null &&
      property.bedrooms !== undefined
        ? Number(property.bedrooms)
        : null,

    bathrooms:
      property.bathrooms !== null &&
      property.bathrooms !== undefined
        ? Number(property.bathrooms)
        : null,

    balconies:
      property.balconies !== null &&
      property.balconies !== undefined
        ? Number(property.balconies)
        : null,

    floor:
      property.floor !== null &&
      property.floor !== undefined
        ? Number(property.floor)
        : null,

    totalFloors:
      property.total_floors !== null &&
      property.total_floors !== undefined
        ? Number(property.total_floors)
        : null,

    yearBuilt:
      property.year_built !== null &&
      property.year_built !== undefined
        ? Number(property.year_built)
        : null,

    renovationYear:
      property.renovation_year !== null &&
      property.renovation_year !== undefined
        ? Number(property.renovation_year)
        : null,

    condition:
      property.condition ?? null,

    orientation:
      property.orientation ?? null,

    furnished:
      property.furnished ?? null,

    hasParking:
      Boolean(property.has_parking),

    hasHeating:
      Boolean(property.has_heating),

    hasElevator:
      Boolean(property.has_elevator),

    hasGarden:
      Boolean(property.has_garden),

    hasPool:
      Boolean(property.has_pool),

    hasAirConditioning:
      Boolean(property.has_air_conditioning),

    hasSecurity:
      Boolean(property.has_security),

    hasInternet:
      Boolean(property.has_internet),

    features:
      Array.isArray(property.features)
        ? property.features
        : [],

    energyClass:
      property.energy_class ?? null,
  }

  return (
    <main className="min-h-screen bg-[#F7F3EE] pt-24">
      <PropertyXRay property={context} />
    </main>
  )
}