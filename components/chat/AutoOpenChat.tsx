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

    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {}

    // Small delay so ChatWidget mounts and listens for the event
    const timer = setTimeout(() => {
      openChat({ propertyId, propertyTitle })
    }, 400)

    return () => clearTimeout(timer)
  }, [propertyId, propertyTitle])

  return null
}