import { HeroSection } from '@/components/prototype/HeroSection'
// import { NLPSearchBar } from '@/components/search/NLPSearchBar'
import { FeaturedProperties } from '@/components/prototype/FeaturedProperties'
import { RentProperties } from '@/components/prototype/RentProperties'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* ═══════════════════════════════════════════════════════ */}
      {/* 1. HERO SECTION                                          */}
      {/* ═══════════════════════════════════════════════════════ */}
      <HeroSection />      

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 3. FEATURED PROPERTIES                                   */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="relative py-24 bg-[#0a0a0a]">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-yellow-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="inline-block px-4 py-1.5 bg-yellow-500/10 text-yellow-400 text-xs font-medium rounded-full mb-4 border border-yellow-500/20">
                ⭐ Featured
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">
                Pronat e Zgjedhura
              </h2>
              <p className="text-white/50 text-lg">
                Përzgjedhje ekskluzive për ty
              </p>
            </div>
            <a
              href="/properties"
              className="mt-4 md:mt-0 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition border border-white/10 inline-flex items-center gap-2"
            >
              Shiko të gjitha
              <span>→</span>
            </a>
          </div>

          {/* Featured properties grid */}
          <FeaturedProperties />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 4. RENT PROPERTIES                                       */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="relative py-24 bg-[#0f0f0f]">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="inline-block px-4 py-1.5 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-full mb-4 border border-blue-500/20">
                🔑 For Rent
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-3">
                Pronat me Qira
              </h2>
              <p className="text-white/50 text-lg">
                Zbulo pronat premium për qira
              </p>
            </div>
            <a
              href="/properties?type=rent"
              className="mt-4 md:mt-0 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition border border-white/10 inline-flex items-center gap-2"
            >
              Shiko të gjitha
              <span>→</span>
            </a>
          </div>

          {/* Rent properties grid */}
          <RentProperties />
        </div>
      </section>
    </div>
  )
}