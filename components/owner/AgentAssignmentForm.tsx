'use client'

// components/owner/AgentAssignmentForm.tsx — assign or reassign an agent
// to a property from the owner/admin side. Self-contained form: select
// + submit. Success and error feedback both render inline.
//
// Used on the property review page and (potentially) on property detail
// pages owned by the admin.

import { useState } from 'react'

import { assignPropertyAgent } from '@/app/actions/properties'

type Agent = {
  id: number
  name: string | null
  email: string
}

export function AgentAssignmentForm({
  propertyId,
  currentAgentId,
  agents,
}: {
  propertyId: number
  currentAgentId: number | null
  agents: Agent[]
}) {
  const [agentId, setAgentId] = useState(
    currentAgentId ? String(currentAgentId) : '',
  )
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!agentId) {
      setError('Zgjidhni një agjent.')
      return
    }

    setSubmitting(true)
    const formData = new FormData()
    formData.set('propertyId', String(propertyId))
    formData.set('agentId', agentId)
    const result = await assignPropertyAgent(formData)
    setSubmitting(false)

    if (!result.success) {
      setError(result.error || 'Caktimi dështoi.')
      return
    }

    setMessage(result.message || 'Agjenti u caktua.')
  }

  return (
    <section className="rounded-2xl border border-[#E8DDD2] bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-black">Cakto agjent</h2>
        <p className="mt-1 text-sm text-[#6B4C3B]/60">
          Agjenti i caktuar do ta menaxhojë këtë pronë dhe takimet e saj.
        </p>
      </div>

      {agents.length === 0 ? (
        <p className="mt-5 rounded-lg bg-[#F7F3EE] p-4 text-sm text-[#6B4C3B]/70">
          Nuk ka agjentë aktivë të disponueshëm.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-5 flex flex-col gap-3 sm:flex-row">
          <select
            value={agentId}
            onChange={(event) => setAgentId(event.target.value)}
            className="min-h-11 flex-1 rounded-lg border border-[#D8C4B3] bg-white px-3 text-black outline-none focus:border-[#6B4C3B]"
          >
            <option value="">Zgjidh agjentin</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name || agent.email} · {agent.email}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={submitting}
            className="min-h-11 rounded-lg bg-[#6B4C3B] px-5 font-semibold text-white transition hover:bg-[#4A342A] disabled:opacity-50"
          >
            {submitting ? 'Duke ruajtur...' : 'Cakto agjentin'}
          </button>
        </form>
      )}

      {message && (
        <p className="mt-3 text-sm font-medium text-emerald-700">{message}</p>
      )}
      {error && (
        <p className="mt-3 text-sm font-medium text-red-700">{error}</p>
      )}
    </section>
  )
}