import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { HeroSlideActions } from '@/components/dashboard/HeroSlideActions'

export default async function OwnerHeroSlidesPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  // ⭐ Shto role check
  if (!['OWNER', 'ADMIN'].includes(session.user.role)) {
    redirect('/')
  }

  const slides = await prisma.heroSlide.findMany({
    orderBy: { order: 'asc' },
    include: {
      property: { select: { slug: true, title: true } },
    },
  })

  return (
    <div className="min-h-screen bg-[#F7F3EE] pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black">Hero Slides</h1>
            <p className="text-[#6B4C3B]/60 mt-2">{slides.length} slides</p>
          </div>
          <Link
            href="/owner/hero-slides/new"
            className="px-6 py-3 bg-[#6B4C3B] text-white rounded-lg hover:bg-[#4A342A]"
          >
            + Shto Slide
          </Link>
        </div>

        {slides.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl">
            <p className="text-[#6B4C3B]/60 mb-4">Nuk ka hero slides</p>
            <Link
              href="/owner/hero-slides/new"
              className="inline-block px-6 py-2 bg-[#6B4C3B] text-white rounded-lg"
            >
              Krijo Slide
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {slides.map((slide) => (
              <div
                key={slide.id}
                className="bg-white rounded-2xl p-4 flex gap-4"
              >
                <div className="w-32 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  {slide.image_url && (
                    <img
                      src={slide.image_url}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-black">
                    {slide.title}
                  </h3>
                  {slide.subtitle && (
                    <p className="text-[#6B4C3B]/60 text-sm">
                      {slide.subtitle}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2 text-xs">
                    {slide.price && <span>💰 {slide.price}</span>}
                    {slide.badge && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                        {slide.badge}
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                      Order: {slide.order}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full ${
                        slide.source === 'SANITY'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {slide.source}
                    </span>
                    {!slide.is_active && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                        Inaktiv
                      </span>
                    )}
                  </div>
                </div>
                {/* ⭐ Përdor HeroSlideActions */}
                <HeroSlideActions
                  slideId={slide.id}
                  isActive={slide.is_active}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}