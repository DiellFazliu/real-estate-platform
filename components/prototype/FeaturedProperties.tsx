'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Property {
  id: number
  slug: string
  title: string
  price: number
  city: string | null
  neighborhood: string | null
  bedrooms: number | null
  bathrooms: number | null
  area: number | null
  primary_image_url: string | null
  listing_type: string
}

export function FeaturedProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProperties() {
      try {
        const response = await fetch('/api/properties/featured')
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        setProperties(data || [])
      } catch (error) {
        console.error('Error fetching properties:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProperties()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white/5 rounded-2xl h-96 animate-pulse" />
        ))}
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/40">No featured properties yet.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
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
              {/* Featured */}
              <span className="rounded-full bg-[#C9A227] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-white shadow-sm">
                Featured
              </span>

              {/* Listing type */}
              <span
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide shadow-sm ${property.listing_type === 'rent'
                    ? 'bg-[#F3E9E0] text-[#6B4C3B]'
                    : 'bg-[#6B4C3B] text-white'
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
  )
}