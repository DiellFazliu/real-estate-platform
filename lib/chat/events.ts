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