'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'

interface Props {
  propertyId: number
  initialIsFavorite: boolean
}

export function SaveFavoriteButton({
  propertyId,
  initialIsFavorite,
}: Props) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [loading, setLoading] = useState(false)

  const handleFavorite = async () => {
    try {
      setLoading(true)

      const response = await fetch('/api/favorites', {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to update favorite'
        )
      }

      setIsFavorite(data.isFavorite)
    } catch (error) {
      console.error('Favorite error:', error)

      alert(
        error instanceof Error
          ? error.message
          : 'Ndodhi një gabim.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleFavorite}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-medium transition-colors hover:cursor-pointer ${
        isFavorite
          ? 'bg-[#F3E9E0] text-[#6B4C3B] border border-[#6B4C3B]/20 hover:bg-[#eadcd0]'
          : 'bg-[#6B4C3B] text-white hover:bg-[#583e31]'
      }`}
    >
      <Heart
        size={17}
        fill={isFavorite ? 'currentColor' : 'none'}
      />

      {loading
        ? 'Duke përditësuar...'
        : isFavorite
          ? 'Largo nga pronat favorite'
          : 'Ruaj pronën'}
    </button>
  )
}