import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Home,
  Camera,
  Users,
  TrendingUp,
  Clock,
  Shield,
  CheckCircle,
  ArrowRight,
} from 'lucide-react'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { BecomeSellerForm } from '@/components/seller/BecomeSellerForm'
import { AddPropertyButton } from '@/components/seller/AddPropertyButton'
import { ViewListingsButton } from '@/components/seller/ViewListingsButton'

export default async function SellPage() {
  // ═══════════════════════════════════════════════════════════
  // 1. AUTH CHECK
  // ═══════════════════════════════════════════════════════════
  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=/sell')

  // ═══════════════════════════════════════════════════════════
  // 2. KONTROLLO NËSE ËSHTË SELLER
  // ═══════════════════════════════════════════════════════════
  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) },
    select: { is_seller: true, seller_verified: true },
  })

  const isSeller = user?.is_seller && user?.seller_verified

  // ═══════════════════════════════════════════════════════════
  // 3. NËSE NUK ËSHTË SELLER → SHFAQ FORMËN
  // ═══════════════════════════════════════════════════════════
  if (!isSeller) {
    return (
      <main className="min-h-screen bg-[#F7F3EE] pt-20">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black">Bëhu Seller</h1>
            <p className="text-[#6B4C3B]/60 mt-2">
              Plotëso të dhënat për të filluar listimin e pronave në platformë
            </p>
          </div>
          <BecomeSellerForm />
        </div>
      </main>
    )
  }

  // ═══════════════════════════════════════════════════════════
  // 4. NËSE ËSHTË SELLER → SHFAQ FAQEN E PLOTË
  // ═══════════════════════════════════════════════════════════

  const steps = [
    {
      number: '01',
      title: 'Krijo Llogari',
      description:
        'Regjistrohu falas si seller dhe plotëso të dhënat e tua bazë.',
    },
    {
      number: '02',
      title: 'Shto Pronën',
      description:
        'Plotëso format e pronës me detaje, foto dhe çmimin e dëshiruar.',
    },
    {
      number: '03',
      title: 'Prit Aprovimin',
      description:
        'Ekipi ynë shqyrton listimin brenda 24-48 orëve dhe të njofton.',
    },
    {
      number: '04',
      title: 'Shitet / Qera',
      description:
        'Marrim kërkesa, caktojmë takime dhe ti menaxhon procesin.',
    },
  ]

  const benefits = [
    {
      icon: Users,
      title: 'Audiencë e Gjerë',
      description:
        'Mijëra vizitorë aktivë kërkojnë pronën e tyre çdo ditë në platformën tonë.',
    },
    {
      icon: Camera,
      title: 'Foto Profesionale',
      description:
        'Fotografë të certifikuar për të kapur pronën në dritën më të mirë.',
    },
    {
      icon: TrendingUp,
      title: 'Statistika Live',
      description:
        'Shiko sa persona shohin pronën tënde, favorite dhe kërkesat në kohë reale.',
    },
    {
      icon: Clock,
      title: 'Menaxhim i Lehtë',
      description:
        'Kontroll i plotë mbi listimet, takimet dhe kërkesat nga një dashboard i vetëm.',
    },
    {
      icon: Shield,
      title: 'Verifikim i Sigurt',
      description:
        'Të gjitha listimet verifikohen për të mbrojtur blerësit dhe shitësit.',
    },
  ]

  const pricing = [
    {
      name: 'Bazik',
      price: 'Falas',
      description: 'Për fillestarët që duan të provojnë platformën',
      features: [
        '1 listim aktiv',
        '5 foto',
        'Statistika bazë',
        'Përgjigje ndaj kërkesave',
        'Mbështetje me email',
      ],
      highlighted: false,
    },
    {
      name: 'Premium',
      price: '€29',
      period: '/muaj',
      description: 'Për shitës serioz që duan më shumë',
      features: [
        '10 listime aktive',
        '20 foto për listim',
        'Statistika të detajuara',
        'Promovim në faqen kryesore',
        'Fotograf profesional (1 sesion)',
        'Mbështetje prioritare',
      ],
      highlighted: true,
    },
    {
      name: 'Agjenci',
      price: '€99',
      description: 'Për agjensitë dhe zhvilluesit',
      period: '/muaj',
      features: [
        'Listime të pakufizuara',
        'Foto të pakufizuara',
        'Statistika avancuara + eksport',
        'Branding i personalizuar',
        'API access',
        'Menaxher llogarie dedikuar',
        'Trajnim për ekipin',
      ],
      highlighted: false,
    },
  ]

  const testimonials = [
    {
      id: 1,
      name: 'Arben Krasniqi',
      role: 'Shitës i Suksesshëm',
      review:
        'Shita apartamentin brenda 3 javësh! Platforma më dha ekspozim të madh dhe komunikim të thjeshtë me blerësit. Rekomandim i plotë.',
    },
    {
      id: 2,
      name: 'Vjollca Berisha',
      role: 'Investitore',
      review:
        'Kam listuar 5 prona dhe të gjitha janë menaxhuar në mënyrë perfekte. Dashboard-i është shumë i dobishëm dhe mbështetja është e shkëlqyer.',
    },
    {
      id: 3,
      name: 'Dritan Hoxha',
      role: 'Zhvillues',
      review:
        'Si zhvillues, kam gjetur blerës të kualifikuar shumë shpejt. Procesi është transparent dhe komisioni zero është një bonus i madh.',
    },
  ]

  return (
    <main className="bg-[#F7F3EE] text-black">
      {/* ═══════════════════════════════════════════════════════ */}
      {/* HERO                                                     */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#F3E9E0]">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[#6B4C3B]">
              Mirësevjen, {session.user.name || 'Seller'}!
            </p>

            <h1 className="text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
              Shite pronën tënde
              <span className="text-[#6B4C3B]"> shpejt dhe sigurt.</span>
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-black/65">
              Platforma jonë të lidh me mijëra blerës potencialë. Publiko
              pronën falas, menaxho kërkesat dhe shite më shpejt se kurrë.
            </p>

            {/* ⭐ BUTONAT ME CHECKER */}
            <div className="mt-10 flex flex-wrap gap-4">
              <AddPropertyButton variant="primary" />
              <ViewListingsButton variant="outline" />
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-black/50">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[#6B4C3B]" />
                <span>Listim falas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[#6B4C3B]" />
                <span>Mbështetje 24/7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative shapes */}
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#6B4C3B]/10" />
        <div className="absolute -bottom-40 right-20 h-96 w-96 rounded-full bg-black/5" />
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* HOW IT WORKS                                             */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6B4C3B]">
            Procesi i Shitjes
          </p>

          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Vetëm 4 hapa të thjeshtë
          </h2>

          <p className="mt-5 text-black/60">
            Nga regjistrimi deri në shitje, ne të mbështesim në çdo hap të
            procesit.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.number} className="relative">
              <div className="text-6xl font-bold text-[#6B4C3B]/15">
                {step.number}
              </div>
              <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-black/60">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* PRICING                                                  */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6B4C3B]">
            Planet
          </p>

          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Zgjidh planin që të përshtatet
          </h2>

          <p className="mt-5 text-black/60">
            Fillo falas dhe rrit ndërsa biznesi yt rritet.
          </p>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {pricing.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 transition duration-300 ${
                plan.highlighted
                  ? 'bg-[#6B4C3B] text-white shadow-2xl lg:scale-105'
                  : 'bg-white shadow-sm hover:shadow-lg'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[#F3E9E0] px-4 py-1 text-xs font-semibold text-[#6B4C3B]">
                  MË POPULLOR
                </div>
              )}

              <h3
                className={`text-2xl font-semibold ${
                  plan.highlighted ? 'text-white' : 'text-black'
                }`}
              >
                {plan.name}
              </h3>

              <div className="mt-4 flex items-baseline gap-1">
                <span
                  className={`text-4xl font-semibold ${
                    plan.highlighted ? 'text-white' : 'text-black'
                  }`}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span
                    className={`text-sm ${
                      plan.highlighted ? 'text-white/60' : 'text-black/50'
                    }`}
                  >
                    {plan.period}
                  </span>
                )}
              </div>

              <p
                className={`mt-3 text-sm ${
                  plan.highlighted ? 'text-white/70' : 'text-black/60'
                }`}
              >
                {plan.description}
              </p>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckCircle
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        plan.highlighted ? 'text-[#F3E9E0]' : 'text-[#6B4C3B]'
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        plan.highlighted ? 'text-white/85' : 'text-black/70'
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* ⭐ BUTONI ME CHECKER */}
              <div className="mt-8">
                <AddPropertyButton
                  variant={plan.highlighted ? 'secondary' : 'primary'}
                  label="Shto Pronë"
                  className="w-full !py-3 !text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* TESTIMONIALS                                             */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="bg-[#F3E9E0] px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#6B4C3B]">
              Suksese
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Çfarë thonë shitësit
            </h2>

            <p className="mt-5 text-black/60">
              Mijëra shitës kanë gjetur blerësin e duhur përmes platformës
              tonë.
            </p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article
                key={testimonial.id}
                className="flex flex-col rounded-3xl bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <p className="flex-1 text-base leading-7 text-black/70">
                  "{testimonial.review}"
                </p>

                <div className="mt-8 border-t border-black/10 pt-6">
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="mt-1 text-sm text-black/50">
                    {testimonial.role}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* FINAL CTA                                                */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="bg-black px-6 py-24 text-[#F7F3EE] lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#F3E9E0]/60">
            Gati të Fillosh?
          </p>

          <h2 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            Shite pronën tënde sot.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-white/60">
            Regjistrohu falas si shitës, publiko pronën tënde dhe lidhu me
            mijëra blerës të interesuar.
          </p>

          {/* ⭐ BUTONAT ME CHECKER */}
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <AddPropertyButton variant="secondary" />
            <ViewListingsButton variant="primary" label="Shiko Pronat" />
          </div>
        </div>
      </section>
    </main>
  )
}