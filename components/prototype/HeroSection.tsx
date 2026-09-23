import { prisma } from '@/lib/db/prisma'
import { HeroSliderClient } from './HeroSliderClient'
import { HeroSidebar } from './HeroSideBar'

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

export async function HeroSection() {
  const slides = await getHeroSlides()

  return (
    <section className="relative w-full grid grid-cols-1 lg:grid-cols-10 lg:h-screen lg:overflow-hidden">
      <div className="relative h-[70vh] lg:h-full lg:col-span-7">
        <HeroSliderClient slides={slides} />
      </div>
      <div className="relative h-auto lg:h-full lg:col-span-3 bg-white">
        <HeroSidebar />
      </div>
    </section>
  )
}