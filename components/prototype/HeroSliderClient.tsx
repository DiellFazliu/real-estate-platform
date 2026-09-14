'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons'
import { SLIDER_INTERVAL } from '@/lib/constants'
import type { HeroSlide } from '@/lib/types'

interface HeroSliderClientProps {
  slides: HeroSlide[]
}

export function HeroSliderClient({ slides }: HeroSliderClientProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    if (slides.length === 0) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, SLIDER_INTERVAL)
    return () => clearInterval(timer)
  }, [slides.length])

  const goToSlide = (index: number) => setCurrentSlide(index)
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  if (slides.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black">
        <p className="text-[#F7F3EE]/50">No hero slides available</p>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide._id}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentSlide ? 'scale-100 opacity-100' : 'scale-105 opacity-0'
          }`}
          style={{
            backgroundImage: `url(${slide.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-[#6B4C3B]/40 to-transparent" />

          <div className="relative flex h-full items-end pb-20">
            <div className="w-full px-8">
              <div className="max-w-xl">
                {slide.badge && (
                  <span className="mb-4 inline-block rounded-full bg-[#6B4C3B] px-3 py-1 text-xs font-semibold text-[#F7F3EE] animate-fade-in-up">
                    {slide.badge}
                  </span>
                )}

                {slide.price && (
                  <div className="mb-2 text-2xl font-bold text-[#F3E9E0] animate-fade-in-up-delay-1 md:text-3xl">
                    {slide.price}
                  </div>
                )}

                <h1 className="mb-2 text-3xl font-bold leading-tight text-[#F7F3EE] animate-fade-in-up-delay-1 md:text-4xl">
                  {slide.title}
                </h1>

                {slide.subtitle && (
                  <p className="mb-3 text-lg text-[#F3E9E0]/90 animate-fade-in-up-delay-2">
                    {slide.subtitle}
                  </p>
                )}

                {slide.description && (
                  <p className="mb-6 line-clamp-2 text-sm text-[#F7F3EE]/60 animate-fade-in-up-delay-2">
                    {slide.description}
                  </p>
                )}

                <div className="flex gap-3 animate-fade-in-up-delay-2">
                  <Link
                    href={
                      slide.propertySlug
                        ? `/properties/${slide.propertySlug}`
                        : '/properties'
                    }
                    className="rounded-lg bg-[#6B4C3B] px-6 py-2.5 text-sm font-semibold text-[#F7F3EE] shadow-lg transition hover:bg-[#4A342A] hover:shadow-xl"
                  >
                    {slide.propertySlug ? 'View Property →' : 'Explore →'}
                  </Link>
                  <Link
                    href="/properties"
                    className="rounded-lg border border-[#F7F3EE]/20 bg-[#F7F3EE]/10 px-6 py-2.5 text-sm font-semibold text-[#F7F3EE] backdrop-blur-sm transition hover:bg-[#F7F3EE]/20"
                  >
                    View All
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
            className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#F7F3EE]/20 bg-[#F7F3EE]/10 text-[#F7F3EE] backdrop-blur-sm transition hover:bg-[#6B4C3B]"
            aria-label="Previous slide"
          >
            <ChevronLeftIcon />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#F7F3EE]/20 bg-[#F7F3EE]/10 text-[#F7F3EE] backdrop-blur-sm transition hover:bg-[#6B4C3B]"
            aria-label="Next slide"
          >
            <ChevronRightIcon />
          </button>
        </>
      )}

      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'h-1.5 w-8 bg-[#6B4C3B]'
                  : 'h-1.5 w-5 bg-[#F7F3EE]/40 hover:bg-[#F7F3EE]/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}