'use client'

// components/agent/ReplyViaEmailButton.tsx
// Dropdown + explicit mark-responded for an agent inquiry.
// Rule: nothing here auto-marks the inquiry. Opening Gmail/Outlook/default
// mail or copying text are just aids — the agent clicks
// <MarkRespondedButton /> to change status. This matches how real inbox
// tools handle external replies (the app can't know you hit Send).

import { useEffect, useRef, useState } from 'react'
import { Check, Copy, Mail, ChevronDown, ExternalLink } from 'lucide-react'

import { MarkRespondedButton } from './MarkRespondedButton'

interface Props {
  inquiryId: number
  email: string
  subject: string
  inquiryName: string
  originalMessage: string
  alreadyResponded?: boolean
}

export function ReplyViaEmailButton({
  inquiryId,
  email,
  subject,
  inquiryName,
  originalMessage,
  alreadyResponded = false,
}: Props) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState<'email' | 'body' | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const replySubject = `Re: ${subject}`
  const replyBody = `Përshëndetje ${inquiryName},\n\n\n\n—\nMesazhi juaj origjinal:\n${originalMessage}`

  const mailtoHref = `mailto:${email}?subject=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(replyBody)}`
  const gmailHref = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}&su=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(replyBody)}`
  const outlookHref = `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(email)}&subject=${encodeURIComponent(replySubject)}&body=${encodeURIComponent(replyBody)}`

  // Opens a compose window. Does NOT change status.
  function handleOpenLink(href: string, newTab: boolean) {
    setOpen(false)
    if (newTab) {
      window.open(href, '_blank', 'noopener,noreferrer')
    } else {
      window.location.href = href
    }
  }

  // Clipboard only — no status change.
  async function copyText(text: string, kind: 'email' | 'body') {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(kind)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="flex items-center gap-2">
      <div ref={wrapperRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#6B4C3B] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#4A3328]"
        >
          <Mail className="h-4 w-4" />
          {alreadyResponded ? 'Përgjigju përsëri' : 'Përgjigju me Email'}
          <ChevronDown
            className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-[#E8DDD2] bg-white shadow-xl">
            <div className="border-b border-[#EEE5DC] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                Hap me
              </p>
            </div>

            <div className="p-2">
              <button
                type="button"
                onClick={() => handleOpenLink(gmailHref, true)}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm text-[#171310] transition hover:bg-[#FBF8F5]"
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">📧</span>
                  Gmail
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
              </button>

              <button
                type="button"
                onClick={() => handleOpenLink(outlookHref, true)}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm text-[#171310] transition hover:bg-[#FBF8F5]"
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">📨</span>
                  Outlook Web
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
              </button>

              <button
                type="button"
                onClick={() => handleOpenLink(mailtoHref, false)}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm text-[#171310] transition hover:bg-[#FBF8F5]"
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">🖥️</span>
                  Klienti default
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
              </button>
            </div>

            <div className="border-t border-[#EEE5DC] p-2">
              <p className="px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                Ose kopjo manualisht
              </p>

              <button
                type="button"
                onClick={() => copyText(email, 'email')}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm text-[#171310] transition hover:bg-[#FBF8F5]"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Copy className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  <span className="truncate">Kopjo email-in</span>
                </span>
                {copied === 'email' && (
                  <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                )}
              </button>

              <button
                type="button"
                onClick={() => copyText(replyBody, 'body')}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm text-[#171310] transition hover:bg-[#FBF8F5]"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Copy className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  <span className="truncate">Kopjo tekstin e përgjigjes</span>
                </span>
                {copied === 'body' && (
                  <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {!alreadyResponded && <MarkRespondedButton inquiryId={inquiryId} />}
    </div>
  )
}