'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, MapPin, BedDouble, Bath, Maximize } from 'lucide-react'

type Property = {
  id: number
  slug: string
  title: string
  price: string | number
  location: string | null
  city: string | null
  neighborhood: string | null
  propertyType: string | null
  bedrooms: number | null
  bathrooms: number | null
  area: number | null
  image: string | null
  status: string
  listingType: string
}

type FavoriteCardProps = {
  favoriteId: number
  property: Property
}

export function FavoriteCard({
  favoriteId,
  property,
}: FavoriteCardProps) {
  const [isRemoving, setIsRemoving] = useState(false)
  const [removed, setRemoved] = useState(false)

  const removeFavorite = async () => {
    try {
      setIsRemoving(true)

      const response = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          favoriteId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to remove favorite')
      }

      setRemoved(true)
    } catch (error) {
      console.error('Remove favorite error:', error)
      setIsRemoving(false)
      alert('Gabim gjatë fshirjes së favoritit')
    }
  }

  if (removed) {
    return null
  }

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(Number(property.price))

  const location =
    property.neighborhood && property.city
      ? `${property.neighborhood}, ${property.city}`
      : property.location || property.city || 'Location unavailable'

  return (
    <article
      className={`group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        isRemoving ? 'pointer-events-none opacity-50' : ''
      }`}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F3E9E0]">
        <Link href={`/properties/${property.slug}`}>
          {property.image ? (
            <img
              src={property.image}
              alt={property.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-sm text-black/40">
                No image available
              </span>
            </div>
          )}
        </Link>

        {/* Favorite button */}
        <button
          type="button"
          onClick={removeFavorite}
          disabled={isRemoving}
          aria-label="Remove from favorites"
          className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur-sm transition hover:bg-[#000000] hover:text-white"
        >
          <Heart className="h-5 w-5 fill-[#6B4C3B] text-[#6B4C3B] transition group-hover:scale-105" />
        </button>

        {/* Listing type */}
        <div className="absolute bottom-4 left-4 rounded-full bg-[#000000]/90 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-white">
          {property.listingType === 'rent' ? 'For Rent' : 'For Sale'}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h2 className="line-clamp-2 font-serif text-xl font-semibold text-[#000000]">
            <Link
              href={`/properties/${property.slug}`}
              className="transition hover:text-[#6B4C3B]"
            >
              {property.title}
            </Link>
          </h2>
        </div>

        {/* Price */}
        <p className="text-xl font-semibold text-[#6B4C3B]">
          {formattedPrice}
        </p>

        {/* Location */}
        <div className="mt-3 flex items-center gap-2 text-sm text-black/55">
          <MapPin className="h-4 w-4 shrink-0 text-[#6B4C3B]" />
          <span className="truncate">{location}</span>
        </div>

        {/* Property information */}
        <div className="mt-5 flex items-center gap-5 border-t border-black/10 pt-4">
          {property.bedrooms !== null && (
            <div className="flex items-center gap-1.5 text-sm text-black/60">
              <BedDouble className="h-4 w-4 text-[#6B4C3B]" />
              <span>{property.bedrooms} Beds</span>
            </div>
          )}

          {property.bathrooms !== null && (
            <div className="flex items-center gap-1.5 text-sm text-black/60">
              <Bath className="h-4 w-4 text-[#6B4C3B]" />
              <span>{property.bathrooms} Baths</span>
            </div>
          )}

          {property.area !== null && (
            <div className="flex items-center gap-1.5 text-sm text-black/60">
              <Maximize className="h-4 w-4 text-[#6B4C3B]" />
              <span>{property.area} m²</span>
            </div>
          )}
        </div>

        {/* View property */}
        <Link
          href={`/properties/${property.slug}`}
          className="mt-5 flex w-full items-center justify-center rounded-full border border-[#000000] px-4 py-3 text-sm font-medium text-[#000000] transition hover:bg-[#000000] hover:text-white"
        >
          View Property
        </Link>
      </div>
    </article>
  )
}