'use client'

// components/owner/ReviewDecisionForm.tsx — approve/reject form shown on the
// property review page. Three UI states: idle (initial buttons), approving
// (confirmation), rejecting (reason textarea). Each transition is a
// two-step confirm so an accidental click can't approve or reject a listing.
//
// Approving requires an agent to be selected — see the validator below.

import { useState } from 'react'
import { Check, Info, Loader2, UserCheck, X } from 'lucide-react'

import { reviewProperty } from '@/app/actions/properties'

type Decision = 'APPROVED' | 'REJECTED'
type Mode = 'idle' | 'approving' | 'rejecting'

type Agent = {
  id: number
  name: string | null
  email: string
}

export function ReviewDecisionForm({
  propertyId,
  currentAgentId,
  agents,
}: {
  propertyId: number
  currentAgentId: number | null
  agents: Agent[]
}) {
  const [mode, setMode] = useState<Mode>('idle')
  const [selectedAgentId, setSelectedAgentId] = useState(
    currentAgentId ? String(currentAgentId) : '',
  )
  const [rejectionReason, setRejectionReason] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')

  const selectedAgent = agents.find((a) => String(a.id) === selectedAgentId)
  const agentsAvailable = agents.length > 0
  const agentReady = Boolean(selectedAgentId)

  // Return to the initial state and clear any error shown.
  function resetToIdle() {
    setMode('idle')
    setError('')
  }

  async function submitDecision(decision: Decision) {
    setError('')
    setSuccess('')

    if (decision === 'APPROVED' && !selectedAgentId) {
      setError('Zgjidhni një agjent para se të aprovohet prona.')
      return
    }

    if (decision === 'REJECTED' && rejectionReason.trim().length < 10) {
      setError('Jepni një arsye refuzimi prej së paku 10 karakteresh.')
      return
    }

    setSubmitting(true)

    const formData = new FormData()
    formData.set('propertyId', String(propertyId))
    formData.set('decision', decision)
    formData.set('rejectionReason', rejectionReason)
    if (decision === 'APPROVED') {
      formData.set('agentId', selectedAgentId)
    }

    const result = await reviewProperty(formData)
    setSubmitting(false)

    if (!result.success) {
      setError(result.error || 'Ndodhi një gabim.')
      return
    }

    setSuccess(
      decision === 'APPROVED'
        ? `Prona u aprovua dhe ${selectedAgent?.name || selectedAgent?.email} u caktua si agjent.`
        : 'Prona u refuzua dhe shitësi u njoftua.',
    )
  }

  if (success) {
    return (
      <section className="rounded-2xl bg-white p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <Check className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-serif text-2xl text-[#171310]">
              Review u përfundua
            </h2>
            <p className="mt-2 text-sm text-gray-600">{success}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-2xl bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl text-[#171310]">
            Vendimi i review
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Cakto agjentin, pastaj aprovo ose refuzo pronën.
          </p>
        </div>
        <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
          Në pritje
        </span>
      </div>

      {/* Agent selector */}
      <div className="mt-6 rounded-2xl border border-[#E8DDD2] bg-[#F7F3EE] p-5">
        <div className="flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-[#6B4C3B]" />
          <h3 className="text-xs font-semibold uppercase tracking-widest text-[#6B4C3B]">
            Agjenti i pronës
          </h3>
        </div>

        {!agentsAvailable ? (
          <p className="mt-3 rounded-lg border border-amber-200 bg-white p-3 text-sm text-amber-800">
            Nuk ka agjentë aktivë. Kontakto administratorin përpara se të
            aprovohet prona.
          </p>
        ) : (
          <>
            <p className="mt-2 text-xs text-gray-500">
              I detyrueshëm për aprovim. Do të menaxhojë pronën dhe takimet
              e saj.
            </p>

            <select
              value={selectedAgentId}
              onChange={(event) => {
                setSelectedAgentId(event.target.value)
                setError('')
              }}
              disabled={submitting}
              className="mt-3 min-h-11 w-full rounded-xl border border-[#D8C4B3] bg-white px-3 text-black outline-none transition focus:border-[#6B4C3B] disabled:opacity-50"
            >
              <option value="">— Zgjidh agjentin —</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name || agent.email} · {agent.email}
                </option>
              ))}
            </select>

            {selectedAgent && (
              <p className="mt-2 text-xs font-medium text-emerald-700">
                ✓ Do të caktohet:{' '}
                {selectedAgent.name || selectedAgent.email}
              </p>
            )}
          </>
        )}
      </div>

      {mode === 'idle' && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              setMode('approving')
              setError('')
            }}
            disabled={submitting || !agentsAvailable || !agentReady}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Check size={16} />
            Aprovo pronën
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('rejecting')
              setError('')
            }}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={16} />
            Refuzo pronën
          </button>
        </div>
      )}

      {mode === 'approving' && (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <h3 className="font-bold text-emerald-950">Konfirmo aprovimin</h3>
          <p className="mt-1 text-sm text-emerald-800">
            Prona do të publikohet dhe{' '}
            <strong>{selectedAgent?.name || selectedAgent?.email}</strong> do
            të caktohet si agjent.
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => submitDecision('APPROVED')}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Duke aprovuar…
                </>
              ) : (
                <>
                  <Check size={16} />
                  Po, aprovo
                </>
              )}
            </button>
            <button
              type="button"
              onClick={resetToIdle}
              disabled={submitting}
              className="rounded-xl px-5 py-3 text-sm font-semibold text-[#6B4C3B] transition hover:bg-white disabled:opacity-50"
            >
              Kthehu
            </button>
          </div>
        </div>
      )}

      {mode === 'rejecting' && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <label
            className="block text-sm font-semibold text-red-950"
            htmlFor="rejectionReason"
          >
            Arsyeja e refuzimit <span aria-hidden="true">*</span>
          </label>
          <p className="mt-1 text-sm text-red-800">
            Kjo arsye do t&apos;i dërgohet shitësit. Ai mund të rregullojë dhe
            të ridërgojë për review.
          </p>
          <textarea
            id="rejectionReason"
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            minLength={10}
            maxLength={1000}
            rows={5}
            placeholder="P.sh. Fotografitë nuk tregojnë qartë pronën; ju lutemi ngarkoni të paktën 3 imazhe."
            className="mt-3 w-full rounded-xl border border-red-200 bg-white px-3 py-2 text-black outline-none focus:border-red-500"
          />
          <p className="mt-1 text-right text-xs text-red-700">
            {rejectionReason.trim().length}/1000 karaktere
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => submitDecision('REJECTED')}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-800 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Duke refuzuar…
                </>
              ) : (
                <>
                  <X size={16} />
                  Konfirmo refuzimin
                </>
              )}
            </button>
            <button
              type="button"
              onClick={resetToIdle}
              disabled={submitting}
              className="rounded-xl px-5 py-3 text-sm font-semibold text-[#6B4C3B] transition hover:bg-white disabled:opacity-50"
            >
              Kthehu
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}
    </section>
  )
}