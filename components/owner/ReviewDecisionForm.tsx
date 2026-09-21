'use client'

import Link from 'next/link'
import { useState } from 'react'

import { reviewProperty } from '@/app/actions/properties'

type Decision = 'APPROVED' | 'REJECTED'

export function ReviewDecisionForm({
  propertyId,
  returnPath = '/owner/properties/pending',
}: {
  propertyId: number
  returnPath?: string
}) {
  const [rejectionReason, setRejectionReason] = useState('')
  const [error, setError] = useState('')
  const [pendingDecision, setPendingDecision] = useState<Decision | null>(null)
  const [showRejectionForm, setShowRejectionForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  function beginApproval() {
    setError('')
    setPendingDecision('APPROVED')
  }

  function beginRejection() {
    setError('')
    setShowRejectionForm(true)
    setPendingDecision(null)
  }

  function confirmRejection() {
    if (rejectionReason.trim().length < 10) {
      setError('Jepni një arsye refuzimi prej së paku 10 karakteresh.')
      return
    }

    setError('')
    setPendingDecision('REJECTED')
  }

  async function submitDecision() {
    if (!pendingDecision) return

    setSubmitting(true)
    setError('')

    const formData = new FormData()
    formData.set('propertyId', String(propertyId))
    formData.set('decision', pendingDecision)
    formData.set('rejectionReason', rejectionReason)

    const result = await reviewProperty(formData)

    if (!result.success) {
      setError(result.error || 'Ndodhi një gabim.')
      setSubmitting(false)
      return
    }

    setSuccessMessage(result.message || 'Vendimi u ruajt me sukses.')
    setSubmitting(false)
  }

  if (successMessage) {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
        <p className="text-lg font-bold text-emerald-900">Review u përfundua</p>
        <p className="mt-1 text-emerald-800">{successMessage}</p>
        <Link
          href={returnPath}
          className="mt-5 inline-flex rounded-lg bg-emerald-700 px-5 py-2.5 font-semibold text-white transition hover:bg-emerald-800"
        >
          Kthehu te listimet në pritje
        </Link>
      </section>
    )
  }

  const isApproving = pendingDecision === 'APPROVED'

  return (
    <section className="rounded-2xl border border-[#E8DDD2] bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-black">Vendimi i review</h2>
          <p className="mt-1 text-sm text-[#6B4C3B]/60">
            Aprovo vetëm kur informacioni, fotografitë dhe çmimi janë të sakta.
          </p>
        </div>
        <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
          Në pritje
        </span>
      </div>

      {!pendingDecision && !showRejectionForm && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={beginApproval}
            className="rounded-lg bg-emerald-700 px-5 py-2.5 font-semibold text-white transition hover:bg-emerald-800"
          >
            Aprovo pronën
          </button>
          <button
            type="button"
            onClick={beginRejection}
            className="rounded-lg border border-red-300 px-5 py-2.5 font-semibold text-red-700 transition hover:bg-red-50"
          >
            Refuzo pronën
          </button>
        </div>
      )}

      {showRejectionForm && !pendingDecision && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <label className="block text-sm font-semibold text-red-950" htmlFor="rejectionReason">
            Arsyeja e refuzimit <span aria-hidden="true">*</span>
          </label>
          <p className="mt-1 text-sm text-red-800">
            Kjo arsye do t’i dërgohet shitësit që ta korrigjojë listimin.
          </p>
          <textarea
            id="rejectionReason"
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            minLength={10}
            maxLength={1000}
            rows={5}
            placeholder="P.sh. Fotografitë nuk tregojnë qartë pronën; ju lutemi ngarkoni të paktën 3 imazhe të jashtme dhe të brendshme."
            className="mt-3 w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-black outline-none focus:border-red-500"
          />
          <p className="mt-1 text-right text-xs text-red-700">{rejectionReason.trim().length}/1000 karaktere</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={confirmRejection}
              className="rounded-lg bg-red-700 px-5 py-2.5 font-semibold text-white transition hover:bg-red-800"
            >
              Vazhdo me refuzimin
            </button>
            <button
              type="button"
              onClick={() => {
                setShowRejectionForm(false)
                setError('')
              }}
              className="rounded-lg px-5 py-2.5 font-semibold text-[#6B4C3B] transition hover:bg-[#F7F3EE]"
            >
              Anulo
            </button>
          </div>
        </div>
      )}

      {pendingDecision && (
        <div
          className={`mt-6 rounded-xl border p-4 ${
            isApproving ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'
          }`}
          role="alert"
        >
          <h3 className={isApproving ? 'font-bold text-emerald-950' : 'font-bold text-red-950'}>
            {isApproving ? 'Konfirmo aprovimin' : 'Konfirmo refuzimin'}
          </h3>
          <p className={`mt-1 text-sm ${isApproving ? 'text-emerald-800' : 'text-red-800'}`}>
            {isApproving
              ? 'Prona do të publikohet dhe shitësi do të njoftohet.'
              : 'Prona do të mbetet private dhe shitësi do të marrë arsyen e refuzimit.'}
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={submitDecision}
              disabled={submitting}
              className={`rounded-lg px-5 py-2.5 font-semibold text-white transition disabled:opacity-50 ${
                isApproving ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-red-700 hover:bg-red-800'
              }`}
            >
              {submitting ? 'Duke ruajtur…' : isApproving ? 'Po, aprovo pronën' : 'Po, refuzo pronën'}
            </button>
            <button
              type="button"
              onClick={() => setPendingDecision(null)}
              disabled={submitting}
              className="rounded-lg px-5 py-2.5 font-semibold text-[#6B4C3B] transition hover:bg-[#F7F3EE] disabled:opacity-50"
            >
              Kthehu
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-4 text-sm font-medium text-red-700">{error}</p>}
    </section>
  )
}
