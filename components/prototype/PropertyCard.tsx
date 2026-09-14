'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  HeartIcon,
  MapPinIcon,
  BedIcon,
  BathIcon,
  AreaIcon,
} from '@/components/icons'
import type { PropertyType } from '@/lib/types'

interface PropertyCardProps {
  _id: string
  title: string
  price: number
  location: string
  bedrooms: number
  bathrooms: number
  area: number
  status: string
  image: string
  slug?: { current: string }
  type?: PropertyType
}

export function PropertyCard({
  _id,
  title,
  price,
  location,
  bedrooms,
  bathrooms,
  area,
  status,
  image,
  slug,
  type = 'sale',
}: PropertyCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const propertySlug = slug?.current || _id

  return (
    <article className="group overflow-hidden rounded-2xl border border-[#E5D5C5] bg-[#F3E9E0] transition-all duration-300 hover:-translate-y-2 hover:border-[#6B4C3B] hover:shadow-xl">
      <div className="relative h-64 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
        />

        <div className="absolute left-4 top-4 flex gap-2">
          <span className="rounded-full bg-[#6B4C3B]/90 px-3 py-1 text-xs font-semibold text-[#F7F3EE] backdrop-blur-sm">
            {status === 'PUBLISHED' ? 'For Sale' : status}
          </span>
          {type === 'sale' && (
            <span className="rounded-full bg-[#F3E9E0]/90 px-3 py-1 text-xs font-semibold text-[#6B4C3B] backdrop-blur-sm">
              Featured
            </span>
          )}
        </div>

        <button
          onClick={() => setIsLiked(!isLiked)}
          className="absolute right-4 top-4 rounded-full bg-white/90 p-2 shadow-lg backdrop-blur-sm transition hover:bg-white"
          aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
        >
          <HeartIcon
            size={20}
            filled={isLiked}
            className={isLiked ? 'text-[#6B4C3B]' : 'text-[#6B4C3B]/60'}
          />
        </button>
      </div>

      <div className="p-5">
        <h3 className="mb-1 line-clamp-1 text-lg font-bold text-black">
          {title}
        </h3>

        <div className="mb-3 flex items-center gap-1 text-sm text-[#6B4C3B]/60">
          <MapPinIcon />
          <span>{location}</span>
        </div>

        <div className="mb-3 flex items-baseline gap-1">
          <span className="text-2xl font-bold text-[#6B4C3B]">
            ${price.toLocaleString()}
          </span>
          <span className="text-sm text-[#6B4C3B]/60">
            {type === 'sale' ? '' : '/month'}
          </span>
        </div>

        {/* Features */}
        <div className="flex items-center gap-4 border-t border-[#E5D5C5] py-3">
          <div className="flex items-center gap-1.5 text-[#6B4C3B]/70">
            <BedIcon />
            <span className="text-sm">{bedrooms}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#6B4C3B]/70">
            <BathIcon />
            <span className="text-sm">{bathrooms}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#6B4C3B]/70">
            <AreaIcon />
            <span className="text-sm">{area} m²</span>
          </div>
        </div>

        <Link href={`/properties/${propertySlug}`}>
          <button className="mt-2 w-full rounded-lg bg-[#6B4C3B] py-2.5 font-semibold text-[#F7F3EE] transition hover:bg-[#4A342A]">
            View Property →
          </button>
        </Link>
      </div>
    </article>
  )
}