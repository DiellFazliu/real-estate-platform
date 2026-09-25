'use client'

import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  Lightbulb,
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

type Focus = 'general' | 'buying' | 'renting' | 'investment'

type Priority =
  | 'price'
  | 'space'
  | 'bedrooms'
  | 'location'
  | 'property_type'
  | 'amenities'
  | 'condition'

interface Analysis {
  recommendation: {
    propertyId: number | null
    headline: string
    explanation: string
  }
  summary: string
  keyReasons: Array<{
    propertyId: number
    title: string
    explanation: string
  }>
  comparisonHighlights: Array<{
    dimension: string
    propertyValues: Array<{
      propertyId: number
      value: string
      emphasis: 'positive' | 'neutral' | 'negative' | 'important'
    }>
    takeaway: string
  }>
  tradeoffs: Array<{
    propertyIds: number[]
    title: string
    explanation: string
  }>
  considerations: string[]
  uncertainty: string[]
}

const focusOptions: Array<{
  value: Focus
  label: string
  description: string
}> = [
  {
    value: 'general',
    label: 'Në përgjithësi',
    description: 'Krahasim i plotë',
  },
  {
    value: 'buying',
    label: 'Për blerje',
    description: 'Përshtatshmëria për blerje',
  },
  {
    value: 'renting',
    label: 'Për qira',
    description: 'Përshtatshmëria për qira',
  },
  {
    value: 'investment',
    label: 'Investim',
    description: 'Analizë nga të dhënat e disponueshme',
  },
]

const priorityOptions: Array<{
  value: Priority
  label: string
}> = [
  { value: 'price', label: 'Çmimi' },
  { value: 'space', label: 'Hapësira' },
  { value: 'bedrooms', label: 'Dhoma gjumi' },
  { value: 'location', label: 'Lokacioni' },
  { value: 'property_type', label: 'Lloji i pronës' },
  { value: 'amenities', label: 'Komoditetet' },
  { value: 'condition', label: 'Gjendja' },
]

function formatPrice(value: number, listingType: string) {
  const price = `€${value.toLocaleString()}`
  return listingType === 'rent' ? `${price} / muaj` : price
}

function emphasisClass(
  emphasis: 'positive' | 'neutral' | 'negative' | 'important',
) {
  if (emphasis === 'positive') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  }
  if (emphasis === 'negative') {
    return 'border-red-200 bg-red-50 text-red-800'
  }
  if (emphasis === 'important') {
    return 'border-[#D9C4B4] bg-[#F3E9E0] text-[#6B4C3B]'
  }
  return 'border-black/8 bg-white text-black/65'
}

function EmphasisIcon({
  emphasis,
}: {
  emphasis: 'positive' | 'neutral' | 'negative' | 'important'
}) {
  if (emphasis === 'positive') {
    return <Check className="h-3.5 w-3.5 text-emerald-600" />
  }
  if (emphasis === 'negative') {
    return <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
  }
  if (emphasis === 'important') {
    return <Info className="h-3.5 w-3.5 text-[#6B4C3B]" />
  }
  return <Minus className="h-3.5 w-3.5 text-black/30" />
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
  const [showDetails, setShowDetails] = useState(false)

  const recommendedProperty = useMemo(
    () =>
      analysis?.recommendation.propertyId
        ? properties.find(
            (property) =>
              property.id === analysis?.recommendation.propertyId,
          ) ?? null
        : null,
    [analysis, properties],
  )

  function togglePriority(priority: Priority) {
    setPriorities((current) => {
      if (current.includes(priority)) {
        return current.filter((item) => item !== priority)
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
          ids: properties.map((property) => property.id),
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
      setError(
        err instanceof Error ? err.message : 'Analiza dështoi.',
      )
    } finally {
      setLoading(false)
    }
  }

  const hasAnyInsight =
    analysis &&
    (analysis.keyReasons.length > 0 ||
      analysis.comparisonHighlights.length > 0 ||
      analysis.tradeoffs.length > 0 ||
      analysis.considerations.length > 0 ||
      analysis.uncertainty.length > 0)

  return (
    <section className="mb-10 overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-sm">
      {/* ─────────────── Controls ─────────────── */}
      <div className="border-b border-black/8 bg-[#FBF8F5] p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#6B4C3B] text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#6B4C3B]">
              Krahasim me AI
            </p>

            <h2 className="mt-1 text-2xl font-bold tracking-tight text-black">
              Ndihmë për vendimin
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-black/55">
              AI analizon pronat e përzgjedhura, dallimet, avantazhet
              dhe kompromiset sipas qëllimit tuaj.
            </p>
          </div>
        </div>

        {/* Focus */}
        <div className="mt-7">
          <p className="text-sm font-semibold text-black">
            Çfarë po vendosni?
          </p>

          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
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

        {/* Priorities */}
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
                  {active && (
                    <Check className="mr-1 inline h-3 w-3" />
                  )}
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Analyze button */}
        <div className="mt-7 flex items-center justify-between gap-4">
          <p className="hidden text-xs text-black/40 sm:block">
            Nuk ka nevojë për prompt. AI përdor të dhënat e pronave
            dhe zgjedhjet tuaja.
          </p>

          <button
            type="button"
            onClick={analyze}
            disabled={loading}
            className="ml-auto inline-flex items-center gap-2 rounded-xl bg-[#6B4C3B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {loading ? 'AI po analizon...' : 'Analizo pronat'}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {/* ─────────────── Results ─────────────── */}
      {analysis && (
        <div className="p-6 sm:p-8">
          {/* Verdict */}
          <div className="overflow-hidden rounded-[1.5rem] border border-[#6B4C3B]/15 bg-[#F7F1EB]">
            <div className="p-6 sm:p-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6B4C3B] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white">
                  <Sparkles className="h-3.5 w-3.5" />
                  {source === 'ai'
                    ? 'Rekomandim nga AI'
                    : 'Krahasim faktik'}
                </span>

                {source === 'fallback' && (
                  <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-black/45">
                    AI nuk ishte i disponueshëm
                  </span>
                )}
              </div>

              <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B4C3B]">
                    Përfundimi
                  </p>

                  <h3 className="mt-2 max-w-3xl text-2xl font-bold leading-tight tracking-tight text-black sm:text-3xl">
                    {analysis.recommendation.headline}
                  </h3>

                  <p className="mt-4 max-w-3xl text-sm leading-7 text-black/65">
                    {analysis.recommendation.explanation}
                  </p>
                </div>

                {recommendedProperty && (
                  <Link
                    href={`/properties/${recommendedProperty.slug}`}
                    className="group overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm"
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

                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#6B4C3B] shadow-sm">
                        Zgjedhja e rekomanduar
                      </span>
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

              {analysis.summary && (
                <div className="mt-6 border-t border-black/10 pt-5">
                  <p className="text-sm font-bold text-black">
                    Përmbledhja
                  </p>
                  <p className="mt-2 max-w-4xl text-sm leading-7 text-black/60">
                    {analysis.summary}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Key reasons */}
          {analysis.keyReasons.length > 0 && (
            <section className="mt-7">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#6B4C3B]" />
                <h3 className="text-lg font-bold text-black">Pse?</h3>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {analysis.keyReasons.map((reason) => {
                  const property = properties.find(
                    (item) => item.id === reason.propertyId,
                  )

                  return (
                    <div
                      key={`${reason.propertyId}-${reason.title}`}
                      className="rounded-2xl border border-black/8 bg-white p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#6B4C3B]">
                            {reason.title}
                          </p>

                          <p className="mt-1 text-sm font-bold text-black">
                            {property?.title ?? 'Prona'}
                          </p>
                        </div>

                        <Check className="h-5 w-5 shrink-0 text-emerald-600" />
                      </div>

                      <p className="mt-3 text-sm leading-6 text-black/60">
                        {reason.explanation}
                      </p>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Comparison highlights */}
          {analysis.comparisonHighlights.length > 0 && (
            <section className="mt-8">
              <h3 className="text-lg font-bold text-black">
                Dallimet që kanë rëndësi
              </h3>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                {analysis.comparisonHighlights.map((highlight) => (
                  <div
                    key={highlight.dimension}
                    className="rounded-2xl border border-black/8 bg-[#FCFAF8] p-5"
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6B4C3B]">
                      {highlight.dimension}
                    </p>

                    <div className="mt-4 space-y-2">
                      {highlight.propertyValues.map((item) => {
                        const property = properties.find(
                          (candidate) =>
                            candidate.id === item.propertyId,
                        )

                        return (
                          <div
                            key={item.propertyId}
                            className={`flex items-center justify-between gap-4 rounded-xl border px-3 py-2.5 ${emphasisClass(
                              item.emphasis,
                            )}`}
                          >
                            <span className="flex min-w-0 items-center gap-2">
                              <EmphasisIcon
                                emphasis={item.emphasis}
                              />
                              <span className="min-w-0 truncate text-xs font-medium">
                                {property?.title ?? 'Prona'}
                              </span>
                            </span>

                            <span className="shrink-0 text-xs font-bold">
                              {item.value}
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    {highlight.takeaway && (
                      <p className="mt-4 border-t border-black/8 pt-4 text-sm leading-6 text-black/60">
                        {highlight.takeaway}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Tradeoffs */}
          {analysis.tradeoffs.length > 0 && (
            <section className="mt-8">
              <div className="flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-[#6B4C3B]" />
                <h3 className="text-lg font-bold text-black">
                  Kompromiset
                </h3>
              </div>

              <div className="mt-4 space-y-3">
                {analysis.tradeoffs.map((tradeoff, index) => (
                  <div
                    key={`${tradeoff.title}-${index}`}
                    className="rounded-2xl border border-black/8 bg-white p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F3E9E0] text-[#6B4C3B]">
                        <ArrowRight className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-black">
                          {tradeoff.title}
                        </p>

                        <p className="mt-1 text-sm leading-6 text-black/60">
                          {tradeoff.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Considerations */}
          {analysis.considerations.length > 0 && (
            <section className="mt-8">
              <div className="rounded-2xl border border-black/8 bg-[#FCFAF8] p-5">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-[#6B4C3B]" />
                  <h3 className="text-sm font-bold text-black">
                    Para se të vendosni
                  </h3>
                </div>

                <ul className="mt-3 space-y-2">
                  {analysis.considerations.map((item) => (
                    <li
                      key={item}
                      className="flex gap-2 text-sm leading-6 text-black/60"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6B4C3B]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* Uncertainty (collapsible) */}
          {analysis.uncertainty.length > 0 && (
            <section className="mt-4">
              <button
                type="button"
                onClick={() => setShowDetails((current) => !current)}
                className="flex items-center gap-2 text-xs font-semibold text-black/45 hover:text-black"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                {showDetails
                  ? 'Fshih kufizimet e analizës'
                  : 'Shfaq kufizimet e analizës'}

                {showDetails ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>

              {showDetails && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <ul className="space-y-2">
                    {analysis.uncertainty.map((item) => (
                      <li
                        key={item}
                        className="text-xs leading-5 text-amber-800"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {!hasAnyInsight && (
            <p className="mt-6 text-center text-xs text-black/40">
              Nuk ka informacion shtesë për të shfaqur.
            </p>
          )}

          <p className="mt-7 text-center text-[11px] text-black/30">
            Analiza bazohet në informacionin e publikuar për pronat dhe
            në kriteret e zgjedhura.
          </p>
        </div>
      )}
    </section>
  )
}