'use client'

import { MessageSquare, Lock } from 'lucide-react'

import { openChat } from '@/lib/chat/events'

export function ContactAgentButton({
  propertyId,
  propertyTitle,
  disabled = false,
}: {
  propertyId: number
  propertyTitle: string
  disabled?: boolean
}) {
  if (disabled) {
    return (
      <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        <Lock size={15} className="mt-0.5 shrink-0" />
        <span className="leading-5">
          Kjo pronë është shitur. Kontakti me agjentin është i mbyllur.
        </span>
      </div>
    )
  }

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