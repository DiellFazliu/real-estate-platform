import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { ReviewDecisionForm } from '@/components/owner/ReviewDecisionForm'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { client } from '@/lib/sanity/client'

type PageProps = {
  params: Promise<{ id: string }>
}

type SanityPropertyDetails = {
  description?: string
  listingType?: string
  images?: string[]
}

function formatLabel(value?: string | null) {
  return value ? value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : 'Not specified'
}

export default async function PropertyReviewPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (
    !['OWNER', 'ADMIN'].includes(session.user.role) ||
    (!session.user.permissions?.includes('properties:review') && session.user.role !== 'ADMIN')
  ) redirect('/')

  const { id } = await params
  const propertyId = Number(id)
  if (!Number.isSafeInteger(propertyId) || propertyId <= 0) notFound()

  const property = await prisma.property.findFirst({
    where: { id: propertyId, review_status: 'PENDING_REVIEW' },
    include: { listed_by: { select: { name: true, email: true } } },
  })

  if (!property) notFound()

  let details: SanityPropertyDetails | null = null
  try {
    details = await client.fetch(
      `*[_type == "property" && _id == $id][0] {
        description,
        listingType,
        "images": images[].asset->url
      }`,
      { id: property.sanity_id },
    )
  } catch (error) {
    console.error('Unable to load property review details from Sanity:', error)
  }

  const location = [property.location, property.city].filter(Boolean).join(', ')

  return (
    <main className="min-h-screen bg-[#F7F3EE]">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Link href="/owner/properties/pending" className="text-sm font-medium text-[#6B4C3B] hover:underline">
          ← Back to pending reviews
        </Link>

        <div className="mt-5 overflow-hidden rounded-2xl border border-[#E8DDD2] bg-white shadow-sm">
          {details?.images && details.images.length > 0 && (
            <div className="flex gap-3 overflow-x-auto bg-[#F3E9E0] p-4">
              {details.images.map((image, index) => (
                <img
                  key={`${image}-${index}`}
                  src={image}
                  alt={`${property.title} ${index + 1}`}
                  className="h-52 w-72 shrink-0 rounded-lg object-cover"
                />
              ))}
            </div>
          )}

          <div className="p-6">
            <p className="text-sm font-medium text-[#8B6B5A]">Pending review</p>
            <h1 className="mt-1 text-3xl font-bold text-black">{property.title}</h1>
            <p className="mt-2 text-2xl font-semibold text-[#6B4C3B]">€{Number(property.price).toLocaleString()}</p>

            <dl className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div><dt className="text-sm text-[#8B6B5A]">Location</dt><dd className="mt-1 font-medium text-black">{location || 'Not specified'}</dd></div>
              <div><dt className="text-sm text-[#8B6B5A]">Seller</dt><dd className="mt-1 font-medium text-black">{property.listed_by?.name || property.listed_by?.email || 'Unknown seller'}</dd></div>
              <div><dt className="text-sm text-[#8B6B5A]">Property type</dt><dd className="mt-1 font-medium text-black">{formatLabel(property.property_type)}</dd></div>
              <div><dt className="text-sm text-[#8B6B5A]">Listing type</dt><dd className="mt-1 font-medium text-black">{formatLabel(details?.listingType)}</dd></div>
              <div><dt className="text-sm text-[#8B6B5A]">Bedrooms</dt><dd className="mt-1 font-medium text-black">{property.bedrooms ?? 'Not specified'}</dd></div>
              <div><dt className="text-sm text-[#8B6B5A]">Bathrooms</dt><dd className="mt-1 font-medium text-black">{property.bathrooms ?? 'Not specified'}</dd></div>
              <div><dt className="text-sm text-[#8B6B5A]">Area</dt><dd className="mt-1 font-medium text-black">{property.area ? `${property.area} m²` : 'Not specified'}</dd></div>
            </dl>

            <section className="mt-7 border-t border-[#E8DDD2] pt-5">
              <h2 className="font-semibold text-black">Description</h2>
              <p className="mt-2 whitespace-pre-line text-[#6B4C3B]/75">{details?.description || 'No description provided.'}</p>
            </section>
          </div>
        </div>

        <div className="mt-6">
          <ReviewDecisionForm propertyId={property.id} />
        </div>
      </div>
    </main>
  )
}
