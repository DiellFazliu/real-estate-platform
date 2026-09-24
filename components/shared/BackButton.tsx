'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function BackButton() {
  const router = useRouter()
  const [canGoBack, setCanGoBack] = useState(false)

  useEffect(() => {
    // Kontrollo nëse ka history për të shkuar mbrapa
    const hasHistory =
      typeof window !== 'undefined' &&
      (window.history.length > 1 ||
        Boolean(document.referrer && document.referrer !== ''))

    setCanGoBack(hasHistory)
  }, [])

  if (!canGoBack) return null

  return (
    <button
      onClick={() => router.back()}
      className="rounded-xl bg-[#6B4C3B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#000000]"
    >
      ← Kthehu Pas
    </button>
  )
}