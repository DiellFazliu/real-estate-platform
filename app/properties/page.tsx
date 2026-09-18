import Link from 'next/link'
import { getAllProperties } from '@/lib/db/queries'

interface Props {
  searchParams: Promise<{
    q?: string
    city?: string
    minPrice?: string
    maxPrice?: string
    bedrooms?: string
    type?: string
  }>
}

export default async function PropertiesPage({ searchParams }: Props) {
  const params = await searchParams

  const { properties, total } = await getAllProperties({
    q: params.q,
    city: params.city,
    minPrice: params.minPrice ? parseFloat(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : undefined,
    bedrooms: params.bedrooms ? parseInt(params.bedrooms) : undefined,
    listingType: params.type,
    take: 24,
  })

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20">
      <div className="container-page py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {params.q ? `Kërkim: "${params.q}"` : 'Të Gjitha Pronat'}
          </h1>
          <p className="text-white/40">
            {total} {total === 1 ? 'pronë' : 'prona'} u gjetën
          </p>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5">
            <p className="text-white/40 text-lg mb-4">Asnjë pronë nuk u gjet</p>
            <Link href="/" className="btn btn-primary">
              Kthehu në Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property: any) => (
              <Link
                key={property.id}
                href={`/properties/${property.slug}`}
                className="property-card group"
              >
                <div className="relative h-56 overflow-hidden">
                  {property.primary_image_url ? (
                    <img
                      src={property.primary_image_url}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                      <span className="text-4xl">🏠</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span
                      className={`badge ${
                        property.listing_type === 'rent'
                          ? 'badge-rent'
                          : 'badge-sale'
                      }`}
                    >
                      {property.listing_type === 'rent'
                        ? 'Me Qira'
                        : 'Në Shitje'}
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1.5 text-sm font-bold rounded-lg bg-white/95 backdrop-blur-sm text-gray-900 shadow-lg">
                      €{property.price.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-blue-400 transition">
                    {property.title}
                  </h3>
                  <p className="text-white/50 text-sm mb-4 flex items-center gap-1">
                    <span>📍</span>
                    {property.neighborhood && `${property.neighborhood}, `}
                    {property.city}
                  </p>
                  <div className="flex items-center gap-4 pt-4 border-t border-white/5 text-sm text-white/50">
                    {property.bedrooms && <span>🛏️ {property.bedrooms}</span>}
                    {property.bathrooms && <span>🚿 {property.bathrooms}</span>}
                    {property.area && <span>📐 {property.area}m²</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}