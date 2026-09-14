'use client'

import { useState, useEffect } from 'react'
import { client } from '@/lib/sanity/client'
import { allPropertiesQuery } from '@/lib/sanity/queries'
import { PropertyCard } from './PropertyCard'
import { ITEMS_PER_PAGE } from '@/lib/constants'
import type { Property } from '@/lib/types'

export function RentProperties() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)

  useEffect(() => {
    async function fetchProperties() {
      try {
        const data = await client.fetch(allPropertiesQuery)
        setProperties(data || [])
      } catch (error) {
        console.error('Error fetching properties:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProperties()
  }, [])

  const totalPages = Math.ceil(properties.length / ITEMS_PER_PAGE)
  const visibleProperties = properties.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  )

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-[#6B4C3B]/60">Loading properties...</p>
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-[#6B4C3B]/60">No properties available yet.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visibleProperties.map((property) => (
          <PropertyCard
            key={property._id}
            _id={property._id}
            title={property.title}
            price={property.price}
            location={property.location}
            bedrooms={property.bedrooms}
            bathrooms={property.bathrooms}
            area={property.area}
            status="For Rent"
            image={property.image}
            slug={property.slug}
            type="rent"
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="rounded-lg border border-[#E5D5C5] bg-[#F3E9E0] px-5 py-2.5 text-sm text-[#6B4C3B] transition hover:border-[#6B4C3B] disabled:cursor-not-allowed disabled:opacity-30"
          >
            ← Previous
          </button>
          <span className="text-sm text-[#6B4C3B]/60">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
            }
            disabled={currentPage === totalPages - 1}
            className="rounded-lg border border-[#E5D5C5] bg-[#F3E9E0] px-5 py-2.5 text-sm text-[#6B4C3B] transition hover:border-[#6B4C3B] disabled:cursor-not-allowed disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}