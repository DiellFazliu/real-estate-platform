import Link from 'next/link'
import { MapPin, BedDouble, Bath, Maximize, Star } from 'lucide-react'
import { getAgentAllProperties } from '@/lib/db/queries/agent'

export default async function AgentPropertiesPage() {
  const properties = await getAgentAllProperties()

  return (
    <div className="p-8 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-[#6B4C3B]">
          Pronat
        </p>

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="font-serif text-4xl text-[#171310]">
              Të gjitha pronat
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Shfleto të gjitha pronat në platformën Villaron.
            </p>
          </div>

          <div className="rounded-full bg-white px-4 py-2 text-sm text-gray-600 shadow-sm">
            {properties.length} prona
          </div>
        </div>
      </div>

      {/* Properties */}
      {properties.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
          <p className="text-gray-500">
            Nuk ka prona për momentin.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {properties.map((property) => (
            <Link
              key={property.id}
              href={`/properties/${property.slug}`}
              className="group overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Image placeholder */}
              <div className="relative flex h-52 items-center justify-center bg-[#E9DDD3]">
                <span className="font-serif text-2xl text-[#6B4C3B]/50">
                  Villaron
                </span>

                <div className="absolute left-4 top-4 flex gap-2">
                  {property.featured && (
                    <span className="rounded-full bg-[#B89548] px-3 py-1 text-xs font-semibold text-white">
                      ⭐ Featured
                    </span>
                  )}

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      property.listing_type === 'rent'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {property.listing_type === 'rent'
                      ? 'Me Qira'
                      : 'Në Shitje'}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <div className="mb-2 flex items-start justify-between gap-4">
                  <h2 className="line-clamp-1 font-serif text-xl text-[#171310]">
                    {property.title}
                  </h2>

                  <span className="shrink-0 text-lg font-semibold text-[#6B4C3B]">
                    €{Number(property.price).toLocaleString()}
                  </span>
                </div>

                <div className="mb-4 flex items-center gap-1 text-sm text-gray-500">
                  <MapPin size={15} />
                  <span>
                    {property.location || property.city || 'Lokacion i panjohur'}
                  </span>
                </div>

                <div className="flex items-center gap-4 border-t border-gray-100 pt-4 text-xs text-gray-500">
                  {property.bedrooms != null && (
                    <span className="flex items-center gap-1">
                      <BedDouble size={15} />
                      {property.bedrooms}
                    </span>
                  )}

                  {property.bathrooms != null && (
                    <span className="flex items-center gap-1">
                      <Bath size={15} />
                      {property.bathrooms}
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
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}