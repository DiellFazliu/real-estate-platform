'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'

interface Props {
  variant?: 'primary' | 'secondary' | 'outline'
  label?: string
  className?: string
  plan?: string
}

export function AddPropertyButton({
  variant = 'primary',
  label = 'Shto Pronë',
  className = '',
  plan,
}: Props) {
  const href = plan ? `/upload-listing?plan=${plan}` : '/upload-listing/upload'

  const baseClasses =
    'inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition'

  const variantClasses = {
    primary: 'bg-[#6B4C3B] text-white hover:bg-[#4A342A]',
    secondary: 'bg-[#F3E9E0] text-[#6B4C3B] hover:bg-white',
    outline:
      'border border-[#6B4C3B] text-[#6B4C3B] hover:bg-[#6B4C3B] hover:text-white',
  }

  return (
    <Link
      href={href}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      <Plus className="h-4 w-4" />
      {label}
    </Link>
  )
}