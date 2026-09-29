// lib/chat/events.ts — cross-component event bus for the chat widget.
// Property pages dispatch `openChat({ propertyId, propertyTitle })` from
// any client component, and ChatWidget listens for the event to open
// itself in the "new conversation about this property" view.
//
// SSR-safe: openChat() is a no-op when there is no `window`.

export const CHAT_OPEN_EVENT = 'villaron:open-chat'

export interface OpenChatDetail {
  propertyId?: number
  propertyTitle?: string
}

export function openChat(detail: OpenChatDetail = {}) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent<OpenChatDetail>(CHAT_OPEN_EVENT, { detail }),
  )
}