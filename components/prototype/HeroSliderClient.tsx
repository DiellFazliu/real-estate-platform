'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { stegaClean } from '@sanity/client/stega'

// ═══════════════════════════════════════════════════════════════
// TYPE
// ═══════════════════════════════════════════════════════════════

interface HeroSlide {
  id: string | number
  title: string
  subtitle: string | null
  price: string | null
  description: string | null
  badge: string | null
  image_url: string | null
  hotspot: { x: number; y: number } | null
  custom_url: string | null
  property: {
    slug: string
    sanity_id: string
  } | null
}

interface HeroSliderClientProps {
  slides: HeroSlide[]
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export function HeroSliderClient({ slides }: HeroSliderClientProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (slides.length === 0 || isPaused) return

    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [slides.length, isPaused])

  const pauseSlideshow = () => {
    setIsPaused(true)
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const goToSlide = (index: number) => setCurrentSlide(index)
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  if (slides.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black">
        <p className="text-white/50">No hero slides available</p>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {slides.map((slide, index) => {
        // ⭐ HREF LOGIC
        const cleanSlug = slide.property?.slug
          ? stegaClean(slide.property.slug)
          : null

        const href = cleanSlug
          ? `/properties/${cleanSlug}`
          : slide.custom_url || '/properties'

        const isActive = index === currentSlide

        // ⭐ HOTSPOT → CSS object-position
        // Sanity hotspot: x, y në [0, 1] → CSS në %
        // Pa hotspot → 'center'
        const objectPosition = slide.hotspot
          ? `${slide.hotspot.x * 100}% ${slide.hotspot.y * 100}%`
          : 'center'

        return (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              isActive
                ? 'scale-100 opacity-100 pointer-events-auto'
                : 'scale-105 opacity-0 pointer-events-none'
            }`}
          >
            {/* ⭐ IMAGE — object-cover + object-position */}
            {slide.image_url && (
              <img
                src={slide.image_url}
                alt={slide.title || 'Hero slide'}
                className="absolute inset-0 h-full w-full object-cover"
                style={{ objectPosition }}
                loading={isActive ? 'eager' : 'lazy'}
                fetchPriority={isActive ? 'high' : 'low'}
              />
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            {/* Content */}
            <div className="relative flex h-full items-end pb-20">
              <div className="w-full px-8">
                <div className="max-w-xl">
                  {slide.badge && (
                    <span className="mb-4 inline-block rounded-full bg-[#6B4C3B] px-3 py-1 text-xs font-semibold text-white animate-fade-in-up">
                      {slide.badge}
                    </span>
                  )}

                  {slide.price && (
                    <div className="mb-2 text-2xl font-bold text-white md:text-3xl animate-fade-in-up-delay-1">
                      {slide.price}
                    </div>
                  )}

                  <h1 className="mb-2 text-3xl font-bold leading-tight text-white md:text-4xl animate-fade-in-up-delay-1">
                    {slide.title}
                  </h1>

                  {slide.subtitle && (
                    <p className="mb-3 text-lg text-white/90 animate-fade-in-up-delay-2">
                      {slide.subtitle}
                    </p>
                  )}

                  {slide.description && (
                    <p className="mb-6 line-clamp-2 text-sm text-white/60 animate-fade-in-up-delay-2">
                      {slide.description}
                    </p>
                  )}

                  <div className="flex gap-3 animate-fade-in-up-delay-2">
                    <Link
                      href={href}
                      onClick={pauseSlideshow}
                      className="rounded-lg bg-[#6B4C3B] px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#4A342A] hover:shadow-xl"
                    >
                      {slide.property?.slug ? 'Shiko Pronën →' : 'Zbulo →'}
                    </Link>

                    <Link
                      href="/properties"
                      onClick={pauseSlideshow}
                      className="rounded-lg border border-white/20 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                    >
                      Të Gjitha
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {slides.length > 1 && (
        <>
          <button
            onClick={() => {
              pauseSlideshow()
              prevSlide()
            }}
            className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition hover:bg-[#6B4C3B]"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => {
              pauseSlideshow()
              nextSlide()
            }}
            className="absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm transition hover:bg-[#6B4C3B]"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                pauseSlideshow()
                goToSlide(index)
              }}
              className={`rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'h-1.5 w-8 bg-[#6B4C3B]'
                  : 'h-1.5 w-5 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}