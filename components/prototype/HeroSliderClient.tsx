'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface HeroSlide {
  _id: string
  title: string
  subtitle?: string
  price?: string
  description?: string
  badge?: string
  imageUrl: string
  propertySlug?: string
  propertyId?: string
  propertyStatus?: string
}

interface HeroSliderClientProps {
  slides: HeroSlide[]
}

export function HeroSliderClient({ slides }: HeroSliderClientProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    if (slides.length === 0) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [slides.length])

  const goToSlide = (index: number) => setCurrentSlide(index)
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  if (slides.length === 0) {
    return (
      <div className="h-full w-full bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-white/50">No hero slides available</p>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide._id}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
          style={{
            backgroundImage: `url(${slide.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

          {/* Content */}
          <div className="relative h-full flex items-end pb-20">
            <div className="px-8 w-full">
              <div className="max-w-xl">
                {slide.badge && (
                  <span className="inline-block px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full mb-4">
                    {slide.badge}
                  </span>
                )}

                {slide.price && (
                  <div className="text-2xl md:text-3xl font-bold text-blue-400 mb-2">
                    {slide.price}
                  </div>
                )}

                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">
                  {slide.title}
                </h1>

                {slide.subtitle && (
                  <p className="text-lg text-white/80 mb-3">
                    {slide.subtitle}
                  </p>
                )}

                {slide.description && (
                  <p className="text-sm text-white/60 mb-6 line-clamp-2">
                    {slide.description}
                  </p>
                )}

                <div className="flex gap-3">
                  {slide.propertySlug ? (
                    <Link
                      href={`/properties/${slide.propertySlug}`}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                    >
                      View Property →
                    </Link>
                  ) : (
                    <Link
                      href="/properties"
                      className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                    >
                      Explore →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition z-20 text-white text-xl w-10 h-10 flex items-center justify-center"
          >
            ‹
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition z-20 text-white text-xl w-10 h-10 flex items-center justify-center"
          >
            ›
          </button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 ${
                index === currentSlide
                  ? 'w-8 h-1.5 bg-white'
                  : 'w-5 h-1.5 bg-white/40 hover:bg-white/60'
              } rounded-full`}
            />
          ))}
        </div>
      )}
    </div>
  )
}