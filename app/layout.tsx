import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { PublicChrome } from '@/components/layout/PublicChrome'
import AuthProvider from '@/components/providers/SessionProvider'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Villaron | Premium Real Estate',
  description: 'Find your dream property with us.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans min-h-full antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <PublicChrome slot="navbar" />

          <main className="min-h-screen pt-20">
            {children}
          </main>

          <PublicChrome slot="footer" />
        </AuthProvider>
      </body>
    </html>
  )
}