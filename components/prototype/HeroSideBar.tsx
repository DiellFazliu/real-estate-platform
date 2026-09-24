'use client'

import Link from 'next/link'
import { AISearchCompact } from '@/components/search/AISearchCompact'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface PlatformStats {
  soldCount: number
  listedCount: number
  rentCount: number
  saleCount: number
}

// ═══════════════════════════════════════════════════════════════
// HERO SIDEBAR
// ═══════════════════════════════════════════════════════════════

export function HeroSidebar({ stats }: { stats: PlatformStats }) {
  return (
    <aside className="relative h-full flex flex-col bg-[#F7F3EE] border-l border-[#E8DDD2] overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#6B4C3B]/4 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#6B4C3B]/4 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative flex flex-col h-full px-10 lg:px-14 pt-20 lg:pt-24 pb-12 lg:pb-10 overflow-y-auto scrollbar-hide">
        {/* ═══════════════════════════════════════════════════ */}
        {/* TOP SECTION - Hero + AI Search                        */}
        {/* ═══════════════════════════════════════════════════ */}
        <div className="flex-1 flex flex-col justify-center">
          <h2 className="text-3xl lg:text-[2.5rem] font-bold leading-[1.1] tracking-tight text-black mb-5 pt-8">
            Gjej vendin që
            <br />
            <span className="text-[#6B4C3B]">do të duash.</span>
          </h2>

          <p className="text-sm lg:text-[0.9375rem] leading-relaxed text-[#6B4C3B]/60 mb-10 max-w-sm">
            Shfleto përzgjedhjen tonë të pronave premium në qytetin tënd.
          </p>

          <AISearchCompact />
        </div>

        {/* ═══════════════════════════════════════════════════ */}
        {/* BOTTOM SECTION - Platform Stats                       */}
        {/* ═══════════════════════════════════════════════════ */}
        <div className="pt-8 mt-8 border-t border-[#E8DDD2]">
          <StatsBlock stats={stats} />
        </div>
      </div>
    </aside>
  )
}

// ═══════════════════════════════════════════════════════════════
// STATS BLOCK - Dy statistika në një rresht horizontal
// ═══════════════════════════════════════════════════════════════

function StatsBlock({ stats }: { stats: PlatformStats }) {
  return (
    <div>
      {/* Section label */}
      <p className="text-[12px] uppercase tracking-[0.2em] text-[#6B4C3B]/50 font-medium mb-4">
        Aktualisht
      </p>

      {/* Dy statistika horizontale */}
      <div className="grid grid-cols-2 gap-6">
        {/* Listed Count */}
        <Link href="/properties" className="group block">
          <p className="text-4xl font-bold text-[#6B4C3B] leading-none mb-1.5 group-hover:text-black transition-colors">
            {stats.listedCount.toLocaleString()}
          </p>
          <p className="text-[10px] text-[#6B4C3B]/50 font-medium uppercase tracking-wider">
            Të Listuara
          </p>
        </Link>

        {/* Sold Count */}
        <Link href="/properties?status=sold" className="group block">
          <p className="text-4xl font-bold text-[#6B4C3B] leading-none mb-1.5 group-hover:text-black transition-colors">
            {stats.soldCount.toLocaleString()}
          </p>
          <p className="text-[10px] text-[#6B4C3B]/50 font-medium uppercase tracking-wider">
            Të Shitura
          </p>
        </Link>
      </div>
    </div>
  )
}