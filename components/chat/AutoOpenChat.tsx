'use client'

import { useEffect } from 'react'

import { openChat } from '@/lib/chat/events'

const STORAGE_KEY = 'villaron:chat-intent'

export function AutoOpenChat({
  propertyId,
  propertyTitle,
  isSold = false,
}: {
  propertyId: number
  propertyTitle: string
  isSold?: boolean
}) {
  useEffect(() => {
    // ⭐ Nëse prona është shitur, mos hap chat-in automatikisht
    if (isSold) {
      try {
        sessionStorage.removeItem(STORAGE_KEY)
      } catch {}
      return
    }

    let intent: string | null = null
    try {
      intent = sessionStorage.getItem(STORAGE_KEY)
    } catch {}

    if (intent !== 'contact') return

    const timer = setTimeout(() => {
      try {
        sessionStorage.removeItem(STORAGE_KEY)
      } catch {}

      openChat({ propertyId, propertyTitle })
    }, 500)

    return () => clearTimeout(timer)
  }, [propertyId, propertyTitle, isSold])

  return null
}