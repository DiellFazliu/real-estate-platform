'use client'

import Link from 'next/link'
import { ArrowRight, X } from 'lucide-react'
import { useCompare } from './CompareProvider'

export function CompareBar() {
  const {
    selectedProperties,
    removeProperty,
    clearAll,
  } = useCompare()

  if (selectedProperties.length === 0) {
    return null
  }

  const ids = selectedProperties.map((property) => property.id).join(',')

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-[#6B4C3B]/15 bg-white/95 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-5 py-4 sm:px-6 lg:px-8">
        {/* Selected properties */}
        <div className="flex min-w-0 flex-1 items-center gap-3 overflow-x-auto">
          {selectedProperties.map((property) => (
            <div
              key={property.id}
              className="flex min-w-[180px] items-center gap-3 rounded-xl border border-[#6B4C3B]/10 bg-[#F7F3EE] p-2"
            >
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[#F3E9E0]">
                {property.primary_image_url ? (
                  <img
                    src={property.primary_image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-black">
                  {property.title}
                </p>

                <p className="truncate text-xs text-[#6B4C3B]/70">
                  {property.neighborhood || property.city || 'Lokacion i panjohur'}
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

          <Link
            href={`/properties/compare?ids=${ids}`}
            className="flex items-center gap-2 rounded-xl bg-[#6B4C3B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
          >
            Krahaso
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}