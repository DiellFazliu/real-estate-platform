'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CompareButton } from '@/components/compare/CompareButton'

const FALLBACK =
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80'

interface PropertyCardProps {
  property: {
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
    featured?: boolean
  }
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [imageError, setImageError] = useState(false)

  const imageUrl =
    imageError || !property.primary_image_url
      ? FALLBACK
      : property.primary_image_url

  return (
    <article className="group overflow-hidden rounded-2xl border border-[#6B4C3B]/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative">
        <Link
          href={`/properties/${property.slug}`}
          className="block"
        >
          {/* Image */}
          <div className="relative h-64 w-full overflow-hidden bg-[#F3E9E0]">
            <img
              src={imageUrl}
              alt={property.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              onError={() => setImageError(true)}
            />

            {/* Badges */}
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              {property.featured && (
                <span className="rounded-full bg-[#6B4C3B] px-3 py-1 text-xs font-semibold text-white shadow-sm">
                  Featured
                </span>
              )}

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
                  property.listing_type === 'rent'
                    ? 'bg-[#F3E9E0] text-[#6B4C3B]'
                    : 'bg-[#6B4C3B] text-white'
                }`}
              >
                {property.listing_type === 'rent'
                  ? 'Me Qira'
                  : 'Në Shitje'}
              </span>
            </div>

            {/* Price */}
            <div className="absolute bottom-4 left-4">
              <div className="rounded-xl bg-white px-4 py-2.5 shadow-lg">
                <span className="text-lg font-bold text-[#000000]">
                  €{Number(property.price).toLocaleString()}
                </span>

                {property.listing_type === 'rent' && (
                  <span className="ml-1 text-xs text-[#000000]/45">
                    / muaj
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white p-5">
            <h3 className="mb-2 line-clamp-1 text-lg font-bold text-black transition-colors group-hover:text-[#6B4C3B]">
              {property.title}
            </h3>

            <p className="mb-4 text-sm text-[#6B4C3B]">
              {property.neighborhood &&
                `${property.neighborhood}, `}
              {property.city}
            </p>

            <div className="flex items-center gap-4 border-t border-[#6B4C3B]/10 pt-4 text-sm text-[#6B4C3B]/70">
              {property.bedrooms !== null &&
                property.bedrooms !== undefined && (
                  <span>{property.bedrooms} dhoma</span>
                )}

              {property.bathrooms !== null &&
                property.bathrooms !== undefined && (
                  <span>{property.bathrooms} banjo</span>
                )}

              {property.area !== null &&
                property.area !== undefined && (
                  <span>{property.area}m²</span>
                )}
            </div>
          </div>
        </Link>

        {/* Compare action */}
        <div className="absolute right-4 top-4 z-10">
          <CompareButton
            property={{
              id: property.id,
              slug: property.slug,
              title: property.title,
              price: property.price,
              city: property.city,
              neighborhood: property.neighborhood,
              primary_image_url: property.primary_image_url,
            }}
          />
        </div>
      </div>
    </article>
  )
}