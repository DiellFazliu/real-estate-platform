'use client'

import { usePathname } from 'next/navigation'

import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'

type PublicChromeProps = {
  slot: 'navbar' | 'footer'
}

export function PublicChrome({ slot }: PublicChromeProps) {
  const pathname = usePathname()

  if (pathname.startsWith('/owner') || pathname.startsWith('/admin')) return null

  return slot === 'navbar' ? <Navbar /> : <Footer />
}
