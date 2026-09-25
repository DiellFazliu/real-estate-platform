import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft, MapPin } from 'lucide-react'
import type { PropertyPageData } from './types'

interface PropertyHeaderProps extends Pick<PropertyPageData, 'property'> {
  children: ReactNode
}

export function PropertyHeader({ property, children }: PropertyHeaderProps) {
  const isRent = property.listing_type === 'rent'

  return (
    <>
      <div className="border-b border-[#6B4C3B]/10 bg-[#F7F3EE]">
        <div className="px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-5">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6B4C3B] hover:text-black transition-colors"
          >
            <ArrowLeft size={17} />
            Kthehu te pronat
          </Link>
        </div>
      </div>

      <div className="px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 py-8 md:py-12">
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide ${isRent
                ? 'bg-[#6B4C3B] text-white'
                : 'bg-[#F3E9E0] text-[#6B4C3B] border border-[#6B4C3B]/20'
                }`}
            >
              {isRent ? 'Me Qira' : 'Në Shitje'}
            </span>

            {property.featured && (
              <span className="px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide bg-[#D4AF37] text-black">
                ★ Featured
              </span>
            )}

            {property.status && (
              <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white border border-[#6B4C3B]/15 text-[#6B4C3B]">
                {property.status}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-black mb-4">
            {property.title}
          </h1>

          <div className="flex items-center gap-2 text-[#6B4C3B]">
            <MapPin size={18} />
            <p>
              {property.location && `${property.location}, `}
              {property.neighborhood && `${property.neighborhood}, `}
              {property.city}
            </p>
          </div>
        </div>

        {children}
      </div>
    </>
  )
}
