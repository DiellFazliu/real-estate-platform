// app/(protected)/agent/inquiries/page.tsx — agent inbox for contact-form inquiries.
// Lists up to 100 inquiries scoped to the current agent, newest first.
// Shows a preview; the message body is stored as `[Subject]\n\nBody` so
// we strip the subject prefix here and show only the body text.

import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Mail, CheckCircle2 } from 'lucide-react'

import { auth } from '@/lib/auth/auth'
import { getAgentInquiries } from '@/lib/db/queries/inquiries'

export const dynamic = 'force-dynamic'

function formatRelative(iso: Date) {
  const diff = Date.now() - iso.getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)

  if (m < 1) return 'Tani'
  if (m < 60) return `${m} min`
  if (h < 24) return `${h} orë`
  if (d < 7) return `${d} ditë`
  return new Intl.DateTimeFormat('sq-AL', {
    day: 'numeric',
    month: 'short',
  }).format(iso)
}

// Strips the `[Subject]\n\n` prefix for list previews.
function stripSubjectPrefix(raw: string) {
  return raw.replace(/^\[.+?\]\s*\n\n/, '')
}

export default async function AgentInquiriesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const agentId = Number(session.user.id)
  const inquiries = await getAgentInquiries(agentId)

  const newCount = inquiries.filter((i) => i.status === 'NEW').length

  return (
    <div className="p-8 lg:p-10">
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-[#6B4C3B]">
          Kontakt
        </p>
        <h1 className="font-serif text-4xl text-[#171310]">Kërkesat</h1>
        <p className="mt-2 text-sm text-gray-500">
          {inquiries.length}{' '}
          {inquiries.length === 1 ? 'kërkesë' : 'kërkesa'} totale
          {newCount > 0 && (
            <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
              {newCount} të reja
            </span>
          )}
        </p>
      </div>

      {inquiries.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
          <Mail className="mx-auto h-8 w-8 text-[#6B4C3B]/40" />
          <p className="mt-3 text-sm font-medium text-[#171310]">
            Nuk ka kërkesa
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Kërkesat nga formulari i kontaktit do të shfaqen këtu.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {inquiries.map((i) => (
            <Link
              key={i.id}
              href={`/agent/inquiries/${i.id}`}
              className="block rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F3E9E0] text-sm font-semibold text-[#6B4C3B]">
                  {i.name.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-[#171310]">
                      {i.name}
                    </p>
                    <div className="flex shrink-0 items-center gap-2">
                      {i.status === 'NEW' && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                          E RE
                        </span>
                      )}
                      {i.status === 'RESPONDED' && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      )}
                      <span className="text-[11px] text-gray-400">
                        {formatRelative(i.created_at)}
                      </span>
                    </div>
                  </div>

                  <p className="mt-0.5 truncate text-[11px] text-[#8B6B5A]">
                    {i.email}
                  </p>

                  <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                    {stripSubjectPrefix(i.message)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}