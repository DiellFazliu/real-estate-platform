import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, Building2 } from 'lucide-react'

import { ChatConversation } from '@/components/chat/ChatConversation'
import { auth } from '@/lib/auth/auth'
import { getConversationMessages } from '@/lib/db/queries/chat'

type PageProps = {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function AgentConversationPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const agentId = Number(session.user.id)
  const { id } = await params
  const conversationId = Number(id)

  if (!Number.isSafeInteger(conversationId) || conversationId <= 0) notFound()

  const conversation = await getConversationMessages(conversationId, agentId)

  if (!conversation || conversation.agent_id !== agentId) notFound()

  const messages = conversation.messages.map((m) => ({
    id: m.id,
    sender_id: m.sender_id,
    content: m.content,
    created_at: m.created_at.toISOString(),
    sender: m.sender,
  }))

  return (
    <div className="flex h-[calc(100vh-0px)] flex-col">
      <div className="border-b border-[#EEE5DC] bg-white px-8 py-5">
        <Link
          href="/agent/conversations"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#6B4C3B] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kthehu te bisedat
        </Link>

        <div className="mt-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3E9E0] text-sm font-semibold text-[#6B4C3B]">
            {conversation.user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-[#171310]">
              {conversation.user?.name || 'Përdorues'}
            </p>
            <p className="truncate text-xs text-gray-500">
              {conversation.user?.email}
            </p>
          </div>
        </div>

        {conversation.property && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#FBF8F5] px-3 py-1.5">
            <Building2 className="h-3.5 w-3.5 text-[#6B4C3B]" />
            <Link
              href={`/properties/${conversation.property.slug}`}
              className="text-xs font-medium text-[#171310] hover:text-[#6B4C3B]"
            >
              {conversation.property.title}
            </Link>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        <ChatConversation
          conversationId={conversation.id}
          initialMessages={messages}
          currentUserId={agentId}
          otherPartyName={conversation.user?.name || 'Përdorues'}
          variant="page"
        />
      </div>
    </div>
  )
}