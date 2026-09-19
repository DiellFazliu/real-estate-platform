'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Loader2, UserCheck } from 'lucide-react'
import { approveAppointmentWithAgent, rejectAppointment } from '@/app/actions/appointments'

type Agent = {
  id: number
  name: string | null
  email: string
}

export function AppointmentDecisionButtons({
  appointmentId,
  agents,
  currentAgentId,
}: {
  appointmentId: number
  agents: Agent[]
  currentAgentId?: number | null
}) {
  const router = useRouter()
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [selectedAgentId, setSelectedAgentId] = useState<string>(
    currentAgentId ? String(currentAgentId) : ''
  )
  const [showAgentSelect, setShowAgentSelect] = useState(false)
  const [error, setError] = useState('')

  async function handleApproveClick() {
    setError('')

    // Nëse ka agjentë dhe dropdown-i nuk është hapur, hape
    if (agents.length > 0 && !showAgentSelect) {
      setShowAgentSelect(true)
      return
    }

    // Konfirmo aprovimin
    setLoading('approve')
    const result = await approveAppointmentWithAgent(
      appointmentId,
      selectedAgentId ? Number(selectedAgentId) : undefined
    )
    setLoading(null)

    if (result.success) {
      router.refresh()
    } else {
      setError(result.error || 'Gabim')
    }
  }

  async function handleReject() {
    if (!confirm('A je i sigurt që dëshiron ta refuzosh këtë takim?')) return

    setLoading('reject')
    const result = await rejectAppointment(appointmentId)
    setLoading(null)

    if (result.success) {
      router.refresh()
    } else {
      setError(result.error || 'Gabim')
    }
  }

  // ═══════════════════════════════════════════════════════════
  // DROPDOWN PËR AGJENTIN (shfaqet pasi kliko "Aprovo")
  // ═══════════════════════════════════════════════════════════
  if (showAgentSelect) {
    return (
      <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-4">
        <div className="mb-3 flex items-start gap-2">
          <UserCheck className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-bold text-emerald-950">
              Cakto agjentin për këtë takim
            </h4>
            <p className="mt-1 text-sm text-emerald-800">
              Agjenti i caktuar do të menaxhojë pronën dhe takimin.
            </p>
          </div>
        </div>

        <select
          value={selectedAgentId}
          onChange={(e) => setSelectedAgentId(e.target.value)}
          className="w-full rounded-lg border border-emerald-300 bg-white px-3 py-2.5 text-black outline-none focus:border-emerald-500 mb-3"
        >
          <option value="">Pa agjent (mund të caktohet më vonë)</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name || agent.email} · {agent.email}
            </option>
          ))}
        </select>

        {selectedAgentId && (
          <div className="mb-3 p-2 rounded-lg bg-white border border-emerald-200">
            <p className="text-xs text-emerald-600 font-medium">
              Agjenti i zgjedhur:
            </p>
            <p className="text-sm font-semibold text-emerald-900">
              {agents.find((a) => String(a.id) === selectedAgentId)?.name ||
                agents.find((a) => String(a.id) === selectedAgentId)?.email}
            </p>
          </div>
        )}

        {error && (
          <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleApproveClick}
            disabled={loading !== null}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {loading === 'approve' ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Duke aprovuar...
              </>
            ) : (
              <>
                <Check size={16} />
                Konfirmo aprovimin
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setShowAgentSelect(false)
              setError('')
            }}
            disabled={loading !== null}
            className="px-4 py-2.5 rounded-lg border border-emerald-300 text-emerald-700 font-semibold hover:bg-emerald-100 transition disabled:opacity-50"
          >
            Anulo
          </button>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════
  // BUTONAT NORMAL
  // ═══════════════════════════════════════════════════════════
  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={handleApproveClick}
          disabled={loading !== null}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {loading === 'approve' ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Duke aprovuar...
            </>
          ) : (
            <>
              <Check size={16} />
              Aprovo takimin
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleReject}
          disabled={loading !== null}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border-2 border-red-600 text-red-600 font-semibold hover:bg-red-50 transition disabled:opacity-50"
        >
          {loading === 'reject' ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Duke refuzuar...
            </>
          ) : (
            <>
              <X size={16} />
              Refuzo
            </>
          )}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
          {error}
        </p>
      )}
    </div>
  )
}