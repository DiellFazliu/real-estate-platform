'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Loader2 } from 'lucide-react'

import { markInquiryResponded } from '@/app/actions/inquiries'

export function MarkRespondedButton({ inquiryId }: { inquiryId: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [, startTransition] = useTransition()

  async function handle() {
    setLoading(true)
    const result = await markInquiryResponded(inquiryId)
    setLoading(false)

    if (result.success) {
      startTransition(() => router.refresh())
    }
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CheckCircle2 className="h-4 w-4" />
      )}
      Shëno si e përgjigjur
    </button>
  )
}