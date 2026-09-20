'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Heart } from 'lucide-react'
import { AuthRequiredModal } from '@/components/auth/AuthRequiredModal'

interface Props {
  propertyId: number
  initialIsFavorite: boolean
}

export function SaveFavoriteButton({
  propertyId,
  initialIsFavorite,
}: Props) {
  const pathname = usePathname()
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [loading, setLoading] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleFavorite = async () => {
    try {
      setLoading(true)

      const response = await fetch('/api/favorites', {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ propertyId }),
      })

      // ⭐ NËSE USER NUK ËSHTË LOGIN
      if (response.status === 401) {
        setShowAuthModal(true)
        return
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update favorite')
      }

      setIsFavorite(!isFavorite)
    } catch (error) {
      console.error('Favorite error:', error)
      alert(error instanceof Error ? error.message : 'Ndodhi një gabim.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleFavorite}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium transition-colors hover:cursor-pointer ${
          isFavorite
            ? 'bg-[#F3E9E0] text-[#6B4C3B] border border-[#6B4C3B]/20 hover:bg-[#eadcd0]'
            : 'bg-[#6B4C3B] text-white hover:bg-[#583e31]'
        }`}
      >
        <Heart size={17} fill={isFavorite ? 'currentColor' : 'none'} />
        {loading
          ? 'Duke përditësuar...'
          : isFavorite
            ? 'Largo nga pronat favorite'
            : 'Ruaj pronën'}
      </button>

      {/* ⭐ MODAL PËR LOGIN/SIGNUP */}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        callbackUrl={pathname}
        title="Duhet të jesh i loguar"
        description="Për të ruajtur pronën në favorite, duhet të kesh një llogari. Kyçu ose regjistrohu për të vazhduar."
      />
    </>
  )
}