import { prisma } from '@/lib/db/prisma'
import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { HeroSlideForm } from '@/components/owner/HeroSlideForm'
import Link from 'next/link'

export default async function NewHeroSlidePage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const properties = await prisma.property.findMany({
    where: { status: 'PUBLISHED' },
    select: { id: true, title: true, slug: true },
    orderBy: { title: 'asc' },
  })

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
          Krijo Hero Slide
        </h1>
        <div className="bg-white rounded-2xl p-8">
          <HeroSlideForm properties={properties} />
        </div>
      </div>
    </div>
  )
}