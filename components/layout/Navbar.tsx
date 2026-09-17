'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Menu, X, Search, Heart, User } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'

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

  // Helper to determine if a link is active
  const isActive = (href: string) => {
    const [path, query] = href.split('?')

    // Path must match
    if (pathname !== path) return false

    // If no query string in href, only match when there's no relevant query on current URL
    if (!query) {
      // For /properties without type, consider active only if no type param
      if (path === '/properties') {
        const type = searchParams.get('type')
        return !type
      }
      return true
    }

    // Compare query params
    const hrefParams = new URLSearchParams(query)
    for (const [key, value] of hrefParams.entries()) {
      if (searchParams.get(key) !== value) return false
    }
    return true
  }

  // Shared link classes
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
            <span className="text-2xl font-bold text-primary">
              Villaron
            </span>

            <span className="text-sm font-light text-foreground/60 hidden sm:inline">
              | Real Estate
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-8">

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

            <Link href="/agents" className={desktopLinkClass('/agents')}>
              Agents
            </Link>

            <Link href="/about" className={desktopLinkClass('/about')}>
              About us
            </Link>

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
              <Link
                href="/favorites"
                aria-label="Favorites"
                className={`p-2 rounded-full transition ${
                  isActive('/favorites')
                    ? 'bg-[#6b4c3b] text-white'
                    : 'hover:bg-primary/10'
                }`}
              >
                <Heart
                  className={`w-5 h-5 ${
                    isActive('/favorites') ? 'text-white' : 'text-foreground/70'
                  }`}
                />
              </Link>

              {/* Authentication */}
              {status === 'loading' ? (
                <div className="w-24 h-9 rounded-full bg-primary/10 animate-pulse" />
              ) : isAuthenticated ? (
                <div className="flex items-center gap-2">

                  <Link
                    href="/profile"
                    className={`flex items-center gap-2 text-sm py-2 px-4 rounded-full transition ${
                      isActive('/profile')
                        ? 'bg-[#6b4c3b] text-white'
                        : 'btn-primary'
                    }`}
                  >
                    <User className="w-4 h-4" />

                    <span>
                      {session.user?.name || 'Profile'}
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
                  className={`text-sm py-2 px-5 rounded-full transition ${
                    isActive('/login')
                      ? 'bg-[#6b4c3b] text-white'
                      : 'btn-primary'
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

            <Link
              href="/agents"
              className={mobileLinkClass('/agents')}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Agents
            </Link>

            <hr className="border-border" />

            {status === 'loading' ? (
              <div className="w-full h-11 rounded-full bg-primary/10 animate-pulse" />
            ) : isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  className={`flex items-center justify-center gap-2 w-full text-center py-3 rounded-full transition ${
                    isActive('/profile')
                      ? 'bg-[#6b4c3b] text-white'
                      : 'btn-primary'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="w-5 h-5" />
                  {session.user?.name || 'My Profile'}
                </Link>

                <Link
                  href="/favorites"
                  className={`flex items-center justify-center gap-2 w-full py-3 rounded-full transition ${
                    isActive('/favorites')
                      ? 'bg-[#6b4c3b] text-white'
                      : 'border border-border'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Heart className="w-5 h-5" />
                  Favorites
                </Link>

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
                  isActive('/login')
                    ? 'bg-[#6b4c3b] text-white'
                    : 'btn-primary'
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