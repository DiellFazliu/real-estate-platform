import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db/prisma'
import { getDraftClient } from '@/lib/sanity/draft-client'
import { urlFor } from '@/lib/sanity/client'
import { HeroSliderClient } from './HeroSliderClient'
import { HeroSidebar } from './HeroSideBar'

// ═══════════════════════════════════════════════════════════════
// FALLBACK SLIDES
// ═══════════════════════════════════════════════════════════════

const FALLBACK_SLIDES = [
  {
    id: '-1',
    title: 'Villaron Grand Avenue',
    subtitle: 'Premium Luxury Living',
    price: '$ 250,000',
    description: 'Discover our featured listings',
    badge: 'Featured',
    image_url:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80',
    hotspot: null,
    custom_url: null,
    property: null,
  },
]

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface PlatformStats {
  soldCount: number
  listedCount: number
  rentCount: number
  saleCount: number
}

// ═══════════════════════════════════════════════════════════════
// HERO SLIDES
// ═══════════════════════════════════════════════════════════════

const HERO_SLIDES_QUERY = `*[_type == "heroSlide" && isActive == true] | order(order asc) {
  _id,
  title,
  subtitle,
  price,
  description,
  badge,
  image,
  "hotspot": image.hotspot,
  "property": property->{
    "slug": slug.current,
    "sanity_id": _id
  }
}`

/**
 * ⭐ VETËM WIDTH — pa height, pa fit
 *
 * Kjo gjeneron një URL të thjeshtë me gjerësi të caktuar.
 * Proporcioni origjinal ruhet. Nuk ka prerje.
 * Hotspot-i aplikohet në CSS (object-position), jo në URL.
 */
function buildImageUrl(image: any): string | null {
  if (!image) return null

  try {
    return urlFor(image)
      .width(2400)
      .auto('format')
      .quality(90)
      .url()
  } catch (err) {
    console.error('Error building image URL:', err)
    return null
  }
}

async function getHeroSlides() {
  try {
    const { client } = await getDraftClient()
    const slides = await client.fetch(HERO_SLIDES_QUERY)

    if (!slides || slides.length === 0) {
      return FALLBACK_SLIDES
    }

    return slides.map((slide: any) => ({
      id: slide._id,
      title: slide.title,
      subtitle: slide.subtitle,
      price: slide.price,
      description: slide.description,
      badge: slide.badge,
      image_url: buildImageUrl(slide.image),
      hotspot: slide.hotspot || null,
      custom_url: null,
      property: slide.property,
    }))
  } catch (error) {
    console.error('Error fetching hero slides from Sanity:', error)
    return FALLBACK_SLIDES
  }
}

// ═══════════════════════════════════════════════════════════════
// PLATFORM STATS
// ═══════════════════════════════════════════════════════════════

async function getPlatformStats(): Promise<PlatformStats> {
  try {
    const [soldCount, listedCount, rentCount, saleCount] = await Promise.all([
      prisma.property.count({ where: { status: 'SOLD' } }),
      prisma.property.count({
        where: { status: 'PUBLISHED', review_status: 'APPROVED' },
      }),
      prisma.property.count({
        where: {
          status: 'PUBLISHED',
          review_status: 'APPROVED',
          listing_type: 'rent',
        },
      }),
      prisma.property.count({
        where: {
          status: 'PUBLISHED',
          review_status: 'APPROVED',
          listing_type: 'sale',
        },
      }),
    ])

    return { soldCount, listedCount, rentCount, saleCount }
  } catch (error) {
    console.error('Error fetching platform stats:', error)
    return { soldCount: 0, listedCount: 0, rentCount: 0, saleCount: 0 }
  }
}

const getCachedPlatformStats = unstable_cache(
  getPlatformStats,
  ['homepage-platform-stats'],
  { revalidate: 60 }
)

// ═══════════════════════════════════════════════════════════════
// HERO SECTION
// ═══════════════════════════════════════════════════════════════

export async function HeroSection() {
  const [slides, stats] = await Promise.all([
    getHeroSlides(),
    getCachedPlatformStats(),
  ])

  return (
    <section className="relative w-full grid grid-cols-1 lg:grid-cols-10 lg:h-screen lg:overflow-hidden">
      <div className="relative h-[70vh] lg:h-full lg:col-span-7">
        <HeroSliderClient slides={slides} />
      </div>

      <div className="relative h-auto lg:h-full lg:col-span-3 bg-white">
        <HeroSidebar stats={stats} />
      </div>
    </section>
  )
}