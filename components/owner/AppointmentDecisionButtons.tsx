'use client'

// components/owner/AppointmentDecisionButtons.tsx — approve/reject buttons
// for a PENDING appointment on the owner dashboard.
//
// Two-step approve: first click reveals the agent selector; confirm inside
// that panel actually calls the server. Rejection uses a native confirm()
// dialog since it's a single destructive action with no extra input.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Loader2, UserCheck } from 'lucide-react'
import {
  approveAppointmentWithAgent,
  rejectAppointment,
} from '@/app/actions/appointments'

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
    currentAgentId ? String(currentAgentId) : '',
  )
  const [showAgentSelect, setShowAgentSelect] = useState(false)
  const [error, setError] = useState('')

  async function handleApproveClick() {
    setError('')

    // First click: reveal the agent selector. Second click: confirm.
    if (agents.length > 0 && !showAgentSelect) {
      setShowAgentSelect(true)
      return
    }

    setLoading('approve')
    const result = await approveAppointmentWithAgent(
      appointmentId,
      selectedAgentId ? Number(selectedAgentId) : undefined,
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

  // ─── Agent selector panel (shown after first "Aprovo" click) ──
  if (showAgentSelect) {
    return (
      <div className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-4">
        <div className="mb-3 flex items-start gap-2">
          <UserCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
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
          className="mb-3 w-full rounded-lg border border-emerald-300 bg-white px-3 py-2.5 text-black outline-none focus:border-emerald-500"
        >
          <option value="">Pa agjent (mund të caktohet më vonë)</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name || agent.email} · {agent.email}
            </option>
          ))}
        </select>

        {selectedAgentId && (
          <div className="mb-3 rounded-lg border border-emerald-200 bg-white p-2">
            <p className="text-xs font-medium text-emerald-600">
              Agjenti i zgjedhur:
            </p>
            <p className="text-sm font-semibold text-emerald-900">
              {agents.find((a) => String(a.id) === selectedAgentId)?.name ||
                agents.find((a) => String(a.id) === selectedAgentId)?.email}
            </p>
          </div>
        )}

        {error && (
          <p className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleApproveClick}
            disabled={loading !== null}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
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
            className="rounded-lg border border-emerald-300 px-4 py-2.5 font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:opacity-50"
          >
            Anulo
          </button>
        </div>
      </div>
    )
  }

  // ─── Default buttons ─────────────────────────────────────
  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleApproveClick}
          disabled={loading !== null}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
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
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-red-600 px-5 py-2.5 font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
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
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}