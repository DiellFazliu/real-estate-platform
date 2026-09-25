'use client'

import { useState } from 'react'
import { Check, X, Loader2 } from 'lucide-react'
import {
  acceptAppointment,
  declineAppointment,
} from '@/app/actions/appointments'

interface AppointmentActionsProps {
  appointmentId: number
}

export default function AppointmentActions({
  appointmentId,
}: AppointmentActionsProps) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState('')

  async function handleAccept() {
    setIsPending(true)
    setError('')

    const result = await acceptAppointment(appointmentId)

    if (!result.success) {
      setError(result.error || 'Gabim gjatë pranimit')
      setIsPending(false)
      return
    }

    setIsPending(false)
  }

  async function handleDecline() {
    const confirmed = window.confirm(
      'A jeni i sigurt që dëshironi ta refuzoni këtë takim?'
    )

    if (!confirmed) return

    setIsPending(true)
    setError('')

    const result = await declineAppointment(appointmentId)

    if (!result.success) {
      setError(result.error || 'Gabim gjatë refuzimit')
      setIsPending(false)
      return
    }

    setIsPending(false)
  }

  return (
    <div className="mt-5 border-t border-gray-100 pt-4">
      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleAccept}
          disabled={isPending}
          className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Check size={16} />
          )}
          Prano takimin
        </button>

        <button
          type="button"
          onClick={handleDecline}
          disabled={isPending}
          className="flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <X size={16} />
          )}
          Refuzo
        </button>
      </div>
    </div>
  )
}