import Link from 'next/link'
import { getFeaturedProperties } from '@/lib/db/queries'

export async function FeaturedProperties() {
  const properties = await getFeaturedProperties(3)

  if (properties.length === 0) {
    return (
      <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/5">
        <div className="text-6xl mb-4">🏠</div>
        <p className="text-white/60 text-lg">
          Nuk ka prona të zgjedhura
        </p>
      </div>
    )
  }

  return (
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
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="badge badge-featured">⭐ Featured</span>
              <span
                className={`badge ${
                  property.listing_type === 'rent' ? 'badge-rent' : 'badge-sale'
                }`}
              >
                {property.listing_type === 'rent' ? 'Me Qira' : 'Në Shitje'}
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
  )
}