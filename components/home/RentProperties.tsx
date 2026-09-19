'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { PropertyImage } from '@/components/shared/PropertyImage'

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

const ITEMS_PER_PAGE = 3

export function RentProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)

  useEffect(() => {
    fetch('/api/properties/rent')
      .then((res) => res.json())
      .then((data) => {
        setProperties(data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white/5 rounded-2xl overflow-hidden border border-white/5 animate-pulse"
          >
            <div className="h-56 bg-white/5" />
          </div>
        ))}
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/5">
        <div className="text-6xl mb-4">🔑</div>
        <p className="text-white/60 text-lg">Nuk ka prona me qira</p>
      </div>
    )
  }

  const totalPages = Math.ceil(properties.length / ITEMS_PER_PAGE)
  const visible = properties.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  )

  return (
    <div>
      {totalPages > 1 && (
        <div className="flex justify-end gap-2 mb-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="p-3 rounded-full border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 transition disabled:opacity-30 text-white"
          >
            ←
          </button>
          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
            }
            disabled={currentPage === totalPages - 1}
            className="p-3 rounded-full border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 transition disabled:opacity-30 text-white"
          >
            →
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visible.map((property) => (
          <Link
            key={property.id}
            href={`/properties/${property.slug}`}
            className="group relative bg-white/5 rounded-2xl overflow-hidden border border-white/5 hover:border-blue-500/30 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            <div className="relative h-56 overflow-hidden">
              <PropertyImage
                src={property.primary_image_url}
                alt={property.title}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

              <div className="absolute top-4 left-4">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-500 text-white shadow-lg">
                  Me Qira
                </span>
              </div>

              <div className="absolute bottom-4 left-4">
                <span className="px-3 py-1.5 text-sm font-bold rounded-lg bg-white/95 backdrop-blur-sm text-gray-900 shadow-lg">
                  €{Number(property.price).toLocaleString()}
                  <span className="text-xs font-normal text-gray-500">
                    {' '}
                    /muaj
                  </span>
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
    </div>
  )
}