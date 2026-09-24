'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ArrowRight, Loader2 } from 'lucide-react'

interface AddPropertyButtonProps {
  variant?: 'primary' | 'secondary'
  label?: string
  className?: string
}

export function AddPropertyButton({
  variant = 'primary',
  label = 'Shto Pronë të Re',
  className = '',
}: AddPropertyButtonProps) {
  const { status } = useSession()

  const isLoading = status === 'loading'
  const isAuthenticated = status === 'authenticated'

  // Destinacioni dinamik
  const href = isAuthenticated
    ? '/sell'
    : '/login?callbackUrl=/sell'

  // Stilet sipas variantit
  const baseStyles =
    'inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold transition'

  const variantStyles = {
    primary: 'bg-[#6B4C3B] text-white hover:bg-black',
    secondary: 'bg-[#F3E9E0] text-black hover:bg-white',
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
        <>
          {label}
          <ArrowRight className="h-4 w-4" />
        </>
      )}
    </Link>
  )
}