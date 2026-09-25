'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Menu,
  X,
  Search,
  Heart,
  User,
  Plus,
  Clock,
  Shield,
  CalendarDays,
} from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { usePathname, useSearchParams } from 'next/navigation'

import { NotificationBell } from '@/components/notifications/NotificationBell'

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

  const sellHref = isSeller ? '/sell' : '/become-seller'
  const sellLabel = isSeller ? 'Sell' : 'Become Seller'

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
    `px-4 py-2 rounded-full transition font-medium text-base whitespace-nowrap ${
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
          ? 'bg-background/95 backdrop-blur-md shadow-md py-4'
          : 'bg-[#F7F3EE] py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center gap-4 h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <span className="text-3xl font-bold text-primary whitespace-nowrap">
              Villaron
            </span>
            <span className="text-sm font-light text-foreground/60 hidden lg:inline whitespace-nowrap">
              | Real Estate
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-4 flex-nowrap">
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

            {isAuthenticated && (
              <Link
                href={sellHref}
                className="flex items-center gap-2 text-foreground/80 hover:text-primary transition font-medium text-base px-3 py-2 whitespace-nowrap"
              >
                <Plus className="w-5 h-5 flex-shrink-0" />
                {sellLabel}
              </Link>
            )}

            {isOwner && (
              <Link
                href={isAdmin ? '/admin/reviews' : '/owner'}
                className="flex items-center gap-2 text-foreground/80 hover:text-primary transition font-medium text-base px-3 py-2 whitespace-nowrap"
              >
                <Clock className="w-5 h-5 flex-shrink-0" />
                {isAdmin ? 'Review' : 'Owner'}
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-2 text-foreground/80 hover:text-primary transition font-medium text-base px-3 py-2 whitespace-nowrap"
              >
                <Shield className="w-5 h-5 flex-shrink-0" />
                Admin
              </Link>
            )}

            <Link href="/about" className={desktopLinkClass('/about')}>
              About
            </Link>

            {/* Right side */}
            <div className="flex items-center gap-2 flex-nowrap ml-4">
              <button
                aria-label="Search"
                className="p-2 rounded-full hover:bg-primary/10 transition flex-shrink-0"
              >
                <Search className="w-5 h-5 text-foreground/70" />
              </button>

              {isAuthenticated && (
                <>
                  <NotificationBell />

                  <Link
                    href="/account/appointments"
                    aria-label="Appointments"
                    title="Takimet e mia"
                    className={`p-2 rounded-full transition flex-shrink-0 ${
                      isActive('/account/appointments')
                        ? 'bg-[#6b4c3b] text-white'
                        : 'text-foreground/70 hover:bg-primary/10'
                    }`}
                  >
                    <CalendarDays className="w-5 h-5" />
                  </Link>

                  <Link
                    href="/account/favorites"
                    aria-label="Favorites"
                    className={`p-2 rounded-full transition flex-shrink-0 ${
                      isActive('/account/favorites')
                        ? 'bg-[#6b4c3b] text-white'
                        : 'text-foreground/70 hover:bg-primary/10'
                    }`}
                  >
                    <Heart className="w-5 h-5" />
                  </Link>
                </>
              )}

              {status === 'loading' ? (
                <div className="w-24 h-10 rounded-full bg-primary/10 animate-pulse" />
              ) : isAuthenticated ? (
                <div className="flex items-center gap-2 flex-nowrap">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 btn-primary text-sm py-2 px-4 whitespace-nowrap"
                  >
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span className="whitespace-nowrap max-w-[120px] truncate">
                      {session.user?.name || 'Account'}
                    </span>
                  </Link>

                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-sm font-medium text-foreground/70 hover:text-primary transition px-3 py-2 hover:cursor-pointer whitespace-nowrap"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className={`text-sm py-2 px-5 rounded-full transition whitespace-nowrap ${
                    isActive('/login') ? 'bg-[#6b4c3b] text-white' : 'btn-primary'
                  }`}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Mobile right side */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated && <NotificationBell />}

            <button
              aria-label="Toggle menu"
              className="p-2 rounded-full hover:bg-primary/10 transition flex-shrink-0"
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
      </div>

      {/* Mobile menu */}
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

            {isAuthenticated && (
              <Link
                href={sellHref}
                className="flex items-center gap-2 text-foreground hover:text-primary font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Plus className="w-5 h-5" />
                {isSeller ? 'Sell Property' : 'Become Seller'}
              </Link>
            )}

            {isOwner && (
              <Link
                href={isAdmin ? '/admin/reviews' : '/owner'}
                className="flex items-center gap-2 text-foreground hover:text-primary font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Clock className="w-5 h-5" />
                {isAdmin ? 'Property review' : 'Owner workspace'}
              </Link>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-2 text-foreground hover:text-primary font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Shield className="w-5 h-5" />
                Admin Panel
              </Link>
            )}

            <Link
              href="/about"
              className={mobileLinkClass('/about')}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>

            <hr className="border-border" />

            {status === 'loading' ? (
              <div className="w-full h-11 rounded-full bg-primary/10 animate-pulse" />
            ) : isAuthenticated ? (
              <>
                <Link
                  href="/notifications"
                  className="flex items-center justify-center gap-2 w-full border border-border py-3 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Njoftimet
                </Link>

                <Link
                  href="/profile"
                  className="flex items-center justify-center gap-2 w-full btn-primary text-center py-3"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="w-5 h-5" />
                  <span className="truncate max-w-[150px]">
                    {session.user?.name || 'My Account'}
                  </span>
                </Link>

                <Link
                  href="/account/appointments"
                  className="flex items-center justify-center gap-2 w-full border border-border py-3 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <CalendarDays className="w-5 h-5" />
                  Takimet e mia
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