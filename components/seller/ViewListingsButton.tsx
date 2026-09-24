'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Loader2 } from 'lucide-react'

interface ViewListingsButtonProps {
  variant?: 'primary' | 'outline'
  label?: string
  className?: string
}

export function ViewListingsButton({
  variant = 'outline',
  label = 'Listimet e Mia',
  className = '',
}: ViewListingsButtonProps) {
  const { status } = useSession()

  const isLoading = status === 'loading'
  const isAuthenticated = status === 'authenticated'

  // Destinacioni
  const href = isAuthenticated
    ? '/account/listings'
    : '/login?callbackUrl=/account/listings'

  // Stilet sipas variantit
  const baseStyles =
    'inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold transition'

  const variantStyles = {
    primary: 'bg-[#6B4C3B] text-white hover:bg-black',
    outline:
      'border-2 border-[#6B4C3B] text-[#6B4C3B] hover:bg-[#6B4C3B] hover:text-white',
  }

  return (
    <Link
      href={href}
      className={`${baseStyles} ${variantStyles[variant]} ${className} ${
        isLoading ? 'opacity-70 pointer-events-none' : ''
      }`}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Duke ngarkuar...
        </>
      ) : (
        label
      )}
    </Link>
  )
}