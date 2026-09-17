'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Search, Heart, User, Plus, Clock, Shield } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const { data: session, status } = useSession()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isAuthenticated = status === 'authenticated'
  const isSeller = session?.user?.isSeller && session?.user?.sellerVerified
  const isOwner = session?.user?.role === 'OWNER' || session?.user?.role === 'ADMIN'
  const isAdmin = session?.user?.role === 'ADMIN'

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
            <span className="text-2xl font-bold text-primary">
              Villaron
            </span>

            <span className="text-sm font-light text-foreground/60 hidden sm:inline">
              | Real Estate
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-6">

            <Link
              href="/properties"
              className="text-foreground/80 hover:text-primary transition font-medium"
            >
              Properties
            </Link>

            <Link
              href="/properties?type=rent"
              className="text-foreground/80 hover:text-primary transition font-medium"
            >
              For Rent
            </Link>

            <Link
              href="/properties?type=sale"
              className="text-foreground/80 hover:text-primary transition font-medium"
            >
              For Sale
            </Link>

            {/* SELLER Links */}
            {isSeller && (
              <Link
                href="/sell"
                className="flex items-center gap-1 text-foreground/80 hover:text-primary transition font-medium"
              >
                <Plus className="w-4 h-4" />
                Sell
              </Link>
            )}

            {/* OWNER Links */}
            {isOwner && (
              <Link
                href="/owner/properties/pending"
                className="flex items-center gap-1 text-foreground/80 hover:text-primary transition font-medium"
              >
                <Clock className="w-4 h-4" />
                Review
              </Link>
            )}

            {/* ADMIN Links */}
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1 text-foreground/80 hover:text-primary transition font-medium"
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}

            {/* Right side */}
            <div className="flex items-center gap-2">

              {/* Search */}
              <button
                aria-label="Search"
                className="p-2 rounded-full hover:bg-primary/10 transition hover:cursor-pointer"
              >
                <Search className="w-5 h-5 text-foreground/70" />
              </button>

              {/* Favorites */}
              {isAuthenticated && (
                <Link
                  href="/account/favorites"
                  aria-label="Favorites"
                  className="p-2 rounded-full hover:bg-primary/10 transition"
                >
                  <Heart className="w-5 h-5 text-foreground/70" />
                </Link>
              )}

              {/* Authentication */}
              {status === 'loading' ? (
                <div className="w-24 h-9 rounded-lg bg-primary/10 animate-pulse" />
              ) : isAuthenticated ? (
                <div className="flex items-center gap-2">

                  <Link
                    href="/account"
                    className="flex items-center gap-2 btn-primary text-sm py-2 px-4"
                  >
                    <User className="w-4 h-4" />

                    <span>
                      {session.user?.name || 'Account'}
                    </span>
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
                  className="btn-primary text-sm py-2 px-5"
                >
                  Sign In
                </Link>
              )}

            </div>
          </div>

          <button
            aria-label="Toggle menu"
            className="md:hidden p-2 rounded-lg hover:bg-primary/10 transition"
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

          <div className="px-4 py-6 space-y-4">

            <Link
              href="/properties"
              className="block text-foreground hover:text-primary font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Properties
            </Link>

            <Link
              href="/properties?type=rent"
              className="block text-foreground hover:text-primary font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              For Rent
            </Link>

            <Link
              href="/properties?type=sale"
              className="block text-foreground hover:text-primary font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              For Sale
            </Link>

            {/* SELLER Links */}
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

            {/* OWNER Links */}
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

            {/* ADMIN Links */}
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
              <div className="w-full h-11 rounded-lg bg-primary/10 animate-pulse" />
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
                className="block w-full btn-primary text-center py-3"
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