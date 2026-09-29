'use client'

// components/appointments/AppointmentButton.tsx — "Rezervo vizitë" button
// on the property detail sidebar.
//
// Three UI states:
//   • Logged-out    → a plain <a href="/login">
//   • Ready         → button that opens the booking modal
//   • Success       → confirmation card (no re-open)
//
// The modal loads available slots for the picked date via a server action.
// If creation fails because the slot was taken between pick and submit, we
// silently refresh the slot list so the user sees the new state.

import { useEffect, useState } from 'react'
import { CalendarDays, X, Loader2, Check } from 'lucide-react'

import { createAppointment } from '@/app/actions/appointments'
import { getAvailableAppointmentSlots } from '@/app/actions/appointment-availability'

interface AppointmentButtonProps {
  propertyId: number
  propertyTitle: string
  isAuthenticated: boolean
}

interface AppointmentSlot {
  time: string
  available: boolean
}

export function AppointmentButton({
  propertyId,
  propertyTitle,
  isAuthenticated,
}: AppointmentButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [slots, setSlots] = useState<AppointmentSlot[]>([])

  // Today, in the format <input type="date"> expects (yyyy-mm-dd).
  const today = new Date()
  const minDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')

  // Load available slots whenever the date changes while the modal is open.
  useEffect(() => {
    if (!selectedDate || !isOpen) {
      setSlots([])
      setSelectedTime('')
      return
    }

    async function loadSlots() {
      setIsLoadingSlots(true)
      setError('')
      setSelectedTime('')

      const result = await getAvailableAppointmentSlots(
        propertyId,
        selectedDate,
      )

      if (!result.success) {
        setSlots([])
        setError(
          result.error || 'Nuk mund të kontrollohet disponueshmëria.',
        )
        setIsLoadingSlots(false)
        return
      }

      setSlots(result.slots)
      setIsLoadingSlots(false)
    }

    loadSlots()
  }, [selectedDate, propertyId, isOpen])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (!selectedDate || !selectedTime) {
      setError('Zgjidhni datën dhe orën.')
      return
    }

    setIsPending(true)

    const formData = new FormData(e.currentTarget)
    formData.set('propertyId', String(propertyId))

    // Combined into an ISO-ish local string the server action parses.
    formData.set('scheduledAt', `${selectedDate}T${selectedTime}:00`)

    const result = await createAppointment(formData)

    if (!result.success) {
      setError(result.error || 'Gabim')
      setIsPending(false)

      // Slot may have been taken by someone else — reload availability.
      const refreshed = await getAvailableAppointmentSlots(
        propertyId,
        selectedDate,
      )

      setSlots(refreshed.slots ?? [])

      if (!refreshed.success) {
        setError(
          refreshed.error || 'Nuk mund të kontrollohet disponueshmëria.',
        )
      }
      return
    }

    setSuccess(true)
    setIsPending(false)
  }

  // ─── Logged-out ──────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <a
        href="/login"
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#6B4C3B]/20 py-3.5 font-medium text-[#6B4C3B] transition-colors hover:bg-[#F3E9E0]"
      >
        <CalendarDays size={17} />
        Rezervo vizitë
      </a>
    )
  }

  // ─── Success ─────────────────────────────────────────────
  if (success) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-center gap-2 font-semibold text-emerald-700">
          <Check size={18} />
          Takimi u kërkua!
        </div>

        <p className="mt-1 text-sm text-emerald-600">
          Do të kontaktoheni për konfirmim.
        </p>
      </div>
    )
  }

  // ─── Default + modal ─────────────────────────────────────
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true)
          setError('')
        }}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#6B4C3B]/20 py-3.5 font-medium text-[#6B4C3B] transition-colors hover:bg-[#F3E9E0]"
      >
        <CalendarDays size={17} />
        Rezervo vizitë
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-black">
                  Rezervo vizitë
                </h2>

                <p className="mt-1 line-clamp-1 text-sm text-black/50">
                  {propertyTitle}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 transition hover:bg-black/5"
                aria-label="Mbyll"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  min={minDate}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="h-12 w-full rounded-lg border border-[#E8DDD2] px-3 py-2.5 text-black outline-none focus:border-[#6B4C3B]"
                />
              </div>

              <div>
                <label
                  htmlFor="scheduledTime"
                  className="mb-2 block text-sm font-medium text-black"
                >
                  Ora
                </label>

                {!selectedDate ? (
                  <div className="flex h-12 items-center rounded-lg border border-[#E8DDD2] px-3 text-sm text-black/40">
                    Fillimisht zgjidhni datën
                  </div>
                ) : isLoadingSlots ? (
                  <div className="flex h-12 items-center justify-center gap-2 rounded-lg border border-[#E8DDD2] text-sm text-black/50">
                    <Loader2 size={16} className="animate-spin" />
                    Duke kontrolluar oraret...
                  </div>
                ) : (
                  <select
                    id="scheduledTime"
                    name="scheduledTime"
                    required
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="h-12 w-full rounded-lg border border-[#E8DDD2] bg-white px-3 py-2.5 text-black outline-none focus:border-[#6B4C3B]"
                  >
                    <option value="">Zgjidhni orën</option>

                    {slots.map((slot) => (
                      <option
                        key={slot.time}
                        value={slot.time}
                        disabled={!slot.available}
                      >
                        {slot.time}
                        {!slot.available ? ' — E zënë' : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-black">
                  Shënime
                </label>

                <textarea
                  name="notes"
                  rows={3}
                  maxLength={500}
                  placeholder="P.sh. Interesuar për kuzhinën..."
                  className="w-full resize-none rounded-lg border border-[#E8DDD2] px-3 py-2.5 text-black outline-none focus:border-[#6B4C3B]"
                />
              </div>

              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={
                    isPending ||
                    isLoadingSlots ||
                    !selectedDate ||
                    !selectedTime
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#6B4C3B] py-3 font-semibold text-white transition hover:bg-[#583e31] disabled:opacity-50"
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
                  className="rounded-lg border border-[#E8DDD2] px-5 py-3 font-medium text-black/70 transition hover:bg-[#F7F3EE]"
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