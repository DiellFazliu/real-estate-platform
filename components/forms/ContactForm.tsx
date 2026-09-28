'use client'

import { useActionState } from 'react'
import { CheckCircle2, Loader2, Send, User } from 'lucide-react'

import { submitContactForm } from '@/app/actions/contact'

interface Props {
  defaultName?: string
  defaultEmail?: string
}

type State =
  | { status: 'idle' }
  | { status: 'success'; agentName: string | null; agentEmail: string | null }
  | { status: 'error'; error: string }

export function ContactForm({
  defaultName = '',
  defaultEmail = '',
}: Props) {
  const [state, formAction, pending] = useActionState(
    async (_prev: State, formData: FormData): Promise<State> => {
      const result = await submitContactForm({
        name: String(formData.get('name') ?? ''),
        email: String(formData.get('email') ?? ''),
        subject: String(formData.get('subject') ?? ''),
        message: String(formData.get('message') ?? ''),
      })

      if (!result.success) {
        return {
          status: 'error',
          error: result.error || 'Gabim i panjohur.',
        }
      }

      return {
        status: 'success',
        agentName: result.agentName,
        agentEmail: result.agentEmail,
      }
    },
    { status: 'idle' },
  )

  // ─── Success state ─────────────────────────────────────────
  if (state.status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-12 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-7 w-7" />
        </div>

        <h3 className="text-lg font-bold text-emerald-900">
          Mesazhi u dërgua me sukses
        </h3>

        {state.agentName ? (
          <>
            <p className="mt-3 max-w-sm text-sm leading-6 text-emerald-800">
              Mesazhi juaj i shkoi agjentit:
            </p>

            <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F3E9E0] text-xs font-bold text-[#6B4C3B]">
                {state.agentName.charAt(0).toUpperCase()}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-[#171310]">
                  {state.agentName}
                </p>
                {state.agentEmail && (
                  <p className="text-[11px] text-gray-500">
                    {state.agentEmail}
                  </p>
                )}
              </div>
            </div>

            <p className="mt-4 max-w-sm text-xs leading-5 text-emerald-700/80">
              Do t'ju kontaktojë sa më shpejt në emailin që keni dhënë.
            </p>
          </>
        ) : (
          <p className="mt-3 max-w-sm text-sm leading-6 text-emerald-800">
            Do t'ju kontaktojmë sa më shpejt. Faleminderit!
          </p>
        )}
      </div>
    )
  }

  // ─── Form ──────────────────────────────────────────────────
  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-semibold text-[#000000]"
          >
            Emri
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={defaultName}
            placeholder="Emri juaj"
            className="w-full rounded-xl border border-[#6B4C3B]/15 bg-[#F7F3EE] px-4 py-3 text-sm text-[#000000] outline-none transition placeholder:text-[#000000]/30 focus:border-[#6B4C3B] focus:ring-2 focus:ring-[#6B4C3B]/10"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-semibold text-[#000000]"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            defaultValue={defaultEmail}
            placeholder="email@example.com"
            className="w-full rounded-xl border border-[#6B4C3B]/15 bg-[#F7F3EE] px-4 py-3 text-sm text-[#000000] outline-none transition placeholder:text-[#000000]/30 focus:border-[#6B4C3B] focus:ring-2 focus:ring-[#6B4C3B]/10"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="subject"
          className="mb-2 block text-sm font-semibold text-[#000000]"
        >
          Subjekti
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          required
          placeholder="Si mund t'ju ndihmojmë?"
          className="w-full rounded-xl border border-[#6B4C3B]/15 bg-[#F7F3EE] px-4 py-3 text-sm text-[#000000] outline-none transition placeholder:text-[#000000]/30 focus:border-[#6B4C3B] focus:ring-2 focus:ring-[#6B4C3B]/10"
        />
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-2 block text-sm font-semibold text-[#000000]"
        >
          Mesazhi
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          required
          placeholder="Shkruani mesazhin tuaj..."
          className="w-full resize-none rounded-xl border border-[#6B4C3B]/15 bg-[#F7F3EE] px-4 py-3 text-sm text-[#000000] outline-none transition placeholder:text-[#000000]/30 focus:border-[#6B4C3B] focus:ring-2 focus:ring-[#6B4C3B]/10"
        />
      </div>

      {state.status === 'error' && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#6B4C3B] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#000000] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {pending ? 'Duke dërguar...' : 'Dërgo mesazhin'}
      </button>
    </form>
  )
}