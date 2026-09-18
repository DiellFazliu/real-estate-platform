'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Search, Heart, User, Plus, Clock, Shield } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { usePathname, useSearchParams } from 'next/navigation'

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const { data: session, status } = useSession()

  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isAuthenticated = status === 'authenticated'
  const isSeller = session?.user?.isSeller && session?.user?.sellerVerified
  const isOwner =
    session?.user?.role === 'OWNER' || session?.user?.role === 'ADMIN'
  const isAdmin = session?.user?.role === 'ADMIN'

  const isActive = (href: string) => {
    const [path, query] = href.split('?')

    if (pathname !== path) return false

    if (!query) {
      if (path === '/properties') {
        const type = searchParams.get('type')
        return !type
      }
      return true
    }

    const hrefParams = new URLSearchParams(query)
    for (const [key, value] of hrefParams.entries()) {
      if (searchParams.get(key) !== value) return false
    }
    return true
  }

  const desktopLinkClass = (href: string) =>
    `px-4 py-2 rounded-full transition font-medium ${
      isActive(href)
        ? 'bg-[#6b4c3b] text-white'
        : 'text-foreground/80 hover:text-primary'
    }`

  const mobileLinkClass = (href: string) =>
    `block px-4 py-2 rounded-full font-medium transition ${
      isActive(href)
        ? 'bg-[#6b4c3b] text-white'
        : 'text-foreground hover:text-primary'
    }`

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-md shadow-md py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">Villaron</span>
            <span className="text-sm font-light text-foreground/60 hidden sm:inline">
              | Real Estate
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/properties" className={desktopLinkClass('/properties')}>
              Properties
            </Link>

            <Link
              href="/properties?type=rent"
              className={desktopLinkClass('/properties?type=rent')}
            >
              For Rent
            </Link>

            <Link
              href="/properties?type=sale"
              className={desktopLinkClass('/properties?type=sale')}
            >
              For Sale
            </Link>

            {isSeller && (
              <Link
                href="/sell"
                className="flex items-center gap-1 text-foreground/80 hover:text-primary transition font-medium"
              >
                <Plus className="w-4 h-4" />
                Sell
              </Link>
            )}

            {isOwner && (
              <Link
                href="/owner/properties/pending"
                className="flex items-center gap-1 text-foreground/80 hover:text-primary transition font-medium"
              >
                <Clock className="w-4 h-4" />
                Review
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1 text-foreground/80 hover:text-primary transition font-medium"
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}

            <Link href="/about" className={desktopLinkClass('/about')}>
              About us
            </Link>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <button
                aria-label="Search"
                className="p-2 rounded-full hover:bg-primary/10 transition hover:cursor-pointer"
              >
                <Search className="w-5 h-5 text-foreground/70" />
              </button>

              {isAuthenticated && (
                <Link
                  href="/account/favorites"
                  aria-label="Favorites"
                  className="p-2 rounded-full hover:bg-primary/10 transition"
                >
                  <Heart className="w-5 h-5 text-foreground/70" />
                </Link>
              )}

              {status === 'loading' ? (
                <div className="w-24 h-9 rounded-full bg-primary/10 animate-pulse" />
              ) : isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/account"
                    className="flex items-center gap-2 btn-primary text-sm py-2 px-4"
                  >
                    <User className="w-4 h-4" />
                    <span>{session.user?.name || 'Account'}</span>
                  </Link>

                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-sm font-medium text-foreground/70 hover:text-primary transition px-2 hover:cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className={`text-sm py-2 px-5 rounded-full transition ${
                    isActive('/login') ? 'bg-[#6b4c3b] text-white' : 'btn-primary'
                  }`}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          <button
            aria-label="Toggle menu"
            className="md:hidden p-2 rounded-full hover:bg-primary/10 transition"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-t border-border shadow-lg">
          <div className="px-5 py-6 space-y-4">
            <Link
              href="/properties"
              className={mobileLinkClass('/properties')}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Properties
            </Link>

            <Link
              href="/properties?type=rent"
              className={mobileLinkClass('/properties?type=rent')}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              For Rent
            </Link>

            <Link
              href="/properties?type=sale"
              className={mobileLinkClass('/properties?type=sale')}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              For Sale
            </Link>

            {isSeller && (
              <Link
                href="/sell"
                className="flex items-center gap-2 text-foreground hover:text-primary font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Plus className="w-4 h-4" />
                Sell Property
              </Link>
            )}

            {isOwner && (
              <Link
                href="/owner/properties/pending"
                className="flex items-center gap-2 text-foreground hover:text-primary font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Clock className="w-4 h-4" />
                Pending Review
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-2 text-foreground hover:text-primary font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Shield className="w-4 h-4" />
                Admin Panel
              </Link>
            )}

            <hr className="border-border" />

            {status === 'loading' ? (
              <div className="w-full h-11 rounded-full bg-primary/10 animate-pulse" />
            ) : isAuthenticated ? (
              <>
                <Link
                  href="/account"
                  className="flex items-center justify-center gap-2 w-full btn-primary text-center py-3"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="w-5 h-5" />
                  {session.user?.name || 'My Account'}
                </Link>

                <Link
                  href="/account/favorites"
                  className="flex items-center justify-center gap-2 w-full border border-border py-3 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Heart className="w-5 h-5" />
                  Favorites
                </Link>

                {isSeller && (
                  <Link
                    href="/account/listings"
                    className="flex items-center justify-center gap-2 w-full border border-border py-3 rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Plus className="w-5 h-5" />
                    My Listings
                  </Link>
                )}

                {!isSeller && (
                  <Link
                    href="/become-seller"
                    className="flex items-center justify-center gap-2 w-full border border-border py-3 rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Plus className="w-5 h-5" />
                    Become Seller
                  </Link>
                )}

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    signOut({ callbackUrl: '/' })
                  }}
                  className="block w-full text-center text-foreground/70 hover:text-primary font-medium py-2"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className={`block w-full text-center py-3 rounded-full transition ${
                  isActive('/login') ? 'bg-[#6b4c3b] text-white' : 'btn-primary'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}