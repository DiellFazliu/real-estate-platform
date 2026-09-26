'use client'

import { useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { updateAppointmentComment } from '@/app/actions/appointments'

interface AppointmentCommentFormProps {
    appointmentId: number
    initialComment: string | null
}

export function AppointmentCommentForm({
    appointmentId,
    initialComment,
}: AppointmentCommentFormProps) {
    const [comment, setComment] = useState(initialComment ?? '')
    const [isPending, setIsPending] = useState(false)
    const [message, setMessage] = useState('')

    async function handleSave() {
        setIsPending(true)
        setMessage('')

        const result = await updateAppointmentComment(
            appointmentId,
            comment,
        )

        if (!result.success) {
            setMessage(result.error || 'Nuk u ruajt komenti.')
        } else {
            setMessage('Komenti u ruajt.')
        }

        setIsPending(false)
    }

    return (
        <div className="mt-4 rounded-xl bg-[#F7F3EE] p-4">
            <label
                htmlFor={`comment-${appointmentId}`}
                className="mb-2 block text-sm font-medium text-[#171310]"
            >
                Koment për takimin
            </label>

            <textarea
                id={`comment-${appointmentId}`}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="Shkruaj një koment për këtë takim..."
                className="w-full resize-none rounded-lg border border-[#E8DDD2] bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-[#6B4C3B]"
            />

            <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                    {comment.length}/1000
                </span>

                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isPending}
                    className="flex items-center gap-2 rounded-lg bg-[#6B4C3B] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#583e31] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isPending ? (
                        <>
                            <Loader2
                                size={15}
                                className="animate-spin"
                            />
                            Duke ruajtur...
                        </>
                    ) : (
                        <>
                            <Save size={15} />
                            Ruaj komentin
                        </>
                    )}
                </button>
            </div>

            {message && (
                <p className="mt-2 text-xs text-gray-500">
                    {message}
                </p>
            )}
        </div>
    )
}