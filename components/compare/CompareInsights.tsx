'use client'

import {
  AlertCircle,
  ArrowRight,
  Award,
  Check,
  ChevronDown,
  ChevronUp,
  LoaderCircle,
  Minus,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

interface CompareProperty {
  id: number
  slug: string
  title: string
  price: number
  area: number | null
  bedrooms: number | null
  city: string | null
  listing_type: string
  primary_image_url: string | null
}

type Focus = 'general' | 'buying' | 'renting'

type Priority =
  | 'price'
  | 'space'
  | 'bedrooms'
  | 'amenities'
  | 'condition'

interface Dimension {
  key: string
  label: string
  priorityRelevant: boolean
  values: Array<{
    propertyId: number
    display: string
    isWinner: boolean
  }>
  winnerIds: number[]
}

interface Analysis {
  recommendation: {
    propertyId: number | null
    headline: string
    narrative: string
  }
  comparison: Dimension[]
  strengths: string[]
  tradeoffs: string[]
  caveats: string[]
}

const focusOptions: Array<{
  value: Focus
  label: string
  description: string
}> = [
  {
    value: 'general',
    label: 'Krahasim i përgjithshëm',
    description: 'Pa filtrim',
  },
  {
    value: 'buying',
    label: 'Për blerje',
    description: 'Vetëm pronat në shitje',
  },
  {
    value: 'renting',
    label: 'Për qira',
    description: 'Vetëm pronat me qira',
  },
]

const priorityOptions: Array<{ value: Priority; label: string }> = [
  { value: 'price', label: 'Çmimi' },
  { value: 'space', label: 'Hapësira' },
  { value: 'bedrooms', label: 'Dhomat e gjumit' },
  { value: 'amenities', label: 'Komoditetet' },
  { value: 'condition', label: 'Gjendja' },
]

function formatPrice(value: number, listingType: string) {
  const price = `€${value.toLocaleString('de-DE')}`
  return listingType === 'rent' ? `${price} / muaj` : price
}

export function CompareInsights({
  properties,
}: {
  properties: CompareProperty[]
}) {
  const [focus, setFocus] = useState<Focus>('general')
  const [priorities, setPriorities] = useState<Priority[]>([])
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [source, setSource] = useState<'ai' | 'fallback' | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCaveats, setShowCaveats] = useState(false)

  const recommendedProperty = useMemo(
    () =>
      analysis?.recommendation.propertyId
        ? properties.find(
            (p) => p.id === analysis.recommendation.propertyId,
          ) ?? null
        : null,
    [analysis, properties],
  )

  function togglePriority(priority: Priority) {
    setPriorities((current) => {
      if (current.includes(priority)) {
        return current.filter((p) => p !== priority)
      }
      if (current.length >= 4) return current
      return [...current, priority]
    })
    setAnalysis(null)
    setSource(null)
  }

  async function analyze() {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/properties/compare/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: properties.map((p) => p.id),
          focus,
          priorities,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Analiza dështoi.')
      }

      setAnalysis(data.analysis)
      setSource(data.source)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analiza dështoi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mb-10 overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-sm">
      {/* ───────── Controls ───────── */}
      <div className="border-b border-black/8 bg-[#FBF8F5] p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#6B4C3B] text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6B4C3B]">
              Analizë inteligjente
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-black">
              Ndihmë për vendimin
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-black/55">
              Zgjidh qëllimin dhe prioritetet. Analiza bazohet vetëm në
              të dhënat e publikuara të pronave.
            </p>
          </div>
        </div>

        <div className="mt-7">
          <p className="text-sm font-semibold text-black">
            Çfarë po kërkoni?
          </p>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {focusOptions.map((option) => {
              const active = focus === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setFocus(option.value)
                    setAnalysis(null)
                    setSource(null)
                  }}
                  className={`rounded-2xl border p-4 text-left transition ${
                    active
                      ? 'border-[#6B4C3B] bg-[#F3E9E0]'
                      : 'border-black/8 bg-white hover:border-[#6B4C3B]/30'
                  }`}
                >
                  <p
                    className={`text-sm font-semibold ${
                      active ? 'text-[#6B4C3B]' : 'text-black'
                    }`}
                  >
                    {option.label}
                  </p>
                  <p className="mt-1 text-xs text-black/45">
                    {option.description}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-black">
                Çfarë ka më shumë rëndësi?
              </p>
              <p className="mt-1 text-xs text-black/40">
                Opsionale · deri në 4 prioritete
              </p>
            </div>
            <span className="text-xs text-black/40">
              {priorities.length}/4
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {priorityOptions.map((option) => {
              const active = priorities.includes(option.value)

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => togglePriority(option.value)}
                  disabled={!active && priorities.length >= 4}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                    active
                      ? 'border-[#6B4C3B] bg-[#6B4C3B] text-white'
                      : 'border-black/10 bg-white text-black/55 hover:border-[#6B4C3B]/30 disabled:cursor-not-allowed disabled:opacity-40'
                  }`}
                >
                  {active && <Check className="mr-1 inline h-3 w-3" />}
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-7 flex justify-end">
          <button
            type="button"
            onClick={analyze}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-[#6B4C3B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {loading ? 'Duke analizuar...' : 'Analizo pronat'}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* ───────── Results ───────── */}
      {analysis && (
        <div className="space-y-6 p-6 sm:p-8">
          {/* Verdict */}
          <div className="overflow-hidden rounded-[1.5rem] border border-[#6B4C3B]/15 bg-gradient-to-br from-[#F7F1EB] to-[#FBF8F5]">
            <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6B4C3B] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white">
                    <Award className="h-3.5 w-3.5" />
                    {recommendedProperty
                      ? 'Rekomandimi'
                      : 'Pa rekomandim'}
                  </span>

                  {source === 'ai' && (
                    <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-[#6B4C3B]">
                      <Sparkles className="mr-1 inline h-3 w-3" />
                      AI
                    </span>
                  )}
                </div>

                <h3 className="mt-5 max-w-3xl text-2xl font-bold leading-tight tracking-tight text-black sm:text-3xl">
                  {analysis.recommendation.headline}
                </h3>

                <p className="mt-4 max-w-3xl text-sm leading-7 text-black/65">
                  {analysis.recommendation.narrative}
                </p>

                {analysis.strengths.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {analysis.strengths.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800"
                      >
                        <Check className="h-3 w-3" />
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {analysis.tradeoffs.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {analysis.tradeoffs.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800"
                      >
                        <Minus className="h-3 w-3" />
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {recommendedProperty && (
                <Link
                  href={`/properties/${recommendedProperty.slug}`}
                  className="group overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-black/5">
                    {recommendedProperty.primary_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={recommendedProperty.primary_image_url}
                        alt={recommendedProperty.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-black/35">
                        Pa fotografi
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <p className="line-clamp-2 text-sm font-bold text-black">
                      {recommendedProperty.title}
                    </p>

                    <div className="mt-2 flex items-center gap-3 text-xs text-black/50">
                      <span>
                        {formatPrice(
                          recommendedProperty.price,
                          recommendedProperty.listing_type,
                        )}
                      </span>
                      {recommendedProperty.area && (
                        <span>{recommendedProperty.area} m²</span>
                      )}
                    </div>

                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#6B4C3B]">
                      Shiko pronën
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Comparison matrix */}
          {analysis.comparison.length > 0 && (
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#6B4C3B]" />
                <h3 className="text-lg font-bold text-black">
                  Krahasimi sipas dimensioneve
                </h3>
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-black/8 bg-[#FCFAF8]">
                {/* Header row */}
                <div
                  className="grid gap-px bg-black/5"
                  style={{
                    gridTemplateColumns: `160px repeat(${properties.length}, minmax(0, 1fr))`,
                  }}
                >
                  <div className="bg-[#FCFAF8] p-3 text-xs font-bold uppercase tracking-wider text-[#6B4C3B]">
                    Dimensioni
                  </div>
                  {properties.map((p) => (
                    <div
                      key={p.id}
                      className="bg-[#FCFAF8] p-3 text-xs font-semibold text-black"
                    >
                      <p className="line-clamp-2">{p.title}</p>
                    </div>
                  ))}
                </div>

                {/* Value rows */}
                {analysis.comparison.map((dim) => (
                  <div
                    key={dim.key}
                    className="grid gap-px border-t border-black/5 bg-black/5"
                    style={{
                      gridTemplateColumns: `160px repeat(${properties.length}, minmax(0, 1fr))`,
                    }}
                  >
                    <div className="flex items-center gap-2 bg-[#FCFAF8] p-3 text-xs font-semibold text-black/70">
                      {dim.label}
                      {dim.priorityRelevant && (
                        <span className="rounded-full bg-[#F3E9E0] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#6B4C3B]">
                          Prioritet
                        </span>
                      )}
                    </div>

                    {dim.values.map((v) => (
                      <div
                        key={v.propertyId}
                        className={`flex items-center justify-between gap-2 bg-white p-3 text-sm ${
                          v.isWinner
                            ? 'font-bold text-emerald-700'
                            : 'text-black/70'
                        }`}
                      >
                        <span>{v.display}</span>
                        {v.isWinner && (
                          <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Caveats */}
          {analysis.caveats.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowCaveats((v) => !v)}
                className="flex items-center gap-2 text-xs font-semibold text-black/45 hover:text-black"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                {showCaveats
                  ? 'Fshih shënimet'
                  : 'Shfaq shënimet e analizës'}

                {showCaveats ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>

              {showCaveats && (
                <ul className="mt-3 space-y-1.5 rounded-xl border border-black/8 bg-[#FCFAF8] p-4">
                  {analysis.caveats.map((c) => (
                    <li
                      key={c}
                      className="text-xs leading-5 text-black/60"
                    >
                      • {c}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <p className="text-center text-[11px] text-black/30">
            Krahasimi bazohet në të dhënat e publikuara. Nuk është
            vlerësim profesional i pronës.
          </p>
        </div>
      )}
    </section>
  )
}