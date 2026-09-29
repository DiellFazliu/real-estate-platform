'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Menu,
  X,
  Heart,
  User,
  Clock,
  Shield,
  CalendarDays,
  ChevronDown,
  LogOut,
  Building2,
} from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import { usePathname, useSearchParams } from 'next/navigation'

import { NotificationBell } from '@/components/notifications/NotificationBell'

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

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

  // Mbyll dropdown-in e profilit kur ndryshon faqja
  useEffect(() => {
    setIsProfileOpen(false)
  }, [pathname])

  const isAuthenticated = status === 'authenticated'
  const isSeller = session?.user?.isSeller && session?.user?.sellerVerified
  const isOwner =
    session?.user?.role === 'OWNER' || session?.user?.role === 'ADMIN'
  const isAdmin = session?.user?.role === 'ADMIN'

  // ⭐ SELL LINK - dinamik
  const sellHref = isSeller ? '/upload-listing' : '/sell-for-yourself'
  const sellLabel = 'Ofro pronën'

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
              Pronat
            </Link>

            <Link
              href="/properties?type=rent"
              className={desktopLinkClass('/properties?type=rent')}
            >
              Me qira
            </Link>

            <Link
              href="/properties?type=sale"
              className={desktopLinkClass('/properties?type=sale')}
            >
              Në shitje
            </Link>

            {isAuthenticated && (
              <Link
                href={sellHref}
                className="flex items-center gap-2 text-foreground/80 hover:text-primary transition font-medium text-base px-3 py-2 whitespace-nowrap"
              >
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
              Rreth nesh
            </Link>

            {/* Right side */}
            <div className="flex items-center gap-2 flex-nowrap ml-4">
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
                  {/* ⭐ Profile Dropdown */}
                  <div
                    className="relative"
                    onMouseLeave={() => setIsProfileOpen(false)}
                  >
                    {/* Trigger */}
                    <button
                      type="button"
                      onClick={() => setIsProfileOpen((v) => !v)}
                      onMouseEnter={() => setIsProfileOpen(true)}
                      className="flex items-center gap-2 btn-primary text-sm py-2 px-4 whitespace-nowrap"
                    >
                      <User className="w-4 h-4 flex-shrink-0" />
                      <span className="whitespace-nowrap max-w-[120px] truncate">
                        {session.user?.name || 'Account'}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isProfileOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Dropdown wrapper — pt-2 mban miun brenda */}
                    <div
                      className={`absolute right-0 top-full pt-2 w-64 z-50 origin-top-right transition-all duration-150 ${
                        isProfileOpen
                          ? 'opacity-100 scale-100 pointer-events-auto'
                          : 'opacity-0 scale-95 pointer-events-none'
                      }`}
                    >
                      <div className="overflow-hidden rounded-2xl border border-[#E8DDD2] bg-white shadow-lg">
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-[#EEE5DC]">
                          <p className="text-sm font-semibold text-[#171310] truncate">
                            {session.user?.name || 'Përdoruesi'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {session.user?.email}
                          </p>
                        </div>

                        {/* Items */}
                        <div className="py-2">
                          <Link
                            href="/profile"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#171310] hover:bg-[#F7F3EE] transition"
                          >
                            <User className="w-4 h-4 text-[#6B4C3B]" />
                            Profili im
                          </Link>

                          <Link
                            href="/account/listings"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#171310] hover:bg-[#F7F3EE] transition"
                          >
                            <Building2 className="w-4 h-4 text-[#6B4C3B]" />
                            Shiko pronat e tua
                          </Link>

                          <Link
                            href="/account/favorites"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#171310] hover:bg-[#F7F3EE] transition"
                          >
                            <Heart className="w-4 h-4 text-[#6B4C3B]" />
                            Të preferuarat
                          </Link>

                          <Link
                            href="/account/appointments"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#171310] hover:bg-[#F7F3EE] transition"
                          >
                            <CalendarDays className="w-4 h-4 text-[#6B4C3B]" />
                            Takimet e mia
                          </Link>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-[#EEE5DC] py-2">
                          <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 transition"
                          >
                            <LogOut className="w-4 h-4" />
                            Shkyçu
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className={`text-sm py-2 px-5 rounded-full transition whitespace-nowrap ${
                    isActive('/login') ? 'bg-[#6b4c3b] text-white' : 'btn-primary'
                  }`}
                >
                  Kyqu
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
                  href="/account/listings"
                  className="flex items-center justify-center gap-2 w-full border border-border py-3 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Building2 className="w-5 h-5" />
                  Shiko pronat e tua
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
                    My Listings
                  </Link>
                )}

                {!isSeller && (
                  <Link
                    href="/become-seller"
                    className="flex items-center justify-center gap-2 w-full border border-border py-3 rounded-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
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
                Kyqu
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}