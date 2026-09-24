'use client'

import { useState, useRef, useTransition, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const SUGGESTIONS = [
  'apartament 2 dhoma në Prishtinë',
  'shtëpi me kopsht nën 300 mijë',
  'qira me ashensor në Dardania',
  'vilë me pishinë',
  'lokal biznesi në Qendër',
]

export function AISearch() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Keep the search input synchronized with the URL
  useEffect(() => {
    setQuery(searchParams.get('q') || '')
  }, [searchParams])

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

      // Start from the current URL so page context is preserved
      const params = new URLSearchParams(searchParams.toString())

      // Remove old search/filter values
      params.delete('q')
      params.delete('city')
      params.delete('neighborhood')
      params.delete('bedrooms')
      params.delete('bathrooms')
      params.delete('minPrice')
      params.delete('maxPrice')
      params.delete('propertyType')
      params.delete('features')

      // Add the new search
      params.set('q', q)

      if (p.city) params.set('city', p.city)
      if (p.neighborhood) params.set('neighborhood', p.neighborhood)
      if (p.bedrooms) params.set('bedrooms', String(p.bedrooms))
      if (p.bathrooms) params.set('bathrooms', String(p.bathrooms))
      if (p.minPrice) params.set('minPrice', String(p.minPrice))
      if (p.maxPrice) params.set('maxPrice', String(p.maxPrice))
      if (p.propertyType) params.set('propertyType', p.propertyType)

      if (p.features?.length) {
        params.set('features', p.features.join(','))
      }

      // type=rent or type=sale remains untouched

      startTransition(() => {
        router.push(`/properties?${params.toString()}#results`)
      })
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        setError(e.message)
      }
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
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="flex w-full flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-lg text-[#6B4C3B]">
            ⌕
          </span>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Përshkruaj pronën që kërkon… p.sh. apartament 3 dhoma në Prishtinë nën 200 mijë"
            className="w-full rounded-2xl border border-[#6B4C3B]/15 bg-white py-4 pl-12 pr-12 text-base text-[#000000] placeholder:text-[#000000]/35 shadow-sm transition focus:border-[#6B4C3B] focus:outline-none focus:ring-2 focus:ring-[#6B4C3B]/20 disabled:opacity-60"
            disabled={busy}
            autoComplete="off"
          />

          {query && !busy && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Pastro"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#000000]/40 transition hover:text-[#000000]"
            >
              ✕
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={busy || !query.trim()}
          className="shrink-0 rounded-2xl bg-[#6B4C3B] px-8 py-4 text-sm font-semibold tracking-wide text-white shadow-sm transition hover:bg-[#000000] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          {busy ? 'Duke kërkuar…' : 'Kërko me AI'}
        </button>
      </form>

      {!busy && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-medium uppercase tracking-[0.15em] text-[#6B4C3B]/70">
            Provo:
          </span>

          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSuggestion(s)}
              className="rounded-full border border-[#6B4C3B]/20 bg-white px-4 py-1.5 text-xs font-medium text-[#6B4C3B] transition hover:border-[#6B4C3B] hover:bg-[#6B4C3B] hover:text-white, cursor-pointer hover:text-white"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <span className="font-semibold">Gabim: </span>
          {error}
        </div>
      )}
    </div>
  )
}