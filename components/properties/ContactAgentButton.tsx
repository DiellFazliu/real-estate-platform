'use client'

import { MessageSquare } from 'lucide-react'

import { openChat } from '@/lib/chat/events'

export function ContactAgentButton({
  propertyId,
  propertyTitle,
}: {
  propertyId: number
  propertyTitle: string
}) {
  return (
    <button
      type="button"
      onClick={() => openChat({ propertyId, propertyTitle })}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#6B4C3B] py-3.5 font-medium text-white transition-colors hover:bg-[#583e31]"
    >
      <MessageSquare size={17} />
      Kontakto agjentin
    </button>
  )
}