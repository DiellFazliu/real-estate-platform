'use client'

import {
  AlertTriangle,
  BarChart3,
  Check,
  CircleHelp,
  ClipboardCheck,
  FileQuestion,
  Info,
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

interface CompareInsightsProps {
  properties: CompareProperty[]
}

type Priority =
  | 'price'
  | 'space'
  | 'location'
  | 'bedrooms'
  | 'amenities'
  | 'investment'

interface ComparisonInsight {
  summary: string

  keyDifferences: Array<{
    category: string
    explanation: string
  }>

  tradeOffs: Array<{
    title: string
    detail: string
  }>

  notablePoints: string[]

  dataIssues: Array<{
    field: string
    issue: string
    severity:
      | 'low'
      | 'medium'
      | 'high'
  }>

  verify: Array<{
    topic: string
    reason: string
  }>

  questions: string[]

  missingInformation: string[]
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
    description:
      'Çmimi dhe mënyra e listimit',
    icon: Wallet,
  },
  {
    value: 'space',
    label: 'Hapësira',
    description:
      'Sipërfaqja dhe përdorimi i hapësirës',
    icon: BarChart3,
  },
  {
    value: 'location',
    label: 'Lokacioni',
    description:
      'Qyteti dhe konteksti i lokacionit',
    icon: MapPin,
  },
  {
    value: 'bedrooms',
    label: 'Dhoma gjumi',
    description:
      'Numri dhe ndryshimet në dhoma',
    icon: BarChart3,
  },
  {
    value: 'amenities',
    label: 'Komoditetet',
    description:
      'Pajisjet dhe karakteristikat',
    icon: Check,
  },
]

function SeverityBadge({
  severity,
}: {
  severity:
    | 'low'
    | 'medium'
    | 'high'
}) {
  const config = {
    high: {
      label: 'E rëndësishme',
      className:
        'border-red-200 bg-red-50 text-red-700',
    },
    medium: {
      label: 'Për verifikim',
      className:
        'border-amber-200 bg-amber-50 text-amber-700',
    },
    low: {
      label: 'Vërejtje',
      className:
        'border-blue-200 bg-blue-50 text-blue-700',
    },
  }

  const current = config[severity]

  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${current.className}`}
    >
      {current.label}
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
          <h3 className="text-base font-bold text-black">
            {title}
          </h3>

          {description && (
            <p className="mt-1 text-sm leading-6 text-black/45">
              {description}
            </p>
          )}
        </div>
      </div>

      {children}
    </section>
  )
}

export function CompareInsights({
  properties,
}: CompareInsightsProps) {
  const [priorities, setPriorities] =
    useState<Priority[]>([
      'price',
      'space',
    ])

  const [result, setResult] =
    useState<ComparisonInsight | null>(
      null,
    )

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  function togglePriority(
    priority: Priority,
  ) {
    setPriorities((current) => {
      if (current.includes(priority)) {
        if (current.length === 1) {
          return current
        }

        return current.filter(
          (item) => item !== priority,
        )
      }

      if (current.length >= 4) {
        return current
      }

      return [...current, priority]
    })
  }

  async function analyze() {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch(
        '/api/properties/compare/analyze',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            ids: properties.map(
              (property) => property.id,
            ),
            priorities,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            'Analiza dështoi.',
        )
      }

      setResult(data.result)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Analiza dështoi.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mb-8 rounded-3xl border border-[#6B4C3B]/10 bg-white p-6 shadow-sm">
      {/* HEADER */}
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F3E9E0] text-[#6B4C3B]">
          <Sparkles className="h-5 w-5" />
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6B4C3B]">
            Villaron AI
          </p>

          <h2 className="mt-1 text-2xl font-bold text-black">
            Analizë inteligjente e pronave
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-black/50">
            Zgjidhni deri në katër prioritete.
            AI do të analizojë dallimet, kompromiset, informacionin që mungon dhe pikat që kërkojnë verifikim.
          </p>
        </div>
      </div>

      {/* PRIORITIES */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-black">
            Çfarë ka më shumë rëndësi?
          </p>

          <p className="text-xs text-black/40">
            {priorities.length}/4 prioritete
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {priorityOptions.map(
            ({
              value,
              label,
              description,
              icon: Icon,
            }) => {
              const selected =
                priorities.includes(value)

              const disabled =
                !selected &&
                priorities.length >= 4

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() =>
                    togglePriority(value)
                  }
                  disabled={disabled}
                  className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                    selected
                      ? 'border-[#6B4C3B] bg-[#F3E9E0] text-[#6B4C3B]'
                      : 'border-[#6B4C3B]/10 bg-[#FCFAF8] text-black/60 hover:border-[#6B4C3B]/30 hover:bg-[#F7F3EE]'
                  } ${
                    disabled
                      ? 'cursor-not-allowed opacity-40'
                      : ''
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      selected
                        ? 'bg-white'
                        : 'bg-[#F3E9E0]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">
                        {label}
                      </span>

                      {selected && (
                        <Check className="h-4 w-4 shrink-0" />
                      )}
                    </span>

                    <span className="mt-1 block text-xs leading-5 opacity-60">
                      {description}
                    </span>
                  </span>
                </button>
              )
            },
          )}
        </div>
      </div>

      {/* ACTION */}
      <button
        type="button"
        onClick={analyze}
        disabled={loading}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#6B4C3B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Po analizohet...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Analizo pronat
          </>
        )}
      </button>

      {/* ERROR */}
      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* RESULTS */}
      {result && (
        <div
          className="mt-7 border-t border-[#6B4C3B]/10 pt-7"
          aria-live="polite"
        >
          {/* SUMMARY */}
          <div className="rounded-2xl bg-[#F7F3EE] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#6B4C3B]">
              Përmbledhje
            </p>

            <p className="mt-2 text-sm leading-7 text-black/70">
              {result.summary}
            </p>
          </div>

          {/* KEY DIFFERENCES */}
          {result.keyDifferences.length >
            0 && (
            <ResultSection
              title="Dallimet kryesore"
              description="Dallimet që lidhen më drejtpërdrejt me prioritetet tuaja."
              icon={
                <BarChart3 className="h-4 w-4" />
              }
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {result.keyDifferences.map(
                  (item, index) => (
                    <div
                      key={`${item.category}-${index}`}
                      className="rounded-2xl border border-[#6B4C3B]/10 bg-[#FCFAF8] p-4"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-[#6B4C3B]">
                        {item.category}
                      </p>

                      <p className="mt-2 text-sm leading-6 text-black/65">
                        {item.explanation}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </ResultSection>
          )}

          {/* TRADE-OFFS */}
          {result.tradeOffs.length >
            0 && (
            <ResultSection
              title="Kompromiset"
              description="Si ndryshimet mes pronave lidhen me njëra-tjetrën."
              icon={
                <BarChart3 className="h-4 w-4" />
              }
            >
              <div className="space-y-3">
                {result.tradeOffs.map(
                  (item, index) => (
                    <div
                      key={`${item.title}-${index}`}
                      className="rounded-2xl border border-[#6B4C3B]/10 bg-white p-4"
                    >
                      <p className="text-sm font-semibold text-[#6B4C3B]">
                        {item.title}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-black/60">
                        {item.detail}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </ResultSection>
          )}

          {/* NOTABLE POINTS */}
          {result.notablePoints.length >
            0 && (
            <ResultSection
              title="Çfarë bie në sy"
              description="Pika që vlejnë të merren parasysh gjatë leximit të krahasimit."
              icon={
                <Info className="h-4 w-4" />
              }
            >
              <div className="rounded-2xl bg-[#FCFAF8] p-4">
                <ul className="space-y-3">
                  {result.notablePoints.map(
                    (item, index) => (
                      <li
                        key={`${item}-${index}`}
                        className="flex gap-3 text-sm leading-6 text-black/65"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6B4C3B]" />

                        <span>{item}</span>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            </ResultSection>
          )}

          {/* DATA ISSUES */}
          {result.dataIssues.length >
            0 && (
            <ResultSection
              title="Çështje në të dhënat e listing-ut"
              description="Këto nuk janë përfundime ligjore ose teknike; janë mospërputhje ose vlera që kërkojnë verifikim."
              icon={
                <AlertTriangle className="h-4 w-4" />
              }
            >
              <div className="space-y-3">
                {result.dataIssues.map(
                  (item, index) => (
                    <div
                      key={`${item.field}-${index}`}
                      className="rounded-2xl border border-[#6B4C3B]/10 bg-[#FCFAF8] p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-black">
                            {item.field}
                          </p>

                          <p className="mt-1 text-sm leading-6 text-black/60">
                            {item.issue}
                          </p>
                        </div>

                        <SeverityBadge
                          severity={item.severity}
                        />
                      </div>
                    </div>
                  ),
                )}
              </div>
            </ResultSection>
          )}

          {/* MISSING INFORMATION */}
          {result.missingInformation.length >
            0 && (
            <ResultSection
              title="Informacion që mungon"
              description="Fusha që nuk janë të deklaruara në të dhënat e pronës."
              icon={
                <FileQuestion className="h-4 w-4" />
              }
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {result.missingInformation.map(
                  (item, index) => (
                    <div
                      key={`${item}-${index}`}
                      className="flex items-start gap-3 rounded-2xl bg-[#F7F3EE] p-4"
                    >
                      <FileQuestion className="mt-0.5 h-4 w-4 shrink-0 text-[#6B4C3B]" />

                      <span className="text-sm leading-6 text-black/65">
                        {item}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </ResultSection>
          )}

          {/* VERIFY */}
          {result.verify.length > 0 && (
            <ResultSection
              title="Çfarë duhet verifikuar?"
              description="Pika konkrete që kërkojnë konfirmim bazuar në të dhënat e listing-ut."
              icon={
                <ClipboardCheck className="h-4 w-4" />
              }
            >
              <div className="space-y-3">
                {result.verify.map(
                  (item, index) => (
                    <div
                      key={`${item.topic}-${index}`}
                      className="rounded-2xl border border-[#6B4C3B]/10 bg-white p-4"
                    >
                      <p className="text-sm font-semibold text-[#6B4C3B]">
                        {item.topic}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-black/60">
                        {item.reason}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </ResultSection>
          )}

          {/* QUESTIONS */}
          {result.questions.length > 0 && (
            <ResultSection
              title="Pyetje për pronarin ose agjentin"
              description="Pyetje të lidhura me informacionin specifik të këtyre pronave."
              icon={
                <CircleHelp className="h-4 w-4" />
              }
            >
              <ol className="space-y-3">
                {result.questions.map(
                  (question, index) => (
                    <li
                      key={`${question}-${index}`}
                      className="flex gap-4 rounded-2xl bg-[#F7F3EE] p-4"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-[#6B4C3B]">
                        {String(
                          index + 1,
                        ).padStart(2, '0')}
                      </span>

                      <span className="text-sm leading-6 text-black/70">
                        {question}
                      </span>
                    </li>
                  ),
                )}
              </ol>
            </ResultSection>
          )}
        </div>
      )}
    </section>
  )
}