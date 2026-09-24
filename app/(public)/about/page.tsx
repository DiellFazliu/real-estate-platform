import { prisma } from '@/lib/db/prisma'
import { Quote, Phone, Mail } from 'lucide-react'

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

export default async function AboutPage() {
  // Get agents from the database
  const agents = await prisma.user.findMany({
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
  })

  // ⭐ SHUFFLE AGENTS
  const shuffledAgents = shuffleArray(agents)

  // Temporary reviews
  const reviews = [
    {
      id: 1,
      name: 'Elira Krasniqi',
      role: 'Home Buyer',
      review:
        'The entire process was simple and professional. The agent understood exactly what I was looking for and helped me find a property that matched my needs.',
    },
    {
      id: 2,
      name: 'Ardit Berisha',
      role: 'Property Buyer',
      review:
        'I really appreciated how transparent the communication was. Every question I had was answered quickly and the whole experience felt trustworthy.',
    },
    {
      id: 3,
      name: 'Luan Hoxha',
      role: 'Home Buyer',
      review:
        'From the first conversation to viewing properties, everything was well organized. The team made finding a new home much easier than I expected.',
    },
  ]

  return (
    <main className="bg-[#F7F3EE] text-black">
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#F3E9E0]">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[#6B4C3B]">
              About Us
            </p>

            <h1 className="text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
              Helping you find a place
              <span className="text-[#6B4C3B]"> to call home.</span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-black/65">
              We believe finding the right property should be a clear,
              personal, and enjoyable experience. Our team connects people
              with properties that fit their needs, lifestyle, and future.
            </p>
          </div>
        </div>

        {/* Decorative shape */}
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#6B4C3B]/10" />
        <div className="absolute -bottom-40 right-20 h-96 w-96 rounded-full bg-black/5" />
      </section>

      {/* COMPANY INTRODUCTION */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#6B4C3B]">
              Our Company
            </p>

            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Real estate built around people.
            </h2>

            <div className="mt-8 space-y-5 text-base leading-7 text-black/65">
              <p>
                Our company was created with a simple idea: real estate
                should be about more than listings and numbers. It should be
                about understanding people and helping them make important
                decisions about where they live.
              </p>

              <p>
                Whether you are searching for your first home, looking for
                your next investment, or exploring new opportunities, our
                agents are here to guide you throughout the process.
              </p>

              <p>
                We combine modern technology with personal service to make
                discovering and connecting with properties easier.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6 border-t border-black/10 pt-8">
              <div>
                <p className="text-3xl font-semibold">100+</p>
                <p className="mt-1 text-sm text-black/55">Properties</p>
              </div>

              <div>
                <p className="text-3xl font-semibold">50+</p>
                <p className="mt-1 text-sm text-black/55">Happy Clients</p>
              </div>

              <div>
                <p className="text-3xl font-semibold">{agents.length}+</p>
                <p className="mt-1 text-sm text-black/55">Agents</p>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-3xl bg-[#6B4C3B]">
              <div className="flex h-full items-center justify-center p-12 text-center">
                <div>
                  <p className="text-7xl font-semibold text-[#F3E9E0]">Home</p>
                  <p className="mt-4 text-lg text-[#F3E9E0]/70">
                    is where your story begins.
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-8 -left-8 rounded-2xl bg-black px-8 py-6 text-[#F7F3EE] shadow-xl">
              <p className="text-sm text-white/60">Our philosophy</p>
              <p className="mt-1 text-xl font-medium">People first. Always.</p>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="bg-[#F3E9E0] px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6B4C3B]">
              Client Stories
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              What our clients say
            </h2>

            <p className="mt-5 text-black/60">
              Every property journey is different. Here are some of the
              experiences shared by our clients.
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
                  <p className="mt-1 text-sm text-black/50">{review.role}</p>
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
              Our Team
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Meet our agents
            </h2>

            <p className="mt-5 text-black/60">
              Our agents are here to help you discover properties, arrange
              viewings, and guide you through your property journey.
            </p>
          </div>
        </div>

        {shuffledAgents.length === 0 ? (
          <div className="mt-16 rounded-3xl border border-black/10 bg-white/40 p-12 text-center">
            <p className="text-black/50">
              Our team information will be available soon.
            </p>
          </div>
        ) : (
          <div className="mt-16 grid gap-5 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {shuffledAgents.map((agent) => (
              <article
                key={agent.id}
                className="group overflow-hidden rounded-xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                {/* Agent image */}
                <div className="relative aspect-square overflow-hidden bg-[#F3E9E0]">
                  {agent.image ? (
                    <img
                      src={agent.image}
                      alt={agent.name ?? 'Real estate agent'}
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

                {/* Agent information */}
                <div className="p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6B4C3B]">
                    Real Estate Agent
                  </p>

                  <h3 className="mt-1 truncate text-base font-semibold">
                    {agent.name ?? 'Unnamed Agent'}
                  </h3>

                  {agent.bio && (
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-black/60">
                      {agent.bio}
                    </p>
                  )}

                  <div className="mt-3 space-y-1.5 border-t border-black/10 pt-3">
                    {agent.email && (
                      <div className="flex items-center gap-1.5 text-xs text-black/60">
                        <Mail size={13} className="shrink-0 text-[#6B4C3B]" />
                        <span className="truncate">{agent.email}</span>
                      </div>
                    )}

                    {agent.phone && (
                      <div className="flex items-center gap-1.5 text-xs text-black/60">
                        <Phone size={13} className="shrink-0 text-[#6B4C3B]" />
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
            Start Your Journey
          </p>

          <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            Looking for your next property?
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/60">
            Explore our available properties and connect with an agent who
            can help you find the right opportunity.
          </p>

          <a
            href="/properties"
            className="mt-10 inline-flex items-center rounded-full bg-[#F3E9E0] px-7 py-3.5 text-sm font-semibold text-black transition hover:bg-white"
          >
            Explore Properties
          </a>
        </div>
      </section>
    </main>
  )
}