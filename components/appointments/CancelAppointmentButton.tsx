'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, X } from 'lucide-react'
import { cancelAppointment } from '@/app/actions/appointments'

export function CancelAppointmentButton({
  appointmentId,
}: {
  appointmentId: number
}) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  async function handleCancel() {
    if (!confirm('A je i sigurt që dëshiron ta anulosh këtë takim?')) return

    setIsPending(true)
    const result = await cancelAppointment(appointmentId)
    setIsPending(false)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || 'Gabim')
    }
  }

  return (
    <button
      type="button"
      onClick={handleCancel}
      disabled={isPending}
      className="inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 transition disabled:opacity-50"
    >
      {isPending ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          Duke anuluar...
        </>
      ) : (
        <>
          <X size={14} />
          Anulo takimin
        </>
      )}
    </button>
  )
}