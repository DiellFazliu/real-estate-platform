'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, Loader2 } from 'lucide-react'

interface Props {
  propertyId: number
  initialIsFavorite: boolean
  isAuthenticated: boolean
}

export function CardFavoriteButton({
  propertyId,
  initialIsFavorite,
  isAuthenticated,
}: Props) {
  const router = useRouter()
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [loading, setLoading] = useState(false)
  const [, startTransition] = useTransition()

  async function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      const callback = encodeURIComponent(window.location.pathname)
      router.push(`/login?callbackUrl=${callback}`)
      return
    }

    const next = !isFavorite
    setIsFavorite(next) // optimistic
    setLoading(true)

    try {
      const res = await fetch('/api/favorites', {
        method: next ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      })

      if (!res.ok) throw new Error('Request failed')

      startTransition(() => router.refresh())
    } catch {
      setIsFavorite(!next) // revert
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-label={
        isFavorite ? 'Hiq nga të preferuarat' : 'Shto në të preferuara'
      }
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur-sm transition hover:scale-110 hover:bg-white disabled:opacity-70"
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin text-[#6B4C3B]" />
      ) : (
        <Heart
          size={18}
          className={
            isFavorite
              ? 'fill-red-500 text-red-500'
              : 'fill-transparent text-[#6B4C3B] stroke-[2.5]'
          }
        />
      )}
    </button>
  )
}