'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toggleHeroSlide, deleteHeroSlide } from '@/app/actions/hero-slides'

interface Props {
  slideId: number
  isActive: boolean
}

export function HeroSlideActions({ slideId, isActive }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    const result = await toggleHeroSlide(slideId)
    if (result.success) {
      router.refresh()
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm('A jeni i sigurt?')) return

    setLoading(true)
    const result = await deleteHeroSlide(slideId)
    if (result.success) {
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="flex gap-2 flex-shrink-0">
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
          isActive
            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            : 'bg-green-100 text-green-700 hover:bg-green-200'
        }`}
      >
        {isActive ? 'Çaktivizo' : 'Aktivizo'}
      </button>

      <Link
        href={`/owner/hero-slides/${slideId}/edit`}
        className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
      >
        Edito
      </Link>

      <button
        onClick={handleDelete}
        disabled={loading}
        className="px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
      >
        Fshi
      </button>
    </div>
  )
}