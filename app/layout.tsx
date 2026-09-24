import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { SessionProvider } from 'next-auth/react'

import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CompareProvider } from '@/components/compare/CompareProvider'
import { CompareBar } from '@/components/compare/CompareBar'

import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Villaron | Real Estate Platform',
  description: 'Find your dream property',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-full flex flex-col antialiased`}
        suppressHydrationWarning
      >
        <SessionProvider>
          <CompareProvider>
            <Navbar />

            <main className="flex-1">
              {children}
            </main>

            <Footer />

            <CompareBar />
          </CompareProvider>
        </SessionProvider>
      </body>
    </html>
  )
}