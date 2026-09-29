'use client'

// components/chat/ChatWidget.tsx — floating chat button + panel.
// Views:
//   • menu          — choose "general question" or "about a property" + list of past conversations
//   • chat-new      — write the first message of a new conversation
//   • conversation  — delegated to <ChatConversation />
// Guests can draft a message; it's stashed in localStorage and auto-sent
// after login (see the "pending-chat" effect below).

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  Building2,
  ChevronRight,
  Loader2,
  LogIn,
  MessageSquare,
  Send,
  Sparkles,
  X,
} from 'lucide-react'

import { createConversation } from '@/app/actions/chat'
import { CHAT_OPEN_EVENT, type OpenChatDetail } from '@/lib/chat/events'
import { ChatConversation } from './ChatConversation'

interface ConversationSummary {
  id: number
  status: string
  unreadCount: number
  last_message_at: string
  user?: { id: number; name: string | null; image: string | null }
  agent?: { id: number; name: string | null; image: string | null }
  property?: {
    id: number
    title: string
    slug: string
    city: string | null
  } | null
  lastMessage?: {
    content: string
    sender_id: number
    created_at: string
  } | null
}

type View = 'menu' | 'chat-new' | 'conversation'

export function ChatWidget() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated' && !!session?.user?.id
  const currentUserId = session?.user?.id ? Number(session.user.id) : 0

  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState<View>('menu')
  const [conversationId, setConversationId] = useState<number | null>(null)
  const [conversationMeta, setConversationMeta] = useState<{
    otherPartyName: string
    initialMessages: any[]
  } | null>(null)

  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [loadingList, setLoadingList] = useState(false)

  const [pendingProperty, setPendingProperty] = useState<{
    id?: number
    title?: string
  }>({})

  const [firstMessage, setFirstMessage] = useState('')
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')
  const [showLoginModal, setShowLoginModal] = useState(false)

  // Listen for open-chat event from property pages
  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<OpenChatDetail>).detail || {}
      setPendingProperty({
        id: detail.propertyId,
        title: detail.propertyTitle,
      })
      setIsOpen(true)
      setConversationId(null)
      setConversationMeta(null)
      setView(detail.propertyId ? 'chat-new' : 'menu')
    }

    window.addEventListener(CHAT_OPEN_EVENT, handler)
    return () => window.removeEventListener(CHAT_OPEN_EVENT, handler)
  }, [])

  // Auto-send pending guest chat after login
  useEffect(() => {
    if (!isAuthenticated) return

    const raw = localStorage.getItem('villaron:pending-chat')
    if (!raw) return

    let parsed: any
    try {
      parsed = JSON.parse(raw)
    } catch {
      localStorage.removeItem('villaron:pending-chat')
      return
    }

    localStorage.removeItem('villaron:pending-chat')

    ;(async () => {
      const result = await createConversation({
        propertyId: parsed.propertyId ?? null,
        firstMessage: parsed.message,
      })
      if (result.success && result.conversationId) {
        setPendingProperty({
          id: parsed.propertyId,
          title: parsed.propertyTitle,
        })
        setIsOpen(true)
        await openConversation(result.conversationId)
      }
    })()
  }, [isAuthenticated])

  // Close the login modal once the session becomes valid
  useEffect(() => {
    if (isAuthenticated) {
      setShowLoginModal(false)
    }
  }, [isAuthenticated])

  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) return
    setLoadingList(true)
    try {
      const res = await fetch('/api/conversations', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      setConversations(data.conversations ?? [])
    } catch {}
    setLoadingList(false)
  }, [isAuthenticated])

  useEffect(() => {
    if (isOpen && isAuthenticated && view === 'menu') {
      fetchConversations()
    }
  }, [isOpen, view, isAuthenticated, fetchConversations])

  async function openConversation(id: number) {
    try {
      const res = await fetch(`/api/conversations/${id}/messages`, {
        cache: 'no-store',
      })
      if (!res.ok) return
      const data = await res.json()

      if (!data.messages || !data.conversation) return

      const other =
        data.conversation.user?.id === currentUserId
          ? data.conversation.agent
          : data.conversation.user

      setConversationMeta({
        otherPartyName: other?.name || 'Përdorues',
        initialMessages: data.messages,
      })
      setConversationId(id)
      setView('conversation')
    } catch {}
  }

  async function handleStartConversation(e: React.FormEvent) {
    e.preventDefault()
    const content = firstMessage.trim()
    if (!content || starting) return

    if (!isAuthenticated) {
      try {
        localStorage.setItem(
          'villaron:pending-chat',
          JSON.stringify({
            propertyId: pendingProperty.id ?? null,
            propertyTitle: pendingProperty.title ?? null,
            message: content,
          }),
        )
      } catch {}
      setShowLoginModal(true)
      return
    }

    setStarting(true)
    setError('')

    const result = await createConversation({
      propertyId: pendingProperty.id ?? null,
      firstMessage: content,
    })

    setStarting(false)

    if (result.success && result.conversationId) {
      setFirstMessage('')
      await openConversation(result.conversationId)
      await fetchConversations()
    } else {
      setError(result.error || 'Mesazhi nuk u dërgua.')
    }
  }

  function handleGoToLogin() {
    const callbackUrl = pendingProperty.id ? window.location.pathname : '/'
    router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
  }

  function resetToMenu() {
    setView('menu')
    setConversationId(null)
    setConversationMeta(null)
    setPendingProperty({})
    setFirstMessage('')
    setError('')
    setShowLoginModal(false)
  }

  function handleGeneralQuestion() {
    setPendingProperty({})
    setView('chat-new')
  }

  function handlePropertyQuestion() {
    try {
      sessionStorage.setItem('villaron:chat-intent', 'contact')
    } catch {}
    setIsOpen(false)
    window.location.href = '/properties'
  }

  if (status === 'loading') return null

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (isOpen) {
            setIsOpen(false)
          } else {
            setIsOpen(true)
            resetToMenu()
          }
        }}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#6B4C3B] text-white shadow-lg transition hover:scale-105 hover:bg-[#583e31]"
        aria-label="Hap bisedën"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 flex h-[480px] max-h-[calc(100vh-9rem)] w-[340px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-[#E8DDD2] bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#EEE5DC] bg-[#FBF8F5] px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#171310]">Mesazhet</p>
              <p className="text-[11px] text-gray-400">
                Bisedo me agjentin tonë
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-gray-500 transition hover:bg-white hover:text-[#6B4C3B]"
              aria-label="Mbyll"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="relative flex-1 overflow-hidden">
            {view === 'menu' && (
              <div className="flex h-full flex-col">
                <div className="flex-1 overflow-y-auto p-3">
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleGeneralQuestion}
                      className="group flex w-full items-center gap-3 rounded-xl border border-[#E8DDD2] bg-white p-3.5 text-left transition hover:border-[#6B4C3B]/40 hover:bg-[#FBF8F5]"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3E9E0] text-[#6B4C3B]">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#171310]">
                          Pyetje e përgjithshme
                        </p>
                        <p className="mt-0.5 text-[11px] text-gray-500">
                          Bisedo me një nga agjentët tanë
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-[#6B4C3B]" />
                    </button>

                    <button
                      type="button"
                      onClick={handlePropertyQuestion}
                      className="group flex w-full items-center gap-3 rounded-xl border border-[#E8DDD2] bg-white p-3.5 text-left transition hover:border-[#6B4C3B]/40 hover:bg-[#FBF8F5]"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3E9E0] text-[#6B4C3B]">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#171310]">
                          Rreth një prone
                        </p>
                        <p className="mt-0.5 text-[11px] text-gray-500">
                          Zgjidh pronën dhe kontakto agjentin
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-[#6B4C3B]" />
                    </button>
                  </div>

                  {isAuthenticated && conversations.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                        Bisedat e mëparshme
                      </p>

                      {loadingList ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="h-4 w-4 animate-spin text-[#6B4C3B]" />
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {conversations.map((c) => {
                            const other =
                              c.user?.id === currentUserId ? c.agent : c.user
                            return (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => openConversation(c.id)}
                                className="w-full rounded-xl p-2.5 text-left transition hover:bg-[#FBF8F5]"
                              >
                                <div className="flex items-start gap-2">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F3E9E0] text-xs font-semibold text-[#6B4C3B]">
                                    {other?.name?.charAt(0)?.toUpperCase() || 'A'}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-2">
                                      <p className="truncate text-xs font-semibold text-[#171310]">
                                        {other?.name || 'Përdorues'}
                                      </p>
                                      {c.unreadCount > 0 && (
                                        <span className="shrink-0 rounded-full bg-[#6B4C3B] px-1.5 py-0.5 text-[10px] font-bold text-white">
                                          {c.unreadCount}
                                        </span>
                                      )}
                                    </div>
                                    {c.property && (
                                      <p className="mt-0.5 truncate text-[10px] text-[#8B6B5A]">
                                        {c.property.title}
                                      </p>
                                    )}
                                    <p className="mt-0.5 line-clamp-1 text-[11px] text-gray-500">
                                      {c.lastMessage?.content || 'Pa mesazhe'}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {view === 'chat-new' && (
              <div className="flex h-full flex-col">
                <div className="flex-1 overflow-y-auto p-4">
                  <button
                    type="button"
                    onClick={resetToMenu}
                    className="mb-3 text-[11px] font-medium text-[#6B4C3B] hover:underline"
                  >
                    ← Kthehu
                  </button>

                  {pendingProperty.title ? (
                    <div className="rounded-2xl border border-[#E8DDD2] bg-[#FBF8F5] p-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-[#6B4C3B]" />
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8B6B5A]">
                          Rreth pronës
                        </p>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm font-medium text-[#171310]">
                        {pendingProperty.title}
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-[#E8DDD2] bg-[#FBF8F5] p-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-[#6B4C3B]" />
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#8B6B5A]">
                          Pyetje e përgjithshme
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-gray-600">
                        Do të lidhesh me një nga agjentët tanë.
                      </p>
                    </div>
                  )}

                  <p className="mt-5 text-xs text-gray-500">
                    Shkruaj mesazhin tënd të parë më poshtë.
                  </p>

                  {error && (
                    <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                      {error}
                    </p>
                  )}
                </div>

                <form
                  onSubmit={handleStartConversation}
                  className="border-t border-[#EEE5DC] bg-white p-3"
                >
                  <div className="flex items-end gap-2">
                    <textarea
                      value={firstMessage}
                      onChange={(e) => setFirstMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleStartConversation(
                            e as unknown as React.FormEvent,
                          )
                        }
                      }}
                      rows={3}
                      maxLength={2000}
                      autoFocus
                      placeholder="Shkruaj mesazhin..."
                      className="max-h-32 min-h-[72px] flex-1 resize-none rounded-xl border border-[#E8DDD2] bg-[#FBF8F5] px-3 py-2 text-sm text-[#171310] outline-none focus:border-[#6B4C3B]"
                    />
                    <button
                      type="submit"
                      disabled={starting || !firstMessage.trim()}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#6B4C3B] text-white transition hover:bg-[#583e31] disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Dërgo"
                    >
                      {starting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {view === 'conversation' && conversationId && conversationMeta && (
              <div className="h-full">
                <ChatConversation
                  conversationId={conversationId}
                  initialMessages={conversationMeta.initialMessages}
                  currentUserId={currentUserId}
                  otherPartyName={conversationMeta.otherPartyName}
                  variant="widget"
                  onBack={() => {
                    resetToMenu()
                    fetchConversations()
                  }}
                />
              </div>
            )}

            {showLoginModal && !isAuthenticated && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 p-4">
                <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F3E9E0] text-[#6B4C3B]">
                        <LogIn className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#171310]">
                          Duhet të identifikohesh
                        </p>
                        <p className="mt-1 text-xs leading-5 text-gray-500">
                          Për të dërguar mesazhin dhe për të marrë
                          përgjigje, duhet të hyni në llogari. Mesazhi
                          do të ruhet dhe do të dërgohet automatikisht.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowLoginModal(false)}
                      className="rounded-lg p-1 text-gray-400 transition hover:bg-[#F7F3EE] hover:text-[#6B4C3B]"
                      aria-label="Mbyll"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-5 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={handleGoToLogin}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#6B4C3B] py-2.5 text-sm font-semibold text-white transition hover:bg-[#583e31]"
                    >
                      <LogIn className="h-4 w-4" />
                      Hyr në llogari
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowLoginModal(false)}
                      className="w-full rounded-xl border border-[#E8DDD2] py-2.5 text-sm font-medium text-[#6B4C3B] transition hover:bg-[#F7F3EE]"
                    >
                      Anulo
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}