'use client'

import { useState } from 'react'

import {
  AlertTriangle,
  CheckCircle2,
  CircleHelp,
  ClipboardCheck,
  FileQuestion,
  LoaderCircle,
  ShieldAlert,
  Sparkles,
  Wallet,
} from 'lucide-react'

import type {
  DeterministicDecision,
  PropertyXRayContext,
  PropertyXRayResult,
} from '@/lib/property-xray/types'

const euro = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

function Card({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <article
      className={`rounded-2xl border border-[#6B4C3B]/15 bg-white p-5 ${className}`}
    >
      {children}
    </article>
  )
}

function SectionTitle({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description?: string
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2">
        {icon}

        <h2 className="text-xl font-bold text-black">
          {title}
        </h2>
      </div>

      {description && (
        <p className="mt-1 text-sm leading-6 text-black/55">
          {description}
        </p>
      )}
    </div>
  )
}

function PriorityBadge({
  priority,
}: {
  priority: 'high' | 'medium' | 'low'
}) {
  const styles = {
    high:
      'bg-red-50 text-red-700 border-red-200',
    medium:
      'bg-amber-50 text-amber-700 border-amber-200',
    low:
      'bg-blue-50 text-blue-700 border-blue-200',
  }

  const labels = {
    high: 'E rëndësishme',
    medium: 'Për verifikim',
    low: 'Informacion',
  }

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${styles[priority]}`}
    >
      {labels[priority]}
    </span>
  )
}

function formatPropertyType(
  value: string
) {
  const labels: Record<string, string> = {
    apartment: 'Apartament',
    house: 'Shtëpi',
    villa: 'Vilë',
    penthouse: 'Penthouse',
    studio: 'Studio',
    land: 'Truall',
    commercial: 'Komerciale',
    office: 'Zyrë',
  }

  return labels[value] ?? value
}

function formatCondition(
  value: string | null
) {
  const labels: Record<string, string> = {
    new: 'E re',
    excellent: 'E shkëlqyer',
    good: 'E mirë',
    needs_renovation: 'Kërkon rinovim',
    under_construction: 'Në ndërtim',
  }

  return value
    ? labels[value] ?? value
    : 'Mungon'
}

function formatFurnished(
  value: string | null
) {
  const labels: Record<string, string> = {
    unfurnished: 'E pamobiluar',
    semi_furnished: 'Gjysmë e mobiluar',
    fully_furnished: 'Plotësisht e mobiluar',
  }

  return value
    ? labels[value] ?? value
    : 'Mungon'
}

export function PropertyXRay({
  property,
}: {
  property: PropertyXRayContext
}) {
  const [budget, setBudget] = useState('')
  const [targetOffer, setTargetOffer] =
    useState('')

  const [result, setResult] =
    useState<PropertyXRayResult | null>(
      null
    )

  const [decision, setDecision] =
    useState<DeterministicDecision | null>(
      null
    )

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isRent =
    property.listingType === 'rent'

  const location = [
    property.neighborhood,
    property.city,
  ]
    .filter(Boolean)
    .join(', ')

  async function submit() {
    setError('')
    setLoading(true)
    setResult(null)
    setDecision(null)

    try {
      const response = await fetch(
        '/api/property-xray/analyze',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            propertySlug:
              property.slug,

            budget:
              budget.trim() !== ''
                ? Number(budget)
                : undefined,

            targetOffer:
              targetOffer.trim() !== ''
                ? Number(targetOffer)
                : undefined,
          }),
        }
      )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Analiza dështoi.'
        )
      }

      setDecision(data.decision)
      setResult(data.result)
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Analiza dështoi.'
      )
    } finally {
      setLoading(false)
    }
  }

  const offerRelationText =
    decision?.offer.relation === 'below'
      ? 'Oferta jote është nën çmimin e publikuar.'
      : decision?.offer.relation ===
          'above'
        ? 'Oferta jote është mbi çmimin e publikuar.'
        : decision?.offer.relation ===
            'equal'
          ? 'Oferta jote përputhet me çmimin e publikuar.'
          : null

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-14">
      {/* HERO */}

      <section className="rounded-3xl bg-gradient-to-br from-[#111827] via-[#18263b] to-[#25476d] px-7 py-9 text-white sm:px-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8bc1ff]">
              Villaron AI · Verification layer
            </p>

            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
              Property X-Ray
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-white/70">
              Kupto çfarë deklaron listing-u,
              çfarë mungon, çfarë duhet
              verifikuar dhe çfarë duhet
              kontrolluar gjatë vizitës.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 text-sm">
            <p className="font-semibold">
              {property.title}
            </p>

            <p className="mt-1 text-white/60">
              {location ||
                'Lokacion i paspecifikuar'}
              {' · '}
              {formatPropertyType(
                property.propertyType
              )}
            </p>

            <p className="mt-2 text-lg font-bold">
              {euro.format(
                property.price
              )}

              {isRent && (
                <span className="ml-1 text-sm font-normal text-white/50">
                  / muaj
                </span>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* LISTING SNAPSHOT */}

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-black/45">
            Sipërfaqja
          </p>

          <p className="mt-1 text-2xl font-bold">
            {property.area !== null
              ? `${property.area} m²`
              : 'Mungon'}
          </p>
        </Card>

        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-black/45">
            Dhoma
          </p>

          <p className="mt-1 text-2xl font-bold">
            {property.bedrooms ??
              'Mungon'}
          </p>
        </Card>

        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-black/45">
            Banjo
          </p>

          <p className="mt-1 text-2xl font-bold">
            {property.bathrooms ??
              'Mungon'}
          </p>
        </Card>

        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-black/45">
            Gjendja
          </p>

          <p className="mt-1 text-2xl font-bold">
            {formatCondition(
              property.condition
            )}
          </p>
        </Card>
      </section>

      {/* PROPERTY FACTS */}

      <section className="mt-6">
        <Card>
          <SectionTitle
            icon={
              <CheckCircle2
                size={20}
                className="text-green-600"
              />
            }
            title="Faktet e listing-ut"
            description="Informacioni i mëposhtëm vjen nga të dhënat e deklaruara për pronën."
          />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-[#F7F3EE] p-4">
              <p className="text-xs text-black/45">
                Mobilimi
              </p>
              <p className="mt-1 font-semibold">
                {formatFurnished(
                  property.furnished
                )}
              </p>
            </div>

            <div className="rounded-xl bg-[#F7F3EE] p-4">
              <p className="text-xs text-black/45">
                Viti i ndërtimit
              </p>
              <p className="mt-1 font-semibold">
                {property.yearBuilt ??
                  'Mungon'}
              </p>
            </div>

            <div className="rounded-xl bg-[#F7F3EE] p-4">
              <p className="text-xs text-black/45">
                Rinovimi
              </p>
              <p className="mt-1 font-semibold">
                {property.renovationYear ??
                  'Nuk është deklaruar'}
              </p>
            </div>

            <div className="rounded-xl bg-[#F7F3EE] p-4">
              <p className="text-xs text-black/45">
                Orientimi
              </p>
              <p className="mt-1 font-semibold">
                {property.orientation ??
                  'Mungon'}
              </p>
            </div>

            <div className="rounded-xl bg-[#F7F3EE] p-4">
              <p className="text-xs text-black/45">
                Kati
              </p>
              <p className="mt-1 font-semibold">
                {property.floor ??
                  'Mungon'}
              </p>
            </div>

            <div className="rounded-xl bg-[#F7F3EE] p-4">
              <p className="text-xs text-black/45">
                Ballkone
              </p>
              <p className="mt-1 font-semibold">
                {property.balconies ??
                  'Mungon'}
              </p>
            </div>

            <div className="rounded-xl bg-[#F7F3EE] p-4">
              <p className="text-xs text-black/45">
                Ngrohje
              </p>
              <p className="mt-1 font-semibold">
                {property.hasHeating
                  ? 'Po'
                  : 'Jo'}
              </p>
            </div>

            <div className="rounded-xl bg-[#F7F3EE] p-4">
              <p className="text-xs text-black/45">
                Parking
              </p>
              <p className="mt-1 font-semibold">
                {property.hasParking
                  ? 'Po'
                  : 'Jo'}
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* PERSONAL INPUTS */}

      <section className="mt-7 rounded-3xl border border-[#6B4C3B]/15 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3E9E0]">
            <Wallet
              size={19}
              className="text-[#6B4C3B]"
            />
          </div>

          <div>
            <h2 className="text-xl font-bold">
              Përgatitje personale
            </h2>

            <p className="mt-1 text-sm leading-6 text-black/55">
              Opsionale. Përdoren vetëm
              për krahasim me çmimin e
              publikuar.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold">
            {isRent
              ? 'Buxheti maksimal mujor (€)'
              : 'Buxheti maksimal për blerje (€)'}

            <input
              value={budget}
              onChange={(event) =>
                setBudget(
                  event.target.value
                )
              }
              type="number"
              min="0"
              placeholder={
                isRent
                  ? 'p.sh. 700'
                  : 'p.sh. 150000'
              }
              className="mt-2 w-full rounded-xl border border-black/15 px-4 py-3 font-normal outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <span className="mt-1 block text-xs font-normal text-black/45">
              Nuk ndryshon analizën e
              listing-ut.
            </span>
          </label>

          <label className="text-sm font-semibold">
            {isRent
              ? 'Oferta jote e synuar (€ / muaj)'
              : 'Oferta jote e synuar (€)'}

            <input
              value={targetOffer}
              onChange={(event) =>
                setTargetOffer(
                  event.target.value
                )
              }
              type="number"
              min="1"
              placeholder={
                isRent
                  ? 'p.sh. 350'
                  : 'p.sh. 140000'
              }
              className="mt-2 w-full rounded-xl border border-black/15 px-4 py-3 font-normal outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <span className="mt-1 block text-xs font-normal text-black/45">
              Vetëm krahasim matematikor
              me çmimin e publikuar.
            </span>
          </label>
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={loading}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2879f5] px-5 py-4 font-semibold text-white transition hover:bg-[#1968dc] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <LoaderCircle
                size={18}
                className="animate-spin"
              />
              Duke analizuar pronën...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Analizo këtë pronë
            </>
          )}
        </button>
      </section>

      {/* ERROR */}

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </p>
      )}

      {/* RESULTS */}

      {result && decision && (
        <section
          className="mt-9 space-y-6"
          aria-live="polite"
        >
          {/* SUMMARY */}

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-blue-200 bg-blue-50">
              <p className="text-sm font-medium text-black/55">
                Mbulimi i informacionit
              </p>

              <p className="mt-1 text-4xl font-bold">
                {
                  decision
                    .listingCompleteness
                    .score
                }
                <span className="text-xl text-black/40">
                  %
                </span>
              </p>

              <p className="mt-1 text-sm text-black/55">
                {
                  decision
                    .listingCompleteness
                    .completedCount
                }{' '}
                nga{' '}
                {
                  decision
                    .listingCompleteness
                    .totalChecks
                }{' '}
                fusha të kontrolluara janë
                të deklaruara.
              </p>
            </Card>

            <Card>
              <p className="text-sm font-medium text-black/55">
                Çmimi i listing-ut
              </p>

              <p className="mt-1 text-3xl font-bold">
                {euro.format(
                  property.price
                )}
              </p>

              <p className="mt-1 text-sm text-black/50">
                {isRent
                  ? 'në muaj'
                  : 'çmim i publikuar'}
              </p>
            </Card>

            <Card>
              <p className="text-sm font-medium text-black/55">
                Gjendja e informacionit
              </p>

              <p className="mt-2 text-lg font-bold">
                {result.missingInformation
                  .length === 0
                  ? 'Nuk ka fusha të pambushura'
                  : `${result.missingInformation.length} fusha për t'u sqaruar`}
              </p>

              <p className="mt-1 text-sm text-black/50">
                Verifikimi fizik mbetet i
                nevojshëm.
              </p>
            </Card>
          </div>

          {/* MISSING */}

          {result.missingInformation
            .length > 0 && (
            <Card>
              <SectionTitle
                icon={
                  <FileQuestion
                    size={20}
                    className="text-blue-600"
                  />
                }
                title="Çfarë mungon në listing?"
                description="Këto fusha nuk janë të deklaruara në informacionin e pronës."
              />

              <div className="grid gap-3 sm:grid-cols-2">
                {result.missingInformation.map(
                  (item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-xl bg-[#F7F3EE] p-4"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white">
                        <FileQuestion
                          size={16}
                          className="text-[#6B4C3B]"
                        />
                      </span>

                      <span className="text-sm font-medium">
                        {item}
                      </span>
                    </div>
                  )
                )}
              </div>
            </Card>
          )}

          {/* VERIFICATION */}

          <Card>
            <SectionTitle
              icon={
                <ShieldAlert
                  size={20}
                  className="text-amber-600"
                />
              }
              title="Çfarë duhet të verifikosh?"
              description="Pika të lidhura drejtpërdrejt me të dhënat e kësaj prone."
            />

            <div className="space-y-3">
              {result.verificationPoints.map(
                (item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-black/10 p-4"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <h3 className="font-semibold">
                          {item.title}
                        </h3>

                        <p className="mt-1 text-sm leading-6 text-black/65">
                          {item.detail}
                        </p>
                      </div>

                      <PriorityBadge
                        priority={
                          item.priority
                        }
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </Card>

          {/* QUESTIONS */}

          <Card>
            <SectionTitle
              icon={
                <CircleHelp
                  size={20}
                  className="text-blue-600"
                />
              }
              title="Pyetje për vizitën"
              description="Pyetje të gjeneruara nga të dhënat specifike të kësaj prone."
            />

            <ol className="space-y-3">
              {result.questionsToAsk.map(
                (question, index) => (
                  <li
                    key={question}
                    className="flex gap-4 rounded-xl bg-[#F7F3EE] p-4"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-blue-600">
                      {String(
                        index + 1
                      ).padStart(2, '0')}
                    </span>

                    <span className="text-sm leading-6">
                      {question}
                    </span>
                  </li>
                )
              )}
            </ol>
          </Card>

          {/* CHECKLIST */}

          <Card>
            <SectionTitle
              icon={
                <ClipboardCheck
                  size={20}
                  className="text-green-600"
                />
              }
              title="Checklist për vizitën"
              description="Kontrolle praktike që mund të bëhen fizikisht gjatë vizitës."
            />

            <div className="grid gap-3 sm:grid-cols-2">
              {result.visitChecklist.map(
                (item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-xl border border-black/10 p-4"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-black/15">
                      <CheckCircle2
                        size={15}
                        className="text-green-600"
                      />
                    </span>

                    <span className="text-sm leading-6 text-black/75">
                      {item}
                    </span>
                  </div>
                )
              )}
            </div>
          </Card>

          {/* BUDGET */}

          {decision.cost.budget !==
            null && (
            <Card className="border-blue-200 bg-blue-50">
              <SectionTitle
                icon={
                  <Wallet
                    size={20}
                    className="text-blue-600"
                  />
                }
                title="Krahasimi me buxhetin"
              />

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-black/50">
                    Buxheti yt
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {euro.format(
                      decision.cost.budget
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-black/50">
                    Çmimi
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {euro.format(
                      decision.cost.advertised
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-black/50">
                    Diferenca
                  </p>

                  <p
                    className={`mt-1 text-2xl font-bold ${
                      decision.cost
                        .remaining! >= 0
                        ? 'text-green-700'
                        : 'text-red-700'
                    }`}
                  >
                    {decision.cost
                      .remaining! >= 0
                      ? `${euro.format(
                          decision.cost
                            .remaining!
                        )} brenda`
                      : `${euro.format(
                          Math.abs(
                            decision.cost
                              .remaining!
                          )
                        )} mbi`}
                  </p>
                </div>
              </div>

              <p className="mt-5 text-xs leading-5 text-black/50">
                Ky është vetëm krahasim i
                çmimit të publikuar me
                buxhetin e vendosur.
              </p>
            </Card>
          )}

          {/* OFFER */}

          <Card className="border-purple-200 bg-[#f6f0ff]">
            <SectionTitle
              icon={
                <Sparkles
                  size={20}
                  className="text-purple-600"
                />
              }
              title={
                decision.offer.target !==
                null
                  ? 'Konteksti i ofertës'
                  : 'Pika që mund të diskutohen'
              }
              description={
                decision.offer.target !==
                null
                  ? 'Krahasim matematikor me çmimin e publikuar. Nuk është vlerësim i ofertës.'
                  : 'Pika faktike nga listing-u që mund të sqarohen gjatë negociimit.'
              }
            />

            {decision.offer.target !==
              null && (
              <>
                <div className="mb-4 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-white p-4">
                    <p className="text-xs text-black/50">
                      Çmimi i publikuar
                    </p>

                    <p className="mt-1 text-xl font-bold">
                      {euro.format(
                        property.price
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-4">
                    <p className="text-xs text-black/50">
                      Oferta jote
                    </p>

                    <p className="mt-1 text-xl font-bold">
                      {euro.format(
                        decision.offer
                          .target
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-4">
                    <p className="text-xs text-black/50">
                      Diferenca
                    </p>

                    <p className="mt-1 text-xl font-bold">
                      {decision.offer
                        .difference! > 0
                        ? '+'
                        : ''}
                      {euro.format(
                        decision.offer
                          .difference!
                      )}
                    </p>

                    {decision.offer
                      .percentageDifference !==
                      null && (
                      <p className="mt-1 text-xs text-black/50">
                        {decision.offer
                          .percentageDifference!
                          .toFixed(1)}
                        %
                      </p>
                    )}
                  </div>
                </div>

                <div className="mb-5 rounded-xl border border-purple-200 bg-white p-4">
                  <p className="font-semibold text-purple-900">
                    {offerRelationText}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-black/60">
                    Ky krahasim nuk tregon nëse
                    oferta është e përshtatshme,
                    e ulët apo e lartë në raport
                    me tregun.
                  </p>
                </div>
              </>
            )}

            {result.negotiationPoints
              .length > 0 && (
              <div className="space-y-3">
                {result.negotiationPoints.map(
                  (point) => (
                    <div
                      key={point}
                      className="flex items-start gap-3 rounded-xl bg-white p-4"
                    >
                      <AlertTriangle
                        size={17}
                        className="mt-0.5 shrink-0 text-purple-600"
                      />

                      <span className="text-sm leading-6 text-black/75">
                        {point}
                      </span>
                    </div>
                  )
                )}
              </div>
            )}

            <p className="mt-5 text-xs leading-5 text-black/45">
              X-Ray nuk parashikon pranimin
              e ofertës dhe nuk llogarit
              vlerën e tregut. Ai vetëm
              organizon faktet dhe pikat që
              duhen sqaruar.
            </p>
          </Card>

          {/* FOOTER */}

          <div className="rounded-2xl border border-black/10 bg-white px-5 py-4 text-sm leading-6 text-black/55">
            <strong className="text-black">
              Si ta përdorësh këtë raport:
            </strong>{' '}
            përdore para dhe gjatë vizitës,
            verifiko informacionet me
            listuesin dhe kontrollo fizikisht
            pronën para se të marrësh një
            vendim.
          </div>
        </section>
      )}
    </div>
  )
}