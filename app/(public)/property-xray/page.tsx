import Link from 'next/link'
import { notFound } from 'next/navigation'

import {
  getPropertyBySlug,
} from '@/lib/db/queries/queries'

import { PropertyXRay } from '@/components/property-xray/PropertyXRay'

import type {
  PropertyXRayContext,
} from '@/lib/property-xray/types'

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
  const { property: slug } =
    await searchParams

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

  const property =
    await getPropertyBySlug(slug)

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

    price: Number(property.price),

    city: property.city ?? null,

    neighborhood:
      property.neighborhood ?? null,

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

    features:
      Array.isArray(property.features)
        ? property.features
        : [],

    /*
     * Only TRUE is treated as confirmed.
     * FALSE becomes null because the current database
     * fields cannot reliably distinguish "explicitly no"
     * from "not supplied".
     */
    hasParking:
      property.has_parking === true
        ? true
        : null,

    hasHeating:
      property.has_heating === true
        ? true
        : null,

    hasElevator:
      property.has_elevator === true
        ? true
        : null,

    furnished:
      property.furnished ?? null,

    energyClass:
      property.energy_class ?? null,
  }

  return (
    <main className="min-h-screen bg-[#F7F3EE] pt-24">
      <PropertyXRay
        property={context}
      />
    </main>
  )
}