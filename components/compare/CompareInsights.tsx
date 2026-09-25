'use client'

import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Award,
  Check,
  ChevronDown,
  ChevronUp,
  LoaderCircle,
  Minus,
  Scale,
  Sparkles,
  Star,
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
  incomparable: boolean
  isDifferentiating: boolean
  values: Array<{
    propertyId: number
    display: string
    isWinner: boolean
    position: 'best' | 'middle' | 'worst'
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
  warning: string | null
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

/* ────────────────────────────────────────────────────────────
   Deal rating
   ──────────────────────────────────────────────────────────── */

type DealRating = 'good' | 'average' | 'high' | 'unknown'

function computeDealRatings(
  properties: CompareProperty[],
): Map<number, DealRating> {
  const result = new Map<number, DealRating>()

  const types = new Set(properties.map((p) => p.listing_type))
  if (types.size > 1) {
    for (const p of properties) result.set(p.id, 'unknown')
    return result
  }

  const withRatio = properties
    .filter((p) => p.price > 0 && p.area != null && p.area > 0)
    .map((p) => ({ id: p.id, ratio: p.price / (p.area as number) }))

  if (withRatio.length < 2) {
    for (const p of properties) result.set(p.id, 'unknown')
    return result
  }

  withRatio.sort((a, b) => a.ratio - b.ratio)

  const N = withRatio.length
  const edgeCount = Math.max(1, Math.floor(N * 0.34))

  withRatio.forEach((item, index) => {
    if (index < edgeCount) result.set(item.id, 'good')
    else if (index >= N - edgeCount) result.set(item.id, 'high')
    else result.set(item.id, 'average')
  })

  for (const p of properties) {
    if (!result.has(p.id)) result.set(p.id, 'unknown')
  }

  return result
}

const DEAL_RATING_CONFIG: Record<
  DealRating,
  { label: string; className: string } | null
> = {
  good: {
    label: 'Vlerë e mirë',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  },
  average: {
    label: 'Çmim mesatar',
    className: 'border-amber-200 bg-amber-50 text-amber-800',
  },
  high: {
    label: 'Çmim i lartë',
    className: 'border-red-200 bg-red-50 text-red-800',
  },
  unknown: null,
}

/* ────────────────────────────────────────────────────────────
   Balance bar
   ──────────────────────────────────────────────────────────── */

function BalanceBar({
  strengthsCount,
  tradeoffsCount,
}: {
  strengthsCount: number
  tradeoffsCount: number
}) {
  const total = strengthsCount + tradeoffsCount
  if (total === 0) return null

  const strengthsPercent = (strengthsCount / total) * 100

  return (
    <div className="flex h-2 w-full overflow-hidden rounded-full bg-black/5">
      <div
        className="bg-emerald-500 transition-all duration-500"
        style={{ width: `${strengthsPercent}%` }}
      />
      <div
        className="bg-amber-400 transition-all duration-500"
        style={{ width: `${100 - strengthsPercent}%` }}
      />
    </div>
  )
}

/* ────────────────────────────────────────────────────────────
   Main
   ──────────────────────────────────────────────────────────── */

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

  const dealRatings = useMemo(
    () => computeDealRatings(properties),
    [properties],
  )

  const sortedDimensions = useMemo(() => {
    if (!analysis) return []
    const rows = [...analysis.comparison]
    rows.sort((a, b) => {
      const aPri = a.priorityRelevant ? 0 : 1
      const bPri = b.priorityRelevant ? 0 : 1
      return aPri - bPri
    })
    return rows
  }, [analysis])

  const hasMixedProperties = useMemo(() => {
    let hasSale = false
    let hasRent = false
    for (const p of properties) {
      if (p.listing_type === 'sale') hasSale = true
      if (p.listing_type === 'rent') hasRent = true
    }
    return hasSale && hasRent
  }, [properties])

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
      {/* Controls */}
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

        {hasMixedProperties && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
            <div>
              <p className="text-sm font-semibold text-amber-900">
                Ky grup përfshin shitje dhe qira
              </p>
              <p className="mt-1 text-xs leading-5 text-amber-800">
                Çmimi i shitjes dhe qiraja mujore nuk krahasohen
                drejtpërdrejt. Zgjidh <strong>Për blerje</strong> ose{' '}
                <strong>Për qira</strong> për një rekomandim të saktë.
              </p>
            </div>
          </div>
        )}

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

      {/* Results */}
      {analysis && (
        <div className="space-y-6 p-6 sm:p-8">
          {/* Server warning */}
          {analysis.warning && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
              <p className="text-sm leading-6 text-amber-900">
                {analysis.warning}
              </p>
            </div>
          )}

          {/* Verdict OR guidance */}
          {recommendedProperty ? (
            <div className="overflow-hidden rounded-[1.5rem] border border-[#6B4C3B]/15 bg-gradient-to-br from-[#F7F1EB] to-[#FBF8F5]">
              <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6B4C3B] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white">
                      <Award className="h-3.5 w-3.5" />
                      Rekomandimi
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

                  {(analysis.strengths.length > 0 ||
                    analysis.tradeoffs.length > 0) && (
                    <div className="mt-6 rounded-2xl border border-black/8 bg-white/70 p-4 sm:p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <Scale className="h-4 w-4 text-[#6B4C3B]" />
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#6B4C3B]">
                            Balanca e vendimit
                          </p>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] font-semibold">
                          <span className="text-emerald-700">
                            {analysis.strengths.length} për
                          </span>
                          <span className="text-black/20">·</span>
                          <span className="text-amber-700">
                            {analysis.tradeoffs.length} kundër
                          </span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <BalanceBar
                          strengthsCount={analysis.strengths.length}
                          tradeoffsCount={analysis.tradeoffs.length}
                        />
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <ul className="space-y-1.5">
                          {analysis.strengths.map((s) => (
                            <li
                              key={s}
                              className="flex items-start gap-1.5 text-xs leading-5 text-black/70"
                            >
                              <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
                              {s}
                            </li>
                          ))}
                          {analysis.strengths.length === 0 && (
                            <li className="text-xs italic text-black/35">
                              Pa përparësi të veçanta
                            </li>
                          )}
                        </ul>

                        <ul className="space-y-1.5">
                          {analysis.tradeoffs.map((t) => (
                            <li
                              key={t}
                              className="flex items-start gap-1.5 text-xs leading-5 text-black/70"
                            >
                              <Minus className="mt-0.5 h-3 w-3 shrink-0 text-amber-600" />
                              {t}
                            </li>
                          ))}
                          {analysis.tradeoffs.length === 0 && (
                            <li className="text-xs italic text-black/35">
                              Pa kompromise kryesore
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

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
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-[1.5rem] border border-black/10 bg-white p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3E9E0] text-[#6B4C3B]">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold tracking-tight text-black">
                {analysis.recommendation.headline}
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-black/60">
                {analysis.recommendation.narrative}
              </p>
            </div>
          )}

          {/* Matrix */}
          {sortedDimensions.length > 0 && (
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#6B4C3B]" />
                <h3 className="text-lg font-bold text-black">
                  Krahasimi sipas dimensioneve
                </h3>
              </div>

              <p className="mt-1 text-xs text-black/50">
                Rreshtat e prioriteteve shfaqen të parët
              </p>

              <div className="mt-4 overflow-x-auto">
                <div className="min-w-[600px] overflow-hidden rounded-2xl border border-black/8 bg-[#FCFAF8]">
                  <div
                    className="grid gap-px bg-black/5"
                    style={{
                      gridTemplateColumns: `160px repeat(${properties.length}, minmax(0, 1fr))`,
                    }}
                  >
                    <div className="bg-[#FCFAF8] p-3 text-xs font-bold uppercase tracking-wider text-[#6B4C3B]">
                      Dimensioni
                    </div>
                    {properties.map((p) => {
                      const rating =
                        dealRatings.get(p.id) ?? 'unknown'
                      const cfg = DEAL_RATING_CONFIG[rating]
                      const isRecommended =
                        recommendedProperty?.id === p.id

                      return (
                        <div
                          key={p.id}
                          className={`p-3 ${
                            isRecommended
                              ? 'bg-[#F3E9E0]'
                              : 'bg-[#FCFAF8]'
                          }`}
                        >
                          <div className="flex items-start gap-1.5">
                            {isRecommended && (
                              <Star className="mt-0.5 h-3 w-3 shrink-0 fill-[#6B4C3B] text-[#6B4C3B]" />
                            )}
                            <p
                              className={`text-xs font-semibold line-clamp-2 ${
                                isRecommended
                                  ? 'text-[#6B4C3B]'
                                  : 'text-black'
                              }`}
                            >
                              {p.title}
                            </p>
                          </div>
                          {cfg && (
                            <span
                              className={`mt-1.5 inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold ${cfg.className}`}
                            >
                              {cfg.label}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {sortedDimensions.map((dim) => (
                    <div
                      key={dim.key}
                      className="grid gap-px border-t border-black/5 bg-black/5"
                      style={{
                        gridTemplateColumns: `160px repeat(${properties.length}, minmax(0, 1fr))`,
                      }}
                    >
                      <div
                        className={`flex flex-col gap-1 p-3 ${
                          dim.priorityRelevant && !dim.incomparable
                            ? 'bg-[#F3E9E0]'
                            : 'bg-[#FCFAF8]'
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-xs font-semibold ${
                              dim.priorityRelevant && !dim.incomparable
                                ? 'text-[#6B4C3B]'
                                : 'text-black/70'
                            }`}
                          >
                            {dim.label}
                          </span>
                          {dim.priorityRelevant && !dim.incomparable && (
                            <span className="rounded-full bg-white px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#6B4C3B]">
                              Prioritet
                            </span>
                          )}
                        </div>
                        {dim.incomparable && (
                          <span className="text-[10px] italic leading-tight text-amber-700">
                            Nuk krahasohet direkt
                          </span>
                        )}
                      </div>

                      {dim.values.map((v) => (
                        <div
                          key={v.propertyId}
                          className={`flex items-center justify-between gap-2 bg-white p-3 text-sm ${
                            v.isWinner
                              ? 'font-bold text-emerald-700'
                              : dim.incomparable
                                ? 'text-black/45'
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