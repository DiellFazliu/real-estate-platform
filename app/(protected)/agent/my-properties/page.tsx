import Link from 'next/link'
import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import {
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Eye,
  Plus,
  CalendarDays,
} from 'lucide-react'
import { getAgentProperties } from '@/lib/db/queries/agent'
import { PropertyImage } from '@/components/shared/PropertyImage'
import { ListingStatusActions } from '@/components/owner/ListingStatusActions'

export default async function MyPropertiesPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const properties = await getAgentProperties(Number(session.user.id))

  const activeCount = properties.filter(
    (p) =>
      p.status?.toLowerCase() === 'published' &&
      p.review_status === 'APPROVED',
  ).length

  const soldCount = properties.filter((p) => p.status === 'SOLD').length

  return (
    <div className="p-8 lg:p-10">
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-[#6B4C3B]">
            Menaxhimi
          </p>
          <h1 className="font-serif text-4xl text-[#171310]">
            Pronat e mia
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Menaxho pronat që janë të caktuara për ty.
          </p>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Gjithsej</p>
          <p className="mt-2 text-3xl font-semibold text-[#171310]">
            {properties.length}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Aktive</p>
          <p className="mt-2 text-3xl font-semibold text-green-600">
            {activeCount}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Të shitura</p>
          <p className="mt-2 text-3xl font-semibold text-[#6B4C3B]">
            {soldCount}
          </p>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F3E9E0]">
            <Plus className="text-[#6B4C3B]" />
          </div>
          <h2 className="font-serif text-2xl text-[#171310]">
            Nuk ke asnjë pronë
          </h2>
        </div>
      ) : (
        <div className="space-y-4">
          {properties.map((property) => {
            const isSold = property.status === 'SOLD'
            const isUnavailable = property.status === 'UNAVAILABLE'
            const canMarkSold =
              property.status === 'PUBLISHED' &&
              property.review_status === 'APPROVED'

            return (
              <div
                key={property.id}
                className={`rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md ${
                  isUnavailable ? 'opacity-60' : ''
                }`}
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                  <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-xl bg-[#F3E9E0] lg:w-40">
                    <PropertyImage
                      src={property.primary_image_url}
                      alt={property.title}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h2 className="font-serif text-xl text-[#171310]">
                        {property.title}
                      </h2>

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          property.listing_type === 'rent'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {property.listing_type === 'rent'
                          ? 'Me Qira'
                          : 'Në Shitje'}
                      </span>

                      {isSold && (
                        <span className="rounded-full bg-[#6B4C3B] px-2.5 py-1 text-xs font-bold text-white">
                          Shitur
                        </span>
                      )}

                      {isUnavailable && (
                        <span className="rounded-full bg-gray-200 px-2.5 py-1 text-xs font-bold text-gray-700">
                          E tërhequr
                        </span>
                      )}
                    </div>

                    <div className="mb-3 flex items-center gap-1 text-sm text-gray-500">
                      <MapPin size={14} />
                      {property.location || property.city || 'Pa lokacion'}
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      {property.bedrooms != null && (
                        <span className="flex items-center gap-1">
                          <BedDouble size={14} />
                          {property.bedrooms} dhoma
                        </span>
                      )}

                      {property.bathrooms != null && (
                        <span className="flex items-center gap-1">
                          <Bath size={14} />
                          {property.bathrooms} banjo
                        </span>
                      )}

                      {property.area != null && (
                        <span className="flex items-center gap-1">
                          <Maximize size={14} />
                          {property.area} m²
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="lg:text-right">
                    <p className="text-xl font-semibold text-[#6B4C3B]">
                      €{Number(property.price).toLocaleString()}
                    </p>
                    <p className="text-xs capitalize text-gray-400">
                      {isSold
                        ? 'Shitur'
                        : property.status === 'PUBLISHED'
                          ? 'Publikuar'
                          : property.status}
                    </p>
                  </div>

                  <div className="flex gap-2 lg:flex-col lg:w-48">
                    <Link
                      href={`/properties/${property.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
                    >
                      <Eye size={16} />
                      Shiko
                    </Link>

                    <Link
                      href="/agent/appointments"
                      className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
                    >
                      <CalendarDays size={16} />
                      Takimet
                    </Link>

                    {/* Agenti vetëm SOLD, nuk mund të tërheqë */}
                    {canMarkSold && (
                      <ListingStatusActions
                        propertyId={property.id}
                        propertyTitle={property.title}
                        action="mark"
                        restrictToSold
                      />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}