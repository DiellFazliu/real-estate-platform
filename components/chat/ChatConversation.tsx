'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Loader2, Send } from 'lucide-react'

import {
  markConversationRead,
  sendMessage,
} from '@/app/actions/chat'

export interface ChatMessage {
  id: number
  sender_id: number
  content: string
  created_at: string
  sender: { id: number; name: string | null; image: string | null }
}

interface Props {
  conversationId: number
  initialMessages: ChatMessage[]
  currentUserId: number
  otherPartyName: string
  variant?: 'widget' | 'page'
  onBack?: () => void
}

const POLL_MS = 15_000

function formatTime(iso: string) {
  return new Intl.DateTimeFormat('sq-AL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,       
  }).format(new Date(iso))
}

export function ChatConversation({
  conversationId,
  initialMessages,
  currentUserId,
  otherPartyName,
  variant = 'widget',
  onBack,
}: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const bottomRef = useRef<HTMLDivElement>(null)
  const latestIdRef = useRef(
    initialMessages.length > 0
      ? initialMessages[initialMessages.length - 1].id
      : 0,
  )

  useEffect(() => {
    markConversationRead(conversationId)
  }, [conversationId])

  useEffect(() => {
    let cancelled = false

    const tick = async () => {
      if (document.visibilityState !== 'visible') return

      try {
        const res = await fetch(
          `/api/conversations/${conversationId}/messages?after=${latestIdRef.current}`,
          { cache: 'no-store' },
        )
        if (!res.ok || cancelled) return

        const data = await res.json()
        if (!cancelled && Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages((prev) => [...prev, ...data.messages])
          latestIdRef.current =
            data.messages[data.messages.length - 1].id
          markConversationRead(conversationId)
        }
      } catch {}
    }

    const id = setInterval(tick, POLL_MS)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') tick()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      cancelled = true
      clearInterval(id)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const content = input.trim()
    if (!content || sending) return

    setSending(true)
    setError('')
    setInput('')

    const optimisticId = -Date.now()
    const optimistic: ChatMessage = {
      id: optimisticId,
      sender_id: currentUserId,
      content,
      created_at: new Date().toISOString(),
      sender: { id: currentUserId, name: null, image: null },
    }

    setMessages((prev) => [...prev, optimistic])

    const result = await sendMessage({ conversationId, content })
    setSending(false)

    if (!result.success) {
      setError(result.error || 'Gabim')
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId))
      setInput(content)
      return
    }

    try {
      const res = await fetch(
        `/api/conversations/${conversationId}/messages?after=${latestIdRef.current}`,
        { cache: 'no-store' },
      )
      const data = await res.json()
      if (Array.isArray(data.messages)) {
        setMessages((prev) =>
          prev.filter((m) => m.id !== optimisticId).concat(data.messages),
        )
        if (data.messages.length > 0) {
          latestIdRef.current =
            data.messages[data.messages.length - 1].id
        }
      }
    } catch {}
  }

  const isWidget = variant === 'widget'

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-[#EEE5DC] px-4 py-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg p-1.5 text-gray-500 transition hover:bg-[#F7F3EE] hover:text-[#6B4C3B]"
            aria-label="Kthehu"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[#171310]">
            {otherPartyName}
          </p>
          <p className="text-[11px] text-gray-400">
            Zakonisht përgjigjet brenda disa minutash
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        className={`flex-1 overflow-y-auto px-4 py-4 ${
          isWidget ? 'bg-[#FBF8F5]' : 'bg-[#F7F3EE]'
        }`}
      >
        {messages.length === 0 && (
          <p className="py-8 text-center text-xs text-gray-400">
            Nuk ka mesazhe ende. Shkruaj të parin.
          </p>
        )}

        <div className="space-y-2">
          {messages.map((m) => {
            const isMine = m.sender_id === currentUserId

            return (
              <div
                key={m.id}
                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-5 ${
                    isMine
                      ? 'bg-[#6B4C3B] text-white'
                      : 'bg-white text-[#171310] shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">
                    {m.content}
                  </p>
                  <p
                    className={`mt-1 text-[10px] ${
                      isMine ? 'text-white/60' : 'text-gray-400'
                    }`}
                  >
                    {formatTime(m.created_at)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="border-t border-[#EEE5DC] bg-white px-3 py-3"
      >
        {error && (
          <p className="mb-2 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs text-red-700">
            {error}
          </p>
        )}

        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend(e as unknown as React.FormEvent)
              }
            }}
            rows={1}
            maxLength={2000}
            placeholder="Shkruaj mesazhin..."
            className="max-h-24 min-h-10 flex-1 resize-none rounded-xl border border-[#E8DDD2] bg-[#FBF8F5] px-3 py-2 text-sm text-[#171310] outline-none focus:border-[#6B4C3B]"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6B4C3B] text-white transition hover:bg-[#583e31] disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Dërgo"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  )
}