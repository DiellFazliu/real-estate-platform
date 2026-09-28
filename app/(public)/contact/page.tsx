import Link from 'next/link'
import { auth } from '@/lib/auth/auth'
import { ContactForm } from '@/components/forms/ContactForm'

export default async function ContactPage() {
  const session = await auth()

  return (
    <main className="min-h-screen bg-[#F7F3EE] pt-24">
      {/* Header */}
      <section className="bg-[#F3E9E0] px-6 py-20 md:px-12 lg:px-20">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#6B4C3B]">
            Kontakt
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-[#000000] md:text-5xl">
            Na kontaktoni
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#000000]/55 md:text-lg">
            Keni pyetje rreth një prone, dëshironi të organizoni një vizitë
            apo thjesht dëshironi të mësoni më shumë? Jemi këtu për t'ju
            ndihmuar.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Contact Information */}
          <div className="rounded-3xl bg-[#6B4C3B] p-8 text-white lg:col-span-2 md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-white/60">
              Jemi këtu për ju
            </p>

            <h2 className="mt-3 text-2xl font-bold md:text-3xl">
              Le të flasim
            </h2>

            <p className="mt-4 text-sm leading-7 text-white/70">
              Kontaktoni ekipin tonë për informacione rreth pronave,
              agjentëve, vizitave ose çdo pyetje tjetër që mund të keni.
            </p>

            <div className="mt-10 space-y-6">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-lg">
                  ✉
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
                    Email
                  </p>

                  <a
                    href="mailto:info@villaron.com"
                    className="mt-1 block text-sm font-medium transition hover:text-white/70"
                  >
                    info@villaron.com
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-lg">
                  ☎
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
                    Telefon
                  </p>

                  <a
                    href="tel:+38344123456"
                    className="mt-1 block text-sm font-medium transition hover:text-white/70"
                  >
                    +383 44 123 456
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-lg">
                  📍
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
                    Adresa
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    Prishtinë, Kosovë
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-lg">
                  ◷
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
                    Orari
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    Hënë – Premte, 08:00 – 17:00
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-3xl border border-[#6B4C3B]/10 bg-white p-8 shadow-sm lg:col-span-3 md:p-10">
            <h2 className="text-2xl font-bold text-[#000000]">
              Dërgoni një mesazh
            </h2>

            <p className="mt-2 text-sm text-[#000000]/50">
              Plotësoni formularin dhe do t'ju kontaktojmë sa më shpejt.
            </p>

            <ContactForm
              defaultName={session?.user?.name ?? ''}
              defaultEmail={session?.user?.email ?? ''}
            />
          </div>
        </div>
      </section>

      {/* FAQ Link */}
      <section className="px-5 pb-16 sm:px-6">
        <div className="mx-auto max-w-4xl rounded-3xl border border-[#6B4C3B]/10 bg-white px-6 py-10 text-center shadow-sm">
          <h2 className="text-xl font-bold text-[#000000]">
            Keni një pyetje të zakonshme?
          </h2>

          <p className="mt-2 text-sm text-[#000000]/50">
            Shikoni pyetjet tona të shpeshta për përgjigje të shpejta.
          </p>

          <Link
            href="/faq"
            className="mt-5 inline-flex rounded-xl border border-[#6B4C3B] px-6 py-3 text-sm font-semibold text-[#6B4C3B] transition hover:bg-[#6B4C3B] hover:text-white"
          >
            Shiko FAQ
          </Link>
        </div>
      </section>
    </main>
  )
}