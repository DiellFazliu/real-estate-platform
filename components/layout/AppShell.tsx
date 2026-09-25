'use client'

import { usePathname } from 'next/navigation'

import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CompareBar } from '@/components/compare/CompareBar'

export default function AppShell({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const isAgent = pathname.startsWith('/agent')
  const isAdmin = pathname.startsWith('/admin')
  const isStudio = pathname.startsWith('/studio')
  const isOwner = pathname.startsWith('/owner')

  const isDashboard = isAgent || isAdmin || isStudio || isOwner

  if (isDashboard) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />

      <main className="flex-1">
        {children}
      </main>

      <Footer />

      <CompareBar />
    </>
  )
}