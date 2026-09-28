'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

import { PropertyImage } from '@/components/properties/PropertyImage'
import { FALLBACK_IMAGES } from '@/lib/properties/property-display'
import type { PropertyPageData } from '../properties/types'

export function PropertyGallery({
  property,
  displayImages,
}: Pick<PropertyPageData, 'property' | 'displayImages'>) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  const images = [
    displayImages[0] || FALLBACK_IMAGES[0],
    displayImages[1] || FALLBACK_IMAGES[1],
    displayImages[2] || FALLBACK_IMAGES[2],
    ...displayImages.slice(3),
  ]

  function closeViewer() {
    setSelectedImage(null)
  }

  function showPrevious() {
    setSelectedImage((current) => {
      if (current === null) {
        return null
      }

      return current === 0
        ? images.length - 1
        : current - 1
    })
  }

  function showNext() {
    setSelectedImage((current) => {
      if (current === null) {
        return null
      }

      return current === images.length - 1
        ? 0
        : current + 1
    })
  }

  useEffect(() => {
    if (selectedImage === null) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeViewer()
      }

      if (event.key === 'ArrowLeft') {
        showPrevious()
      }

      if (event.key === 'ArrowRight') {
        showNext()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [selectedImage])

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-12">
        {/* Main image */}
        <button
          type="button"
          onClick={() => setSelectedImage(0)}
          className="relative md:row-span-2 h-[320px] md:h-[620px] rounded-2xl overflow-hidden bg-[#F3E9E0] cursor-pointer"
        >
          <PropertyImage
            src={images[0]}
            alt={property.title}
            className="w-full h-full object-cover transition duration-300 hover:scale-105"
            fallbackSrc={FALLBACK_IMAGES[0]}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
        </button>

        {/* Second image */}
        <button
          type="button"
          onClick={() => setSelectedImage(1)}
          className="relative h-[250px] md:h-[303px] rounded-2xl overflow-hidden bg-[#F3E9E0] cursor-zoom-in"
        >
          <PropertyImage
            src={images[1]}
            alt={`${property.title} - 2`}
            className="w-full h-full object-cover transition duration-300 hover:scale-105"
            fallbackSrc={FALLBACK_IMAGES[1]}
          />
        </button>

        {/* Third image */}
        <button
          type="button"
          onClick={() => setSelectedImage(2)}
          className="relative h-[250px] md:h-[303px] rounded-2xl overflow-hidden bg-[#F3E9E0] cursor-zoom-in"
        >
          <PropertyImage
            src={images[2]}
            alt={`${property.title} - 3`}
            className="w-full h-full object-cover transition duration-300 hover:scale-105"
            fallbackSrc={FALLBACK_IMAGES[2]}
          />

          {displayImages.length > 3 && (
            <div className="absolute inset-0 bg-black/55 flex items-center justify-center pointer-events-none">
              <span className="text-white text-lg font-semibold">
                +{displayImages.length - 3} më shumë
              </span>
            </div>
          )}
        </button>
      </div>

      {/* Fullscreen viewer */}
      {selectedImage !== null && (
        <div
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
          onClick={closeViewer}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              closeViewer()
            }}
            className="absolute top-5 right-5 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
            aria-label="Mbyll foton"
          >
            <X size={26} />
          </button>

          {/* Previous button */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                showPrevious()
              }}
              className="absolute left-4 md:left-8 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Fotoja e mëparshme"
            >
              <ChevronLeft size={32} />
            </button>
          )}

          {/* Image */}
          <div
            className="flex h-full w-full items-center justify-center px-16 py-16"
            onClick={(event) => event.stopPropagation()}
          >
            <PropertyImage
              key={images[selectedImage]}
              src={images[selectedImage]}
              alt={`${property.title} - Foto ${selectedImage + 1}`}
              className="max-h-full max-w-full object-contain"
              fallbackSrc={FALLBACK_IMAGES[0]}
            />
          </div>

          {/* Next button */}
          {images.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                showNext()
              }}
              className="absolute right-4 md:right-8 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Fotoja tjetër"
            >
              <ChevronRight size={32} />
            </button>
          )}

          {/* Counter */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-sm text-white">
            {selectedImage + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  )
}