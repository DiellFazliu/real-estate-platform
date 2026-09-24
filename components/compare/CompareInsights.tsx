'use client'

import {
  AlertTriangle,
  BarChart3,
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  LoaderCircle,
  MapPin,
  Sparkles,
  Wallet,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'

interface CompareProperty {
  id: number
  title: string
}

type Priority = 'price' | 'space' | 'location' | 'bedrooms' | 'amenities'

type DimensionScore = {
  priority: Priority
  score: number | null
  note?: string
}

type RankingItem = {
  propertyId: number
  rank: number | null
  score: number | null
  dimensions: DimensionScore[]
}

interface ComparisonInsight {
  summary: string
  mainTradeoff: string
  propertyExplanations: Array<{
    propertyId: number
    explanation: string
  }>
  ranking: RankingItem[]
  dataIssues: Array<{
    field: string
    issue: string
    severity: 'low' | 'medium' | 'high'
  }>
  verify: Array<{
    topic: string
    reason: string
  }>
}

const priorityOptions: Array<{
  value: Priority
  label: string
  description: string
  icon: typeof Wallet
}> = [
  {
    value: 'price',
    label: 'Çmimi',
    description: 'Çmim më i ulët, kur listimi është i krahasueshëm',
    icon: Wallet,
  },
  {
    value: 'space',
    label: 'Hapësira',
    description: 'Sipërfaqe më e madhe',
    icon: BarChart3,
  },
  {
    value: 'location',
    label: 'Lokacioni',
    description: 'Konteksti i qytetit dhe lokacionit',
    icon: MapPin,
  },
  {
    value: 'bedrooms',
    label: 'Dhoma gjumi',
    description: 'Më shumë dhoma gjumi, kur aplikohet',
    icon: BarChart3,
  },
  {
    value: 'amenities',
    label: 'Komoditetet',
    description: 'Më shumë komoditete të deklaruara',
    icon: Check,
  },
]

function scoreWidth(score: number | null) {
  return score === null ? 0 : Math.max(8, score)
}

function scoreLabel(score: number | null) {
  if (score === null) return 'N/A'
  if (score >= 85) return 'Shumë e fortë'
  if (score >= 70) return 'E fortë'
  if (score >= 50) return 'Mesatare'
  return 'E kufizuar'
}

function SeverityBadge({
  severity,
}: {
  severity: 'low' | 'medium' | 'high'
}) {
  const config = {
    high: 'border-red-200 bg-red-50 text-red-700',
    medium: 'border-amber-200 bg-amber-50 text-amber-700',
    low: 'border-blue-200 bg-blue-50 text-blue-700',
  }

  const labels = {
    high: 'E rëndësishme',
    medium: 'Për verifikim',
    low: 'Vërejtje',
  }

  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${config[severity]}`}
    >
      {labels[severity]}
    </span>
  )
}

function ResultSection({
  title,
  description,
  icon,
  children,
}: {
  title: string
  description?: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <section className="mt-7">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F3E9E0] text-[#6B4C3B]">
          {icon}
        </div>
        <div>
          <h3 className="text-base font-bold text-black">{title}</h3>
          {description && (
            <p className="mt-1 text-sm leading-6 text-black/45">{description}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  )
}

export function CompareInsights({ properties }: { properties: CompareProperty[] }) {
  const [priorities, setPriorities] = useState<Priority[]>(['price', 'space'])
  const [result, setResult] = useState<ComparisonInsight | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showChecks, setShowChecks] = useState(false)

  function togglePriority(priority: Priority) {
    setPriorities((current) => {
      if (current.includes(priority)) {
        if (current.length === 1) return current
        return current.filter((item) => item !== priority)
      }
      if (current.length >= 4) return current
      return [...current, priority]
    })
    setResult(null)
  }

  async function analyze() {
    setLoading(true)
    setError('')
    setResult(null)
    setShowChecks(false)

    try {
      const response = await fetch('/api/properties/compare/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: properties.map((property) => property.id),
          priorities,
        }),
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Analiza dështoi.')
      }
      setResult(data.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analiza dështoi.')
    } finally {
      setLoading(false)
    }
  }

  const propertyById = new Map(properties.map((property) => [property.id, property]))
  const checksCount = (result?.dataIssues.length ?? 0) + (result?.verify.length ?? 0)

  return (
    <section className="mb-8 rounded-3xl border border-[#6B4C3B]/10 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F3E9E0] text-[#6B4C3B]">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6B4C3B]">Villaron AI</p>
          <h2 className="mt-1 text-2xl font-bold text-black">Përshtatja me prioritetet tuaja</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-black/50">
            Zgjidhni deri në katër prioritete. Villaron llogarit përputhjen nga të dhënat e pronave dhe AI shpjegon rezultatet.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-black">Çfarë ka më shumë rëndësi?</p>
          <p className="text-xs text-black/40">{priorities.length}/4 prioritete</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {priorityOptions.map(({ value, label, description, icon: Icon }) => {
            const selected = priorities.includes(value)
            const disabled = !selected && priorities.length >= 4
            return (
              <button
                key={value}
                type="button"
                onClick={() => togglePriority(value)}
                disabled={disabled}
                className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                  selected
                    ? 'border-[#6B4C3B] bg-[#F3E9E0] text-[#6B4C3B]'
                    : 'border-[#6B4C3B]/10 bg-[#FCFAF8] text-black/60 hover:border-[#6B4C3B]/30 hover:bg-[#F7F3EE]'
                } ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${selected ? 'bg-white' : 'bg-[#F3E9E0]'}`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">{label}</span>
                    {selected && <Check className="h-4 w-4 shrink-0" />}
                  </span>
                  <span className="mt-1 block text-xs leading-5 opacity-60">{description}</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={analyze}
        disabled={loading}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#6B4C3B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {loading ? 'Po analizohet...' : 'Analizo pronat'}
      </button>

      {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {result && (
        <div className="mt-7 border-t border-[#6B4C3B]/10 pt-7" aria-live="polite">
          <div className="rounded-2xl bg-[#F7F3EE] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#6B4C3B]">Përmbledhje</p>
            <p className="mt-2 text-sm leading-7 text-black/70">{result.summary}</p>
          </div>

          <ResultSection
            title="Renditja sipas prioriteteve"
            description="Çdo prioritet i zgjedhur ka peshë të barabartë. Përputhja llogaritet nga të dhënat e deklaruara, jo nga një vlerësim i lirë i AI-së."
            icon={<BarChart3 className="h-4 w-4" />}
          >
            <div className="space-y-4">
              {result.ranking.map((item) => {
                const property = propertyById.get(item.propertyId)
                if (!property) return null

                return (
                  <div key={item.propertyId} className="rounded-2xl border border-[#6B4C3B]/10 bg-[#FCFAF8] p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-[#6B4C3B] shadow-sm">
                        {item.rank === null ? '—' : `#${item.rank}`}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="text-sm font-bold text-black">{property.title}</h4>
                          <span className="text-sm font-bold text-[#6B4C3B]">
                            {item.score === null ? 'N/A' : `${item.score}%`}
                          </span>
                        </div>

                        <div className="mt-3 space-y-2.5">
                          {item.dimensions.map((dimension) => {
                            const option = priorityOptions.find((p) => p.value === dimension.priority)
                            return (
                              <div key={dimension.priority}>
                                <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                                  <span className="font-medium text-black/60">{option?.label ?? dimension.priority}</span>
                                  <span className="text-black/40">{dimension.score === null ? dimension.note ?? 'Nuk krahasohet' : `${dimension.score}%`}</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-black/5">
                                  <div className="h-full rounded-full bg-[#6B4C3B] transition-all" style={{ width: `${scoreWidth(dimension.score)}%` }} />
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        <div className="mt-4 rounded-xl bg-white px-3.5 py-3 text-xs leading-5 text-black/60">
                          {result.propertyExplanations.find((x) => x.propertyId === item.propertyId)?.explanation ?? scoreLabel(item.score)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ResultSection>

          <ResultSection title="Kompromisi kryesor" description="Dallimi kryesor që duhet ta keni parasysh gjatë krahasimit." icon={<BarChart3 className="h-4 w-4" />}>
            <div className="rounded-2xl border border-[#6B4C3B]/10 bg-white p-4 text-sm leading-6 text-black/65">
              {result.mainTradeoff}
            </div>
          </ResultSection>

          {checksCount > 0 && (
            <div className="mt-7 overflow-hidden rounded-2xl border border-[#6B4C3B]/10">
              <button
                type="button"
                onClick={() => setShowChecks((current) => !current)}
                className="flex w-full items-center justify-between gap-4 bg-[#FCFAF8] px-4 py-4 text-left"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F3E9E0] text-[#6B4C3B]">
                    <AlertTriangle className="h-4 w-4" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold text-black">Verifikime dhe të dhëna për kontroll</span>
                    <span className="block text-xs text-black/45">{checksCount} pikë kërkon vëmendje</span>
                  </span>
                </span>
                {showChecks ? <ChevronUp className="h-4 w-4 text-black/40" /> : <ChevronDown className="h-4 w-4 text-black/40" />}
              </button>

              {showChecks && (
                <div className="space-y-3 border-t border-[#6B4C3B]/10 p-4">
                  {result.dataIssues.map((item, index) => (
                    <div key={`${item.field}-${index}`} className="rounded-xl border border-[#6B4C3B]/10 bg-white p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-black">{item.field}</p>
                          <p className="mt-1 text-sm leading-6 text-black/60">{item.issue}</p>
                        </div>
                        <SeverityBadge severity={item.severity} />
                      </div>
                    </div>
                  ))}

                  {result.verify.map((item, index) => (
                    <div key={`${item.topic}-${index}`} className="rounded-xl border border-[#6B4C3B]/10 bg-white p-4">
                      <p className="text-sm font-semibold text-[#6B4C3B]">{item.topic}</p>
                      <p className="mt-1 text-sm leading-6 text-black/60">{item.reason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
