import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h3 className="text-2xl font-bold mb-4">Villaron</h3>
            <p className="text-primary-foreground/70 text-sm mb-4">
              Gjeni pronën e ëndrrave me ne. Të besuar nga mijëra pronarë të
              kënaqur.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Lidhje të shpejta</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition"
                >
                  Rreth nesh
                </Link>
              </li>
              <li>
                <Link
                  href="/properties"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition"
                >
                  Pronat
                </Link>
              </li>
              <li>
                <Link
                  href="/agents"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition"
                >
                  Agjentët
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Mbështetje</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/faq"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition"
                >
                  Pyetje të shpeshta
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-primary-foreground/70 hover:text-primary-foreground transition"
                >
                  Na kontaktoni
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Kontakt</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-primary-foreground/70">
                <a
                  href="/contact"
                  className="hover:text-primary-foreground transition"
                >
                  info@villaron.com
                </a>
              </li>
              <li className="text-primary-foreground/70">
                +383 44 123 456
              </li>
              <li className="text-primary-foreground/70">
                Prishtinë, Kosovë
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-sm text-center text-primary-foreground/60">
          <p>© {currentYear} Villaron. Të gjitha të drejtat e rezervuara.</p>
        </div>
      </div>
    </footer>
  )
}