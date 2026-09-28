import Link from 'next/link'
import { redirect } from 'next/navigation'
import { MessageSquare } from 'lucide-react'

import { auth } from '@/lib/auth/auth'
import { getAgentConversations } from '@/lib/db/queries/chat'

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

export default async function AgentConversationsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const agentId = Number(session.user.id)
  const conversations = await getAgentConversations(agentId)

  return (
    <div className="p-8 lg:p-10">
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-[#6B4C3B]">
          Mesazhet
        </p>
        <h1 className="font-serif text-4xl text-[#171310]">Bisedat</h1>
        <p className="mt-2 text-sm text-gray-500">
          {conversations.length}{' '}
          {conversations.length === 1 ? 'bisedë' : 'biseda'} totale
        </p>
      </div>

      {conversations.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm">
          <MessageSquare className="mx-auto h-8 w-8 text-[#6B4C3B]/40" />
          <p className="mt-3 text-sm font-medium text-[#171310]">
            Nuk ka biseda
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Klientët do të shfaqen këtu kur të kontaktojnë.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((c) => (
            <Link
              key={c.id}
              href={`/agent/conversations/${c.id}`}
              className="block rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F3E9E0] text-sm font-semibold text-[#6B4C3B]">
                  {c.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-[#171310]">
                      {c.user?.name || 'Përdorues'}
                    </p>
                    <div className="flex shrink-0 items-center gap-2">
                      {c.unreadCount > 0 && (
                        <span className="rounded-full bg-[#6B4C3B] px-2 py-0.5 text-[10px] font-bold text-white">
                          {c.unreadCount}
                        </span>
                      )}
                      <span className="text-[11px] text-gray-400">
                        {formatRelative(c.last_message_at)}
                      </span>
                    </div>
                  </div>

                  {c.property && (
                    <p className="mt-0.5 truncate text-[11px] text-[#8B6B5A]">
                      {c.property.title}
                    </p>
                  )}

                  <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                    {c.lastMessage?.content || 'Pa mesazhe'}
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