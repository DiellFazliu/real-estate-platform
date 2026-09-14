import { client } from '@/lib/sanity/client'
import { heroSlidesQuery } from '@/lib/sanity/queries'
import { HeroSliderClient } from './HeroSliderClient'

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

export async function HeroSlider() {
  try {
    const slides = await client.fetch(heroSlidesQuery)
    const heroSlides = slides.length > 0 ? slides : getFallbackSlides()
    return <HeroSliderClient slides={heroSlides} />
  } catch (error) {
    console.error('Error fetching hero slides:', error)
    return <HeroSliderClient slides={getFallbackSlides()} />
  }
}

function getFallbackSlides(): HeroSlide[] {
  return [
    {
      _id: 'fallback-1',
      title: 'Villaron Grand Avenue',
      subtitle: 'Premium Luxury Living',
      price: '$ 250,000',
      description: 'Discover our featured listings and find your dream home',
      badge: 'Featured',
      imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80',
    },
    {
      _id: 'fallback-2',
      title: 'Modern Penthouse Collection',
      subtitle: 'Skyline Views',
      price: '$ 450,000',
      description: 'Experience luxury living at its finest',
      badge: 'Premium',
      imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80',
    },
    {
      _id: 'fallback-3',
      title: 'Coastal Villa Estate',
      subtitle: 'Beachfront Paradise',
      price: '$ 890,000',
      description: 'Wake up to ocean views every morning',
      badge: 'Luxury',
      imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1920&q=80',
    },
  ]
}