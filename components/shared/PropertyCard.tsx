'use client'

import Link from 'next/link'
import { MapPin, BedDouble, Bath, Ruler } from 'lucide-react'

type PropertyCardData = {
  id: number
  title: string
  slug: string
  price: number | string
  city?: string | null
  neighborhood?: string | null
  location?: string | null
  bedrooms?: number | null
  bathrooms?: number | null
  area?: number | null
  listing_type?: string | null
  primary_image_url?: string | null
}

export function PropertyCard({ property }: { property: PropertyCardData }) {
  const location = [property.neighborhood, property.city || property.location]
    .filter(Boolean)
    .join(', ')

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]">
      <div className="h-56 overflow-hidden bg-white/10">
        {property.primary_image_url ? (
          <img
            src={property.primary_image_url}
            alt={property.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-white/40">
            No image available
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="line-clamp-2 text-lg font-semibold text-white">{property.title}</h2>
          <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium capitalize text-white/70">
            {property.listing_type || 'sale'}
          </span>
        </div>

        <p className="mt-2 flex items-center gap-1 text-sm text-white/50">
          <MapPin className="h-4 w-4" />
          {location || 'Location not specified'}
        </p>

        <p className="mt-4 text-2xl font-bold text-white">
          €{Number(property.price).toLocaleString()}
        </p>

        <div className="mt-4 flex items-center gap-4 border-t border-white/10 pt-4 text-sm text-white/60">
          <span className="flex items-center gap-1.5"><BedDouble className="h-4 w-4" />{property.bedrooms ?? '-'}</span>
          <span className="flex items-center gap-1.5"><Bath className="h-4 w-4" />{property.bathrooms ?? '-'}</span>
          <span className="flex items-center gap-1.5"><Ruler className="h-4 w-4" />{property.area ? `${property.area} m²` : '-'}</span>
        </div>

        <Link
          href={`/properties/${property.slug}`}
          className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-[#6B4C3B] px-4 py-2.5 font-semibold text-white transition hover:bg-[#4A342A]"
        >
          View property
        </Link>
      </div>
    </article>
  )
}
