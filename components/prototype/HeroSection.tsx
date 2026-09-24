import { prisma } from '@/lib/db/prisma'
import { HeroSliderClient } from './HeroSliderClient'
import { HeroSidebar } from './HeroSideBar'

// ═══════════════════════════════════════════════════════════════
// FALLBACK SLIDES
// ═══════════════════════════════════════════════════════════════

const FALLBACK_SLIDES = [
  {
    id: -1,
    title: 'Villaron Grand Avenue',
    subtitle: 'Premium Luxury Living',
    price: '$ 250,000',
    description: 'Discover our featured listings',
    badge: 'Featured',
    image_url:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80',
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
// FETCHERS
// ═══════════════════════════════════════════════════════════════

async function getHeroSlides() {
  try {
    const slides = await prisma.heroSlide.findMany({
      where: { is_active: true },
      orderBy: { order: 'asc' },
      include: {
        property: {
          select: { slug: true, sanity_id: true },
        },
      },
    })
    return slides.length > 0 ? slides : FALLBACK_SLIDES
  } catch (error) {
    console.error('Error fetching hero slides:', error)
    return FALLBACK_SLIDES
  }
}

async function getPlatformStats(): Promise<PlatformStats> {
  try {
    const [soldCount, listedCount, rentCount, saleCount] = await Promise.all([
      // Të shitura (status = SOLD)
      prisma.property.count({
        where: { status: 'SOLD' },
      }),

      // Aktualisht të listuara
      prisma.property.count({
        where: {
          status: 'PUBLISHED',
          review_status: 'APPROVED',
        },
      }),

      // Me qira
      prisma.property.count({
        where: {
          status: 'PUBLISHED',
          review_status: 'APPROVED',
          listing_type: 'rent',
        },
      }),

      // Për shitje
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

// ═══════════════════════════════════════════════════════════════
// HERO SECTION
// ═══════════════════════════════════════════════════════════════

export async function HeroSection() {
  const [slides, stats] = await Promise.all([
    getHeroSlides(),
    getPlatformStats(),
  ])

  return (
    <section className="relative w-full grid grid-cols-1 lg:grid-cols-10 lg:h-screen lg:overflow-hidden">
      {/* Left: Slider (70%) */}
      <div className="relative h-[70vh] lg:h-full lg:col-span-7">
        <HeroSliderClient slides={slides} />
      </div>

      {/* Right: Sidebar (30%) */}
      <div className="relative h-auto lg:h-full lg:col-span-3 bg-white">
        <HeroSidebar stats={stats} />
      </div>
    </section>
  )
}