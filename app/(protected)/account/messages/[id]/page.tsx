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

export default async function AccountConversationPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=/account/messages')

  const userId = Number(session.user.id)
  const { id } = await params
  const conversationId = Number(id)

  if (!Number.isSafeInteger(conversationId) || conversationId <= 0) notFound()

  const conversation = await getConversationMessages(conversationId, userId)

  if (!conversation || conversation.user_id !== userId) notFound()

  const messages = conversation.messages.map((m) => ({
    id: m.id,
    sender_id: m.sender_id,
    content: m.content,
    created_at: m.created_at.toISOString(),
    sender: m.sender,
  }))

  return (
    <div className="min-h-screen bg-[#F7F3EE] pt-20">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Link
          href="/account/messages"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#6B4C3B] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Kthehu te mesazhet
        </Link>

        <div className="mt-5 overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="border-b border-[#EEE5DC] bg-[#FBF8F5] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3E9E0] text-sm font-semibold text-[#6B4C3B]">
                {conversation.agent?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-[#171310]">
                  {conversation.agent?.name || 'Agjent'}
                </p>
                <p className="truncate text-xs text-gray-500">
                  {conversation.agent?.email}
                </p>
              </div>
            </div>

            {conversation.property && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white px-3 py-1.5">
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

          <div className="h-[600px]">
            <ChatConversation
              conversationId={conversation.id}
              initialMessages={messages}
              currentUserId={userId}
              otherPartyName={conversation.agent?.name || 'Agjent'}
              variant="page"
            />
          </div>
        </div>
      </div>
    </div>
  )
}