'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface SaveFavoriteButtonProps {
  propertyId: number
}

export function SaveFavoriteButton({
  propertyId,
}: SaveFavoriteButtonProps) {
  const { data: session, status } = useSession()

  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    setError('')

    // Still loading session
    if (status === 'loading') {
      return
    }

    // User is not logged in
    if (!session) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent(
        window.location.pathname
      )}`

      return
    }

    try {
      setLoading(true)

      const response = await fetch('/api/favorites', {
        method: 'POST',
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
          data.error || 'Nuk mund të ruhet prona.'
        )
      }

      setSaved(true)
    } catch (error) {
      console.error(error)

      setError(
        error instanceof Error
          ? error.message
          : 'Ndodhi një gabim.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleSave}
        disabled={loading || saved}
        className={`w-full py-3 btn btn-secondary transition ${
          saved
            ? 'bg-[#6B4C3B] text-white'
            : ''
        }`}
      >
        {loading ? (
          'Duke ruajtur...'
        ) : saved ? (
          <>
            <Heart
              className="inline-block mr-2 h-5 w-5 fill-current"
            />
            E ruajtur
          </>
        ) : (
          <>
            <Heart className="inline-block mr-2 h-5 w-5" />
            Ruaj Pronën
          </>
        )}
      </button>

      {error && (
        <p className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}