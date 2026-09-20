'use client'

import Link from 'next/link'
import { X, LogIn, UserPlus } from 'lucide-react'

interface AuthRequiredModalProps {
  isOpen: boolean
  onClose: () => void
  callbackUrl: string
  title?: string
  description?: string
}

export function AuthRequiredModal({
  isOpen,
  onClose,
  callbackUrl,
  title = 'Duhet të jesh i loguar',
  description = 'Për të ruajtur pronën në favorite, duhet të kesh një llogari.',
}: AuthRequiredModalProps) {
  if (!isOpen) return null

  const encodedCallback = encodeURIComponent(callbackUrl)

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition"
          aria-label="Mbyll"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-[#F3E9E0] flex items-center justify-center">
            <span className="text-3xl">🔒</span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-3">
          {title}
        </h2>

        {/* Description */}
        <p className="text-center text-gray-600 text-sm leading-relaxed mb-8">
          {description}
        </p>

        {/* Buttons */}
        <div className="space-y-3">
          <Link
            href={`/login?callbackUrl=${encodedCallback}`}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#6B4C3B] text-white rounded-xl font-medium hover:bg-[#583e31] transition"
          >
            <LogIn className="w-5 h-5" />
            Kyçu (Login)
          </Link>

          <Link
            href={`/register?callbackUrl=${encodedCallback}`}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#F3E9E0] text-[#6B4C3B] border border-[#6B4C3B]/20 rounded-xl font-medium hover:bg-[#eadcd0] transition"
          >
            <UserPlus className="w-5 h-5" />
            Regjistrohu (Sign Up)
          </Link>
        </div>

        {/* Small note */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Pas login/register, do të kthehesh automatikisht këtu.
        </p>
      </div>
    </div>
  )
}