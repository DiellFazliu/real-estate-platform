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
      <div className="h-screen bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-white/50">No hero slides available</p>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
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
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

          <div className="relative h-full flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="max-w-3xl">
                {slide.badge && (
                  <span className="inline-block px-4 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-full mb-6 animate-fade-in-up">
                    {slide.badge}
                  </span>
                )}

                {slide.price && (
                  <div className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in-up-delay-1">
                    {slide.price}
                  </div>
                )}

                <h1 className="text-5xl md:text-7xl font-bold text-white mb-3 animate-fade-in-up-delay-1">
                  {slide.title}
                </h1>

                {slide.subtitle && (
                  <p className="text-2xl md:text-3xl text-white/90 font-light mb-4 animate-fade-in-up-delay-2">
                    {slide.subtitle}
                  </p>
                )}

                {slide.description && (
                  <p className="text-lg text-white/80 mb-8 max-w-xl animate-fade-in-up-delay-2">
                    {slide.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 animate-fade-in-up-delay-2">
                  {slide.propertySlug ? (
                    <Link
                      href={`/properties/${slide.propertySlug}`}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
                    >
                      View Property
                    </Link>
                  ) : (
                    <Link
                      href="/properties"
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
                    >
                      Explore Properties
                    </Link>
                  )}
                  <Link
                    href="/properties"
                    className="px-8 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/30 transition border border-white/30"
                  >
                    View All Listings
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition z-20 text-white text-2xl"
          >
            ‹
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition z-20 text-white text-2xl"
          >
            ›
          </button>
        </>
      )}

      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 ${
                index === currentSlide
                  ? 'w-12 h-2 bg-white'
                  : 'w-8 h-2 bg-white/40 hover:bg-white/60'
              } rounded-full`}
            />
          ))}
        </div>
      )}
    </div>
  )
}