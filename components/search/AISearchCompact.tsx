'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'

// ⭐ Vetëm 2 sugjerime (kompakt)
const SUGGESTIONS = [
  'apartament 2 dhoma',
  'vilë me pishinë',
]

export function AISearchCompact() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const search = async (q: string) => {
    if (!q.trim()) return

    abortRef.current?.abort()
    abortRef.current = new AbortController()

    setError(null)

    try {
      const res = await fetch('/api/search/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, limit: 1 }),
        signal: abortRef.current.signal,
      })

      if (!res.ok) throw new Error('Kërkimi dështoi')

      const data = await res.json()
      const p = data.parsed || {}

      const params = new URLSearchParams()
      params.set('q', q)

      if (p.city) params.set('city', p.city)
      if (p.neighborhood) params.set('neighborhood', p.neighborhood)
      if (p.bedrooms) params.set('bedrooms', String(p.bedrooms))
      if (p.bathrooms) params.set('bathrooms', String(p.bathrooms))
      if (p.minPrice) params.set('minPrice', String(p.minPrice))
      if (p.maxPrice) params.set('maxPrice', String(p.maxPrice))
      if (p.propertyType) params.set('propertyType', p.propertyType)
      if (p.listingType) params.set('type', p.listingType)
      if (p.features?.length) params.set('features', p.features.join(','))

      startTransition(() => {
        router.push(`/properties?${params.toString()}#results`)
      })
    } catch (e: any) {
      if (e.name !== 'AbortError') setError(e.message)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    search(query)
  }

  const handleSuggestion = (s: string) => {
    setQuery(s)
    search(s)
  }

  const busy = isPending

  return (
    <div className="w-full space-y-4">
      {/* Label */}
      <label className="block text-[10px] font-medium uppercase tracking-[0.2em] text-[#6B4C3B]/50">
        Kërko me AI
      </label>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* ⭐ INPUT MË I MADH */}
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#6B4C3B]">
            ⌕
          </span>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="P.sh. '3 bedroom apartment in Prishtina'"
            className="w-full rounded-xl border border-[#E8DDD2] bg-white py-4 pl-11 pr-10 text-base text-black placeholder-[#6B4C3B]/30 shadow-sm transition focus:border-[#6B4C3B] focus:outline-none focus:ring-2 focus:ring-[#6B4C3B]/10 disabled:opacity-60"
            disabled={busy}
            autoComplete="off"
          />

          {query && !busy && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Pastro"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B4C3B]/40 transition hover:text-[#6B4C3B]"
            >
              ✕
            </button>
          )}
        </div>

        {/* ⭐ "Provo" MË KOMPAKT */}
        {!busy && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[10px] font-medium uppercase tracking-[0.15em] text-[#6B4C3B]/40">
              Provo:
            </span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSuggestion(s)}
                className="rounded-full border border-[#E8DDD2] bg-white px-2.5 py-0.5 text-[10px] font-medium text-[#6B4C3B]/70 transition hover:border-[#6B4C3B] hover:bg-[#6B4C3B] hover:text-white cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* ⭐ BUTON I NJËJTË ME INPUT */}
        <button
          type="submit"
          disabled={busy || !query.trim()}
          className="w-full rounded-xl border border-[#6B4C3B] bg-[#6B4C3B] py-4 text-base font-semibold tracking-wide text-white shadow-sm transition hover:bg-[#4A342A] hover:border-[#4A342A] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {busy ? 'Duke kërkuar…' : 'Kërko me AI'}
        </button>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            <span className="font-semibold">Gabim: </span>
            {error}
          </div>
        )}
      </form>
    </div>
  )
}