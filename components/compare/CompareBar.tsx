'use client'

// components/compare/CompareBar.tsx — sticky bottom bar showing the current
// comparison selection. Renders nothing when empty. The "Krahaso" link
// navigates to /properties/compare with the selected ids as a query string,
// so the compare page can re-hydrate the selection from the URL.

import Link from 'next/link'
import { ArrowRight, X } from 'lucide-react'
import { useCompare } from './CompareProvider'
import { PropertyImage } from '@/components/shared/PropertyImage'

export function CompareBar() {
  const {
    selectedProperties,
    removeProperty,
    clearAll,
  } = useCompare()

  if (selectedProperties.length === 0) {
    return null
  }

  // Passed to /properties/compare as ?ids=1,2,3 so the page can
  // re-fetch fresh property data (CompareProvider state is lost on nav).
  const ids = selectedProperties
    .map((property) => property.id)
    .join(',')

  const canCompare = selectedProperties.length >= 2

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#6B4C3B]/15 bg-white/95 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-5 py-3 sm:px-6 lg:px-8">
        {/* Selected properties */}
        <div className="flex min-w-0 flex-1 items-center gap-3 overflow-x-auto">
          <div className="shrink-0 text-sm font-semibold text-[#6B4C3B]">
            {selectedProperties.length}/4
          </div>

          {selectedProperties.map((property) => (
            <div
              key={property.id}
              className="flex min-w-[180px] items-center gap-3 rounded-xl border border-[#6B4C3B]/10 bg-[#F7F3EE] p-2"
            >
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-[#F3E9E0]">
                <PropertyImage
                  src={property.primary_image_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-black">
                  {property.title}
                </p>

                <p className="truncate text-xs text-[#6B4C3B]/70">
                  {property.neighborhood ||
                    property.city ||
                    'Lokacion i panjohur'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => removeProperty(property.id)}
                aria-label={`Hiq ${property.title} nga krahasimi`}
                className="shrink-0 rounded-full p-1.5 text-black/40 transition hover:bg-white hover:text-black"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={clearAll}
            className="hidden text-sm font-semibold text-[#6B4C3B] transition hover:text-black sm:block"
          >
            Pastro
          </button>

          {canCompare ? (
            <Link
              href={`/properties/compare?ids=${ids}`}
              className="flex items-center gap-2 rounded-xl bg-[#6B4C3B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
            >
              Krahaso
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <div className="rounded-xl bg-[#F3E9E0] px-4 py-3 text-sm font-semibold text-[#6B4C3B]">
              Zgjidh edhe 1 pronë
            </div>
          )}
        </div>
      </div>
    </div>
  )
}