import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { PropertySubmitForm } from '@/components/seller/PropertySubmitForm'
import type { PropertyFormInitialData } from '@/components/seller/PropertySubmitForm'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { client } from '@/lib/sanity/client'

type PageProps = {
  params: Promise<{ id: string }>
}

type SanityPropertyEditData = {
  description?: string
  contactPhone?: string
  contactEmail?: string
  images?: Array<{
    assetId?: string
    url?: string
  }>
}

export default async function EditListingPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=/account/listings')

  const { id } = await params
  const propertyId = Number(id)
  if (!Number.isSafeInteger(propertyId) || propertyId <= 0) notFound()

  const userId = Number(session.user.id)

  const property = await prisma.property.findFirst({
    where: { id: propertyId, listed_by_id: userId },
  })

  if (!property) notFound()

  // Block editing while already under review — would create race conditions
  if (property.review_status === 'PENDING_REVIEW') {
    return (
      <main className="min-h-screen bg-[#F7F3EE] pt-20">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h1 className="font-serif text-3xl text-[#171310]">
            Nuk mund të editosh tani
          </h1>
          <p className="mt-3 text-sm text-gray-500">
            Kjo pronë është në pritje për review. Prisni përfundimin e
            review-t përpara se të bëni ndryshime.
          </p>
          <Link
            href="/account/listings"
            className="mt-6 inline-flex rounded-xl bg-[#6B4C3B] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#4A3328]"
          >
            Kthehu te listimet
          </Link>
        </div>
      </main>
    )
  }

  // Fetch description + contact + images from Sanity
  let sanityDetails: SanityPropertyEditData | null = null
  try {
    sanityDetails = await client.fetch(
      `*[_type == "property" && _id == $id][0] {
        description,
        contactPhone,
        contactEmail,
        "images": images[]{
          "assetId": asset->_id,
          "url": asset->url
        }
      }`,
      { id: property.sanity_id },
    )
  } catch (error) {
    console.error('Unable to load property for edit from Sanity:', error)
  }

  const initialData: PropertyFormInitialData = {
    id: property.id,
    title: property.title,
    description: sanityDetails?.description ?? '',
    price: Number(property.price),
    listingType: property.listing_type ?? 'sale',
    propertyType: property.property_type ?? '',
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    area: property.area,
    balconies: property.balconies,
    floor: property.floor,
    totalFloors: property.total_floors,
    yearBuilt: property.year_built,
    renovationYear: property.renovation_year,
    condition: property.condition,
    orientation: property.orientation,
    furnished: property.furnished,
    energyClass: property.energy_class,
    location: property.location,
    city: property.city,
    neighborhood: property.neighborhood,
    postalCode: property.postal_code,
    distanceFromCenter: property.distance_from_center
      ? Number(property.distance_from_center)
      : null,
    latitude: property.latitude ? Number(property.latitude) : null,
    longitude: property.longitude ? Number(property.longitude) : null,
    hasElevator: property.has_elevator,
    hasParking: property.has_parking,
    hasGarden: property.has_garden,
    hasPool: property.has_pool,
    hasAirConditioning: property.has_air_conditioning,
    hasHeating: property.has_heating,
    hasSecurity: property.has_security,
    hasInternet: property.has_internet,
    features: property.features ?? [],
    images: (sanityDetails?.images ?? [])
      .filter(
        (img): img is { assetId: string; url: string } =>
          typeof img.assetId === 'string' && typeof img.url === 'string',
      )
      .map((img) => ({ assetId: img.assetId, url: img.url })),
    contactPhone: sanityDetails?.contactPhone ?? '',
    contactEmail: sanityDetails?.contactEmail ?? '',
  }

  return (
    <main className="min-h-screen bg-[#F7F3EE] pt-20">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link
          href="/account/listings"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#6B4C3B] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Kthehu te listimet
        </Link>

        <div className="mt-5 mb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-[#6B4C3B]">
            Ndrysho listimin
          </p>
          <h1 className="font-serif text-4xl text-[#171310]">
            {property.title}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Pas ruajtjes, prona do të ridërgohet për review.
          </p>
        </div>

        {property.review_status === 'REJECTED' &&
          property.rejection_reason && (
            <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-red-700">
                Arsyeja e refuzimit të mëparshëm
              </p>
              <p className="mt-2 text-sm text-red-900">
                {property.rejection_reason}
              </p>
            </div>
          )}

        <PropertySubmitForm initialData={initialData} />
      </div>
    </main>
  )
}