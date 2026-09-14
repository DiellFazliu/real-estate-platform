'use client'

import { useState } from 'react'
import Link from 'next/link'

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
  type?: 'sale' | 'rent'
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
    <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-64 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
        />

        <div className="absolute top-4 left-4 flex gap-2">
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              status === 'For Sale' || status === 'PUBLISHED'
                ? 'bg-green-500 text-white'
                : 'bg-blue-500 text-white'
            }`}
          >
            {status === 'PUBLISHED' ? 'For Sale' : status}
          </span>
          {type === 'sale' && (
            <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-semibold rounded-full">
              Featured
            </span>
          )}
        </div>

        <button
          onClick={() => setIsLiked(!isLiked)}
          className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition shadow-lg"
        >
          <span className="text-xl">{isLiked ? '❤️' : '🤍'}</span>
        </button>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
          {title}
        </h3>

        <div className="flex items-center gap-1 text-gray-500 text-sm mb-3">
          <span>📍</span>
          <span>{location}</span>
        </div>

        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-2xl font-bold text-blue-600">
            ${price.toLocaleString()}
          </span>
          <span className="text-gray-500 text-sm">
            {type === 'sale' ? '' : '/month'}
          </span>
        </div>

        <div className="flex items-center gap-4 py-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 text-gray-600">
            <span>🛏️</span>
            <span className="text-sm">{bedrooms}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600">
            <span>🚿</span>
            <span className="text-sm">{bathrooms}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600">
            <span>📐</span>
            <span className="text-sm">{area} m²</span>
          </div>
        </div>

        <Link href={`/properties/${propertySlug}`}>
          <button className="w-full mt-2 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-md hover:shadow-lg">
            View Property
          </button>
        </Link>
      </div>
    </div>
  )
}