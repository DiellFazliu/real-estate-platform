'use client'

import { useState } from 'react'
import { CalendarDays, X, Loader2, Check } from 'lucide-react'
import { createAppointment } from '@/app/actions/appointments'

interface AppointmentButtonProps {
  propertyId: number
  propertyTitle: string
  isAuthenticated: boolean
}

export function AppointmentButton({
  propertyId,
  propertyTitle,
  isAuthenticated,
}: AppointmentButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setIsPending(true)

    const formData = new FormData(e.currentTarget)
    formData.set('propertyId', String(propertyId))

    const result = await createAppointment(formData)

    if (!result.success) {
      setError(result.error || 'Gabim')
      setIsPending(false)
      return
    }

    setSuccess(true)
    setIsPending(false)
  }

  if (!isAuthenticated) {
    return (
      <a
        href="/login"
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-[#6B4C3B]/20 text-[#6B4C3B] hover:bg-[#F3E9E0] font-medium transition-colors"
      >
        <CalendarDays size={17} />
        Rezervo vizitë (Kërko login)
      </a>
    )
  }

  if (success) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-center gap-2 text-emerald-700 font-semibold">
          <Check size={18} />
          Takimi u kërkua!
        </div>
        <p className="mt-1 text-sm text-emerald-600">
          Do të kontaktoheni për konfirmim.
        </p>
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-[#6B4C3B]/20 text-[#6B4C3B] hover:bg-[#F3E9E0] font-medium transition-colors cursor-pointer"
      >
        <CalendarDays size={17} />
        Rezervo vizitë
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-5">
              <div>
                <h2 className="text-xl font-bold text-black">
                  Rezervo vizitë
                </h2>
                <p className="text-sm text-black/50 mt-1 line-clamp-1">
                  {propertyTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-black/5 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="scheduledDate"
                    className="mb-2 block text-sm font-medium text-black"
                  >
                    Data
                  </label>

                  <input
                    id="scheduledDate"
                    type="date"
                    name="scheduledDate"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full h-12 rounded-lg border border-[#E8DDD2] px-3 py-2.5 text-black outline-none focus:border-[#6B4C3B]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="scheduledTime"
                    className="mb-2 block text-sm font-medium text-black"
                  >
                    Ora
                  </label>

                  <select
                    id="scheduledTime"
                    name="scheduledTime"
                    required
                    className="w-full h-12 rounded-lg border border-[#E8DDD2] bg-white px-3 py-2.5 text-black outline-none focus:border-[#6B4C3B]"
                  >
                    <option value="">Zgjidhni orën</option>
                    <option value="09:00">09:00</option>
                    <option value="09:30">09:30</option>
                    <option value="10:00">10:00</option>
                    <option value="10:30">10:30</option>
                    <option value="11:00">11:00</option>
                    <option value="11:30">11:30</option>
                    <option value="12:00">12:00</option>
                    <option value="12:30">12:30</option>
                    <option value="13:00">13:00</option>
                    <option value="13:30">13:30</option>
                    <option value="14:00">14:00</option>
                    <option value="14:30">14:30</option>
                    <option value="15:00">15:00</option>
                    <option value="15:30">15:30</option>
                    <option value="16:00">16:00</option>
                    <option value="16:30">16:30</option>
                    <option value="17:00">17:00</option>
                    <option value="17:30">17:30</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Shënime
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  maxLength={500}
                  placeholder="P.sh. Interesuar për kuzhinën..."
                  className="w-full px-3 py-2.5 rounded-lg border border-[#E8DDD2] text-black outline-none focus:border-[#6B4C3B] resize-none"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-3 rounded-lg bg-[#6B4C3B] text-white font-semibold hover:bg-[#583e31] transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Duke dërguar...
                    </>
                  ) : (
                    'Konfirmo rezervimin'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-3 rounded-lg border border-[#E8DDD2] text-black/70 font-medium hover:bg-[#F7F3EE] transition"
                >
                  Anulo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}