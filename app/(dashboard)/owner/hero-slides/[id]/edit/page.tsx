import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth/auth'
import { redirect, notFound } from 'next/navigation'
import { HeroSlideForm } from '@/components/owner/HeroSlideForm'
import Link from 'next/link'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditHeroSlidePage({ params }: Props) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const { id } = await params
  const slideId = parseInt(id)
  if (isNaN(slideId)) notFound()

  const [slide, properties] = await Promise.all([
    prisma.heroSlide.findUnique({ where: { id: slideId } }),
    prisma.property.findMany({
      where: { status: 'PUBLISHED' },
      select: { id: true, title: true, slug: true },
      orderBy: { title: 'asc' },
    }),
  ])

  if (!slide) notFound()

  return (
    <div className="min-h-screen bg-[#F7F3EE] pt-20">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link
          href="/owner/hero-slides"
          className="inline-block text-[#6B4C3B] hover:underline mb-6"
        >
          ← Kthehu
        </Link>
        <h1 className="text-3xl font-bold text-black mb-8">
          Edito Hero Slide
        </h1>
        <div className="bg-white rounded-2xl p-8">
          <HeroSlideForm properties={properties} initialData={slide} />
        </div>
      </div>
    </div>
  )
}