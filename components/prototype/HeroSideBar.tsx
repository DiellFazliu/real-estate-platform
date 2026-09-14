'use client'

import { useState } from 'react'
import Link from 'next/link'

export function HeroSidebar() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.append('q', searchQuery)
    window.location.href = `/properties?${params.toString()}`
  }

  return (
    <div className="h-full flex flex-col justify-between p-8 lg:p-12 bg-white">
      {/* ═══════════════════════════════════════════════════════════
          TOP - BRANDING & SEARCH
      ═══════════════════════════════════════════════════════════ */}
      <div>
        {/* Small Label */}
        <p className="text-xs font-medium tracking-[0.2em] text-gray-400 uppercase">
          Real Estate
        </p>

        {/* Main Heading - Clean Serif */}
        <h2 className="mt-6 text-3xl lg:text-4xl font-light text-gray-900 leading-[1.15]">
          Find a place
          <br />
          you'll love to live.
        </h2>

        {/* Description */}
        <p className="mt-4 text-sm text-gray-500 leading-relaxed max-w-xs">
          Browse our curated selection of premium properties across the city.
        </p>

        {/* ═══════════════════════════════════════════════════════════
            SEARCH - Minimalist
        ═══════════════════════════════════════════════════════════ */}
        <form onSubmit={handleSearch} className="mt-10">
          <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
            Search
          </label>

          <div className="flex items-center border-b border-gray-200 focus-within:border-gray-900 transition-colors">
            <input
              type="text"
              placeholder="Location, property type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3 bg-transparent text-gray-900 placeholder-gray-300 text-sm focus:outline-none"
            />
            <button
              type="submit"
              className="ml-2 p-2 text-gray-400 hover:text-gray-900 transition-colors"
              aria-label="Search"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </div>

          <button
            type="submit"
            className="mt-6 w-full py-3.5 bg-gray-900 text-white text-sm font-medium rounded-none hover:bg-gray-800 transition-colors"
          >
            Search Properties
          </button>
        </form>

        {/* ═══════════════════════════════════════════════════════════
            STATS - Minimal
        ═══════════════════════════════════════════════════════════ */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-2xl font-light text-gray-900">500</p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-400">
                Listings
              </p>
            </div>
            <div>
              <p className="text-2xl font-light text-gray-900">200</p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-400">
                Clients
              </p>
            </div>
            <div>
              <p className="text-2xl font-light text-gray-900">50</p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-gray-400">
                Agents
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          BOTTOM - QUICK LINKS (Minimal)
      ═══════════════════════════════════════════════════════════ */}
      <div className="mt-12">
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-4">
          Explore
        </p>

        <div className="space-y-0">
          <Link
            href="/properties?type=sale"
            className="group flex items-center justify-between py-3 border-b border-gray-100 hover:border-gray-900 transition-colors"
          >
            <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
              Properties for Sale
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-300 group-hover:text-gray-900 group-hover:translate-x-1 transition-all"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>

          <Link
            href="/properties?type=rent"
            className="group flex items-center justify-between py-3 border-b border-gray-100 hover:border-gray-900 transition-colors"
          >
            <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
              Properties for Rent
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-300 group-hover:text-gray-900 group-hover:translate-x-1 transition-all"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>

          <Link
            href="/agents"
            className="group flex items-center justify-between py-3 border-b border-gray-100 hover:border-gray-900 transition-colors"
          >
            <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
              Our Agents
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-300 group-hover:text-gray-900 group-hover:translate-x-1 transition-all"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}