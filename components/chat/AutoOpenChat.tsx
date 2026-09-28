'use client'

import { useEffect } from 'react'

import { openChat } from '@/lib/chat/events'

const STORAGE_KEY = 'villaron:chat-intent'

export function AutoOpenChat({
  propertyId,
  propertyTitle,
}: {
  propertyId: number
  propertyTitle: string
}) {
  useEffect(() => {
    let intent: string | null = null
    try {
      intent = sessionStorage.getItem(STORAGE_KEY)
    } catch {}

    if (intent !== 'contact') return

    // Do NOT remove sessionStorage until the timer actually fires.
    // In Strict Mode, the first effect is discarded; if we removed the
    // key during the first run, the second run sees null and bails out.
    const timer = setTimeout(() => {
      try {
        sessionStorage.removeItem(STORAGE_KEY)
      } catch {}

      openChat({ propertyId, propertyTitle })
    }, 500)

    return () => clearTimeout(timer)
  }, [propertyId, propertyTitle])

  return null
}