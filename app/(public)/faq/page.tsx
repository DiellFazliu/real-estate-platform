import Link from 'next/link'

const FAQS = [
  {
    question: 'Si mund të kërkoj një pronë?',
    answer:
      'Mund të përdorni kërkimin me AI në faqen e pronave. Përshkruani atë që kërkoni, për shembull "apartament me 2 dhoma në Prishtinë", dhe sistemi do t’ju tregojë pronat që përputhen me kriteret tuaja.',
  },
  {
    question: 'A mund ta blej pronën direkt nga faqja?',
    answer:
      'Jo. Villaron ju ndihmon të gjeni pronën dhe të kontaktoni agjentin përkatës. Blerja ose marrja me qira e pronës realizohet përmes komunikimit me agjentin.',
  },
  {
    question: 'Si mund të kontaktoj një agjent?',
    answer:
      'Hapni faqen e pronës që ju intereson dhe përdorni informacionin e kontaktit të agjentit për të kërkuar më shumë informacione ose për të organizuar një vizitë.',
  },
  {
    question: 'A mund t’i ruaj pronat që më pëlqejnë?',
    answer:
      'Po. Nëse jeni të kyçur në llogarinë tuaj, mund të ruani pronat në listën e të preferuarave dhe t’i gjeni përsëri më vonë.',
  },
  {
    question: 'A mund të kërkoj prona me qira?',
    answer:
      'Po. Mund të përdorni faqen "Me Qira" për të parë vetëm pronat që janë të disponueshme për qira.',
  },
  {
    question: 'A mund të kërkoj prona për shitje?',
    answer:
      'Po. Në faqen "Në Shitje" mund të shfletoni pronat që janë të disponueshme për blerje.',
  },
  {
    question: 'Si mund të bëhem agjent?',
    answer:
      'Për t’u bërë agjent në platformë, kontaktoni ekipin e Villaron për më shumë informacion rreth procesit të regjistrimit dhe verifikimit.',
  },
  {
    question: 'A janë të gjitha pronat të verifikuara?',
    answer:
      'Informacioni dhe statusi i pronave mund të ndryshojnë. Për detajet më të fundit, ju rekomandojmë të kontaktoni agjentin e listuar për pronën.',
  },
]

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-[#F7F3EE] pt-24">
      {/* Header */}
      <section className="bg-[#F3E9E0] px-6 py-20 md:px-12 lg:px-20">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#6B4C3B]">
            FAQ
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-[#000000] md:text-5xl">
            Pyetje të shpeshta
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#000000]/55 md:text-lg">
            Gjeni përgjigje për pyetjet më të zakonshme rreth kërkimit,
            blerjes dhe marrjes me qira të pronave në Villaron.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto w-full max-w-4xl px-5 py-20 sm:px-6 md:py-16">
        <div className="space-y-4">
          {FAQS.map((faq) => (
            <details
              key={faq.question}
              className="group overflow-hidden rounded-2xl border border-[#6B4C3B]/10 bg-white shadow-sm"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 text-base font-semibold text-[#000000] transition hover:text-[#6B4C3B] [&::-webkit-details-marker]:hidden">
                <span>{faq.question}</span>

                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F3E9E0] text-lg text-[#6B4C3B] transition-transform duration-200 group-open:rotate-45">
                  +
                </span>
              </summary>

              <div className="border-t border-[#6B4C3B]/10 px-6 pb-6 pt-4">
                <p className="text-sm leading-7 text-[#000000]/55">
                  {faq.answer}
                </p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="px-5 pb-16 sm:px-6">
        <div className="mx-auto max-w-4xl rounded-3xl bg-[#6B4C3B] px-6 py-12 text-center text-white md:px-12">
          <h2 className="text-2xl font-bold md:text-3xl">
            Nuk e gjetët përgjigjen?
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
            Ekipi ynë është këtu për t’ju ndihmuar me çdo pyetje rreth
            pronave dhe shërbimeve tona.
          </p>

          <Link
            href="/contact"
            className="mt-7 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#6B4C3B] transition hover:bg-[#F3E9E0]"
          >
            Na kontaktoni
          </Link>
        </div>
      </section>
    </main>
  )
}