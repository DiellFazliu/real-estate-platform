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
              Find your dream property with us. Trusted by thousands of happy homeowners.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-primary-foreground/70 hover:text-primary-foreground transition">About Us</Link></li>
              <li><Link href="/properties" className="text-primary-foreground/70 hover:text-primary-foreground transition">Properties</Link></li>
              <li><Link href="/agents" className="text-primary-foreground/70 hover:text-primary-foreground transition">Agents</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/faq" className="text-primary-foreground/70 hover:text-primary-foreground transition">FAQ</Link></li>
              <li><Link href="/contact" className="text-primary-foreground/70 hover:text-primary-foreground transition">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-primary-foreground/70"><a href="/contact" className="hover:text-primary-foreground transition">📧 
                info@villaron.com</a></li>
              <li className="text-primary-foreground/70">📞 +1 (555) 123-4567</li>
              <li className="text-primary-foreground/70">📍 123 Main St, New York</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-sm text-center text-primary-foreground/60">
          <p>© {currentYear} Villaron. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}