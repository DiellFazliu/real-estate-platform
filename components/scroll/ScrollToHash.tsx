'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export function ScrollToHash() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (!hash) return

    let attempts = 0
    const maxAttempts = 30 // 30 × 100ms = max 3s

    const tryScroll = () => {
      const el = document.getElementById(hash)

      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }

      attempts++
      if (attempts < maxAttempts) {
        setTimeout(tryScroll, 100)
      }
    }

    requestAnimationFrame(() => {
      setTimeout(tryScroll, 50)
    })
  }, [pathname, searchParams])

  return null
}