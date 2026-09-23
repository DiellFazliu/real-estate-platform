'use client'

import Link from 'next/link'
import { AISearchCompact } from '@/components/search/AISearchCompact'

// ═══════════════════════════════════════════════════════════════
// HERO SIDEBAR
// ═══════════════════════════════════════════════════════════════

export function HeroSidebar() {
  return (
    <aside className="relative h-full flex flex-col bg-[#F7F3EE] border-l border-[#E8DDD2] overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#6B4C3B]/4 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#6B4C3B]/4 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative flex flex-col h-full px-10 lg:px-14 pt-20 lg:pt-24 pb-12 lg:pb-10 overflow-y-auto scrollbar-hide">
        {/* TOP SECTION */}
        <div className="flex-1 flex flex-col justify-center">
          {/* Heading */}
          <h2 className="text-3xl lg:text-[2.5rem] font-bold leading-[1.1] tracking-tight text-black mb-5">
            Gjej vendin që
            <br />
            <span className="text-[#6B4C3B]">do të duash.</span>
          </h2>

          {/* Description */}
          <p className="text-sm lg:text-[0.9375rem] leading-relaxed text-[#6B4C3B]/60 mb-10 max-w-sm">
            Shfleto përzgjedhjen tonë të pronave premium në qytetin tënd.
          </p>

          {/* ⭐ AI SEARCH COMPACT */}
          <AISearchCompact />
        </div>

        {/* BOTTOM SECTION */}
        <div className="pt-8 mt-8 border-t border-[#E8DDD2]">
          <ExploreLinks />
        </div>
      </div>
    </aside>
  )
}

// ═══════════════════════════════════════════════════════════════
// EXPLORE LINKS
// ═══════════════════════════════════════════════════════════════

const EXPLORE_LINKS = [
  { label: 'Prona në Shitje', href: '/properties?type=sale' },
  { label: 'Prona me Qira', href: '/properties?type=rent' },
  { label: 'Agjentët Tanë', href: '/about#Agents' },
]

function ExploreLinks() {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-[#6B4C3B]/50 font-medium mb-5">
        Eksploro
      </p>

      <div className="space-y-1">
        {EXPLORE_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex items-center justify-between py-3 border-b border-[#E8DDD2] last:border-b-0 hover:border-[#6B4C3B] transition-colors"
          >
            <span className="text-sm text-[#6B4C3B]/80 group-hover:text-black font-medium transition-colors">
              {link.label}
            </span>
            <ArrowIcon />
          </Link>
        ))}
      </div>
    </div>
  )
}

function ArrowIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-[#6B4C3B]/40 group-hover:text-[#6B4C3B] group-hover:translate-x-1 transition-all"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}