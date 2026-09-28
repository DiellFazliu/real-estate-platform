'use client'

import { useEffect, useState } from 'react'
import {
  CalendarDays,
  X,
  Loader2,
  Check,
} from 'lucide-react'

import { createAppointment } from '@/app/actions/appointments'
import {
  getAvailableAppointmentSlots,
} from '@/app/actions/appointment-avaliability'

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

  // ---------------------------------------------------------
  // MINIMUM DATE
  // ---------------------------------------------------------

  const today = new Date()

  const minDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')

  // ---------------------------------------------------------
  // LOAD AVAILABLE SLOTS
  // ---------------------------------------------------------

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

      const result =
        await getAvailableAppointmentSlots(
          propertyId,
          selectedDate,
        )

      if (!result.success) {
        setSlots([])
        setError(
          result.error ||
          'Nuk mund të kontrollohet disponueshmëria.',
        )
        setIsLoadingSlots(false)
        return
      }

      setSlots(result.slots)
      setIsLoadingSlots(false)
    }

    loadSlots()
  }, [selectedDate, propertyId, isOpen])

  // ---------------------------------------------------------
  // SUBMIT
  // ---------------------------------------------------------

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault()

    setError('')

    if (!selectedDate || !selectedTime) {
      setError('Zgjidhni datën dhe orën.')
      return
    }

    setIsPending(true)

    const formData = new FormData(e.currentTarget)

    formData.set(
      'propertyId',
      String(propertyId),
    )

    /*
     * Build the local appointment datetime.
     *
     * The action currently accepts a datetime string,
     * so we combine the selected date + selected time.
     */
    formData.set(
      'scheduledAt',
      `${selectedDate}T${selectedTime}:00`,
    )

    const result = await createAppointment(formData)

    if (!result.success) {
      setError(result.error || 'Gabim')
      setIsPending(false)

      /*
       * Refresh availability because the slot may have
       * been taken by somebody else while the form was open.
       */
      const refreshed =
        await getAvailableAppointmentSlots(
          propertyId,
          selectedDate,
        )

      setSlots(refreshed.slots ?? [])

      if (!refreshed.success) {
        setError(refreshed.error || 'Nuk mund të kontrollohet disponueshmëria.')
      }

      return
    }

    setSuccess(true)
    setIsPending(false)
  }

  // ---------------------------------------------------------
  // NOT AUTHENTICATED
  // ---------------------------------------------------------

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

  // ---------------------------------------------------------
  // SUCCESS
  // ---------------------------------------------------------

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

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen(true)
          setError('')
        }}
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
            {/* HEADER */}

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

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* DATE */}

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
                  onChange={(e) =>
                    setSelectedDate(e.target.value)
                  }
                  className="w-full h-12 rounded-lg border border-[#E8DDD2] px-3 py-2.5 text-black outline-none focus:border-[#6B4C3B]"
                />
              </div>

              {/* TIME */}

              <div>
                <label
                  htmlFor="scheduledTime"
                  className="mb-2 block text-sm font-medium text-black"
                >
                  Ora
                </label>

                {!selectedDate ? (
                  <div className="h-12 flex items-center px-3 rounded-lg border border-[#E8DDD2] text-sm text-black/40">
                    Fillimisht zgjidhni datën
                  </div>
                ) : isLoadingSlots ? (
                  <div className="h-12 flex items-center justify-center gap-2 rounded-lg border border-[#E8DDD2] text-sm text-black/50">
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                    Duke kontrolluar oraret...
                  </div>
                ) : (
                  <select
                    id="scheduledTime"
                    name="scheduledTime"
                    required
                    value={selectedTime}
                    onChange={(e) =>
                      setSelectedTime(e.target.value)
                    }
                    className="w-full h-12 rounded-lg border border-[#E8DDD2] bg-white px-3 py-2.5 text-black outline-none focus:border-[#6B4C3B]"
                  >
                    <option value="">
                      Zgjidhni orën
                    </option>

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

              {/* NOTES */}

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

              {/* ERROR */}

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  {error}
                </p>
              )}

              {/* BUTTONS */}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={
                    isPending ||
                    isLoadingSlots ||
                    !selectedDate ||
                    !selectedTime
                  }
                  className="flex-1 py-3 rounded-lg bg-[#6B4C3B] text-white font-semibold hover:bg-[#583e31] transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
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