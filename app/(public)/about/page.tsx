import fs from 'fs'
import path from 'path'
import type { Metadata } from 'next'
import { prisma } from '@/lib/db/prisma'
import { Quote, Phone, Mail } from 'lucide-react'
import { getMunicipalityStats } from '@/lib/analytics/municipality-data'
import { KosovoMap } from '@/components/analytics/KosovoMap'

export const metadata: Metadata = {
  title: 'Rreth nesh | Villaron',
  description:
    'Njihuni me Villaron — platformën e pasurive të paluajtshme në Kosovë që lidh njerëzit me pronat që u përshtaten.',
}

// ═══════════════════════════════════════════════════════════════
// SHUFFLE FUNCTION
// ═══════════════════════════════════════════════════════════════

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// ═══════════════════════════════════════════════════════════════
// LOAD SVG
// ═══════════════════════════════════════════════════════════════

function loadKosovoSvg(): string {
  const svgPath = path.join(
    process.cwd(),
    'app',
    '(public)',
    'analytics',
    'maps',
    'kosovo-municipalities.svg'
  )
  try {
    return fs.readFileSync(svgPath, 'utf-8')
  } catch (err) {
    console.error('Gabim gjatë leximit të SVG:', svgPath, err)
    return ''
  }
}

export default async function AboutPage() {
  const [agents, totalProperties, happyClients] = await Promise.all([
    prisma.user.findMany({
      where: {
        is_active: true,
        role: {
          name: 'AGENT',
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        bio: true,
      },
      orderBy: {
        created_at: 'asc',
      },
    }),

    prisma.property.count({
      where: {
        status: 'PUBLISHED',
        review_status: 'APPROVED',
      },
    }),

    prisma.user.count({
      where: {
        is_active: true,
        role: {
          name: 'USER',
        },
      },
    }),
  ])

  const shuffledAgents = shuffleArray(agents)

  const stats = await getMunicipalityStats('sale')
  const svgContent = loadKosovoSvg()

  const reviews = [
    {
      id: 1,
      name: 'Elira Krasniqi',
      role: 'Blerëse shtëpie',
      review:
        'I gjithë procesi ishte i thjeshtë dhe profesional. Agjenti kuptoi saktësisht se çfarë po kërkoja dhe më ndihmoi të gjeja një pronë që përputhej me nevojat e mia.',
    },
    {
      id: 2,
      name: 'Ardit Berisha',
      role: 'Blerës prone',
      review:
        'Vlerësova shumë komunikimin e hapur. Çdo pyetje që bëja mori përgjigje të shpejtë dhe i gjithë procesi dukej i besueshëm.',
    },
    {
      id: 3,
      name: 'Luan Hoxha',
      role: 'Blerës shtëpie',
      review:
        'Nga biseda e parë deri te vizitat e pronave, gjithçka ishte e organizuar mirë. Ekipi e bëri gjetjen e një shtëpie të re shumë më të lehtë sesa prisja.',
    },
  ]

  return (
    <main className="bg-[#F7F3EE] text-black">
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#F3E9E0]">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[#6B4C3B]">
              Rreth nesh
            </p>

            <h1 className="text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
              Të ndihmojmë të gjesh vendin
              <span className="text-[#6B4C3B]"> që e quan shtëpi.</span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-black/65">
              Besojmë se gjetja e pronës së duhur duhet të jetë një
              përvojë e qartë, personale dhe e këndshme. Ekipi ynë
              lidh njerëzit me pronat që përputhen me nevojat,
              mënyrën e jetesës dhe të ardhmen e tyre.
            </p>
          </div>
        </div>

        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#6B4C3B]/10" />
        <div className="absolute -bottom-40 right-20 h-96 w-96 rounded-full bg-black/5" />
      </section>

      {/* COMPANY INTRODUCTION */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#6B4C3B]">
              Kompania jonë
            </p>

            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Pasuri të paluajtshme me njerëzit në qendër.
            </h2>

            <div className="mt-8 space-y-5 text-base leading-7 text-black/65">
              <p>
                Kompania jonë u krijua me një ide të thjeshtë:
                pasuria e paluajtshme duhet të jetë më shumë sesa
                listime dhe numra. Bëhet fjalë për njerëzit — për
                t'i ndihmuar të marrin vendime të rëndësishme për
                vendin ku do të jetojnë.
              </p>

              <p>
                Qoftë nëse jeni duke kërkuar shtëpinë tuaj të parë,
                investimin e radhës, ose po eksploroni mundësi të
                reja, agjentët tanë janë këtu për t'ju udhëhequr
                gjatë gjithë procesit.
              </p>

              <p>
                Kombinojmë teknologjinë moderne me shërbimin personal
                për ta bërë më të lehtë gjetjen dhe kontaktin me
                pronat.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-black/10 pt-8">
              <div>
                <p className="text-3xl font-semibold">
                  {totalProperties.toLocaleString()}+
                </p>
                <p className="mt-1 text-sm text-black/55">Prona</p>
              </div>

              <div>
                <p className="text-3xl font-semibold">
                  {happyClients.toLocaleString()}+
                </p>
                <p className="mt-1 text-sm text-black/55">
                  Klientë të kënaqur
                </p>
              </div>

              <div>
                <p className="text-3xl font-semibold">
                  {agents.length.toLocaleString()}+
                </p>
                <p className="mt-1 text-sm text-black/55">Agjentë</p>
              </div>
            </div>
          </div>

          {/* Visual — MAP */}
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-3xl bg-[#6B4C3B]">
              <div className="flex h-full items-center justify-center p-6">
                {svgContent ? (
                  <div className="w-full max-w-[360px]">
                    <KosovoMap stats={stats} svgContent={svgContent} />
                  </div>
                ) : (
                  <p className="text-center text-[#F7F3EE]/70">
                    Harta nuk mund të ngarkohet.
                  </p>
                )}
              </div>
            </div>

            <div className="absolute -bottom-8 -left-8 rounded-2xl bg-black px-8 py-6 text-[#F7F3EE] shadow-xl">
              <p className="text-sm text-white/60">Filozofia jonë</p>
              <p className="mt-1 text-xl font-medium">
                Njerëzit në radhë të parë. Gjithmonë.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="bg-[#F3E9E0] px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6B4C3B]">
              Historitë e klientëve
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Çfarë thonë klientët tanë
            </h2>

            <p className="mt-5 text-black/60">
              Çdo klient ka historinë e vet. Këto janë disa nga
              përvojat që ata kanë ndarë.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <article
                key={review.id}
                className="flex flex-col rounded-3xl bg-[#F7F3EE] p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <Quote
                  size={32}
                  strokeWidth={1.5}
                  className="text-[#6B4C3B]"
                />

                <p className="mt-6 flex-1 text-base leading-7 text-black/70">
                  "{review.review}"
                </p>

                <div className="mt-8 border-t border-black/10 pt-6">
                  <p className="font-semibold">{review.name}</p>
                  <p className="mt-1 text-sm text-black/50">
                    {review.role}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* AGENTS */}
      <section id="Agents" className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6B4C3B]">
              Ekipi ynë
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Njihuni me agjentët tanë
            </h2>

            <p className="mt-5 text-black/60">
              Agjentët tanë janë këtu për t'ju ndihmuar të gjeni
              pronat, të organizoni vizita dhe t'ju udhëheqin gjatë
              gjithë procesit.
            </p>
          </div>
        </div>

        {shuffledAgents.length === 0 ? (
          <div className="mt-16 rounded-3xl border border-black/10 bg-white/40 p-12 text-center">
            <p className="text-black/50">
              Informacioni i ekipit do të jetë i disponueshëm së
              shpejti.
            </p>
          </div>
        ) : (
          <div className="mt-16 grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {shuffledAgents.map((agent) => (
              <article
                key={agent.id}
                className="group overflow-hidden rounded-xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="relative aspect-square overflow-hidden bg-[#F3E9E0]">
                  {agent.image ? (
                    <img
                      src={agent.image}
                      alt={
                        agent.name ??
                        'Agjent i pasurive të paluajtshme'
                      }
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#6B4C3B] text-2xl font-semibold text-[#F7F3EE]">
                        {agent.name?.charAt(0).toUpperCase() ?? '?'}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6B4C3B]">
                    Agjent i pasurive të paluajtshme
                  </p>

                  <h3 className="mt-1 truncate text-base font-semibold">
                    {agent.name ?? 'Agjent i paemërtuar'}
                  </h3>

                  {agent.bio && (
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-black/60">
                      {agent.bio}
                    </p>
                  )}

                  <div className="mt-3 space-y-1.5 border-t border-black/10 pt-3">
                    {agent.email && (
                      <div className="flex items-center gap-1.5 text-xs text-black/60">
                        <Mail
                          size={13}
                          className="shrink-0 text-[#6B4C3B]"
                        />
                        <span className="truncate">
                          {agent.email}
                        </span>
                      </div>
                    )}

                    {agent.phone && (
                      <div className="flex items-center gap-1.5 text-xs text-black/60">
                        <Phone
                          size={13}
                          className="shrink-0 text-[#6B4C3B]"
                        />
                        <span>{agent.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-black px-6 py-24 text-[#F7F3EE] lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#F3E9E0]/60">
            Fillo udhëtimin tënd
          </p>

          <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            Jeni në kërkim të pronës tuaj të radhës?
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/60">
            Shfletoni pronat e disponueshme dhe lidhuni me një agjent
            që mund t'ju ndihmojë të gjeni mundësinë e duhur.
          </p>

          <a
            href="/properties"
            className="mt-10 inline-flex items-center rounded-full bg-[#F3E9E0] px-7 py-3.5 text-sm font-semibold text-black transition hover:bg-white"
          >
            Shfleto pronat
          </a>
        </div>
      </section>
    </main>
  )
}