import Link from 'next/link'
import { redirect } from 'next/navigation'
import { draftMode } from 'next/headers'
import { auth } from '@/lib/auth/auth'

import { HeroSection } from '@/components/prototype/HeroSection'
import { FeaturedProperties } from '@/components/prototype/FeaturedProperties'
import { RentProperties } from '@/components/prototype/RentProperties'
import { VisualEditingWrapper } from '@/components/sanity/VisualEditingWrapper'
import { DraftModeBanner } from '@/components/sanity/DraftModeBanner'

export default async function HomePage() {
  const session = await auth()
  const { isEnabled: isDraft } = await draftMode()

  // Redirect dashboard users away from the public homepage
  if (session?.user) {
    switch (session.user.role) {
      case 'AGENT':
        redirect('/agent')

      case 'ADMIN':
        redirect('/admin')

      case 'OWNER':
        redirect('/owner')

      default:
        break
    }
  }

  // ⭐ Në draft mode: vetëm Hero + Sidebar + Navbar + banner + visual editing
  if (isDraft) {
    return (
      <div className="min-h-screen bg-[#F7F3EE] overflow-hidden">
        <HeroSection />
        <VisualEditingWrapper />
        <DraftModeBanner />
      </div>
    )
  }

  // Home page normale: të gjitha seksionet
  return (
    <div className="min-h-screen bg-[#F7F3EE]">
      {/* 1. HERO SECTION */}
      <HeroSection />

      {/* 2. FEATURED PROPERTIES */}
      <section className="bg-[#F3E9E0] px-6 py-16 md:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <h2 className="text-4xl font-bold tracking-tight text-[#000000] md:text-5xl">
                Pronat e Zgjedhura
              </h2>

              <p className="mt-4 text-base leading-relaxed text-[#000000]/55 md:text-lg">
                Përzgjedhje ekskluzive e pronave më të mira për ty.
              </p>
            </div>

            <Link
              href="/properties"
              className="inline-flex items-center gap-2 rounded-xl bg-[#6B4C3B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#000000]"
            >
              Shiko të gjitha
              <span>→</span>
            </Link>
          </div>

          <FeaturedProperties />
        </div>
      </section>

      {/* 3. RENT PROPERTIES */}
      <section className="bg-[#F7F3EE] px-6 py-16 md:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-7xl">
          <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#6B4C3B]">
                🔑 For Rent
              </p>

              <h2 className="text-4xl font-bold tracking-tight text-[#000000] md:text-5xl">
                Pronat me Qira
              </h2>

              <p className="mt-4 text-base leading-relaxed text-[#000000]/55 md:text-lg">
                Zbulo pronat premium për qira në lokacione të zgjedhura.
              </p>
            </div>

            <Link
              href="/properties?type=rent"
              className="inline-flex items-center gap-2 rounded-xl bg-[#6B4C3B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#000000]"
            >
              Shiko të gjitha
              <span>→</span>
            </Link>
          </div>

          <RentProperties />
        </div>
      </section>

      {/* 4. CTA SECTION */}
      <section className="bg-[#F3E9E0] px-6 py-20 md:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#000000] md:text-4xl lg:text-5xl">
            Gati të Gjesh Shtëpinë e Ëndrrave?
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#000000]/55 md:text-lg">
            Regjistrohu tani dhe fillo të ruash pronat e preferuara, të
            rezervosh takime dhe të marrësh njoftime.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {!session?.user && (
              <Link
                href="/register"
                className="rounded-xl bg-[#6B4C3B] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#000000]"
              >
                Regjistrohu Falas
              </Link>
            )}

            <Link
              href="/properties"
              className="rounded-xl border-2 border-[#6B4C3B] bg-transparent px-8 py-4 text-sm font-semibold text-[#6B4C3B] transition hover:bg-[#6B4C3B] hover:text-white"
            >
              Shfleto Pronat
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}