import { HeroSection } from '@/components/prototype/HeroSection'
import { NLPSearchBar } from '@/components/search/NLPSearchBar'
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
      {/* 2. NLP SEARCH SECTION                                    */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="relative py-20 bg-gradient-to-b from-[#0a0a0a] via-[#0d0d0d] to-[#0f0f0f]">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-full mb-4 border border-blue-500/20">
              ✨ AI-Powered Search
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Kërko me Gjuhë Natyrore
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Thjesht shkruaj çfarë kërkon. Inteligjenca artificiale e kupton
              dhe të sjell rezultatet.
            </p>
          </div>

          {/* Search bar */}
          <NLPSearchBar />
        </div>
      </section>

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

      {/* ═══════════════════════════════════════════════════════ */}
      {/* 5. CTA SECTION                                           */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="relative py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Gati të Gjesh Shtëpinë e Ëndrrave?
          </h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Regjistrohu tani dhe fillo të ruash pronat e preferuara, të
            rezervosh takime dhe të marrësh njoftime.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/register"
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-gray-100 transition shadow-2xl"
            >
              Regjistrohu Falas
            </a>
            <a
              href="/properties"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-bold hover:bg-white/20 transition border border-white/20"
            >
              Shfleto Pronat
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}