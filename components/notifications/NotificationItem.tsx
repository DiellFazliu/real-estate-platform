'use client'

// components/notifications/NotificationItem.tsx — single notification row.
// Two variants:
//   • list      — used on /notifications, shows a delete button
//   • dropdown  — used inside NotificationBell, no delete button
// Renders as a <Link> when the notification has a target URL, otherwise
// as a <button>. Clicking marks it as read (if not already) and, when
// nested in the dropdown, closes the dropdown via onNavigate.

import Link from 'next/link'
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  FileClock,
  Trash2,
  UserCheck,
  UserPlus,
  XCircle,
  type LucideIcon,
} from 'lucide-react'

export type NotificationType = {
  id: number
  type: string
  title: string
  message: string
  link: string | null
  is_read: boolean
  created_at: string | Date
}

// Maps the notification `type` column to a lucide icon. Types not in
// this map fall back to a generic bell.
const ICONS: Record<string, LucideIcon> = {
  new_appointment: CalendarDays,
  appointment_confirmed: CheckCircle2,
  appointment_rejected: XCircle,
  appointment_cancelled: XCircle,
  property_assigned: UserCheck,
  property_approved: CheckCircle2,
  property_rejected: XCircle,
  property_pending_review: FileClock,
  new_seller: UserPlus,
  seller_activated: CheckCircle2,
}

const TONES: Record<string, string> = {
  new_appointment: 'bg-amber-100 text-amber-800',
  appointment_confirmed: 'bg-emerald-100 text-emerald-800',
  appointment_rejected: 'bg-red-100 text-red-800',
  appointment_cancelled: 'bg-gray-100 text-gray-700',
  property_assigned: 'bg-sky-100 text-sky-800',
  property_approved: 'bg-emerald-100 text-emerald-800',
  property_rejected: 'bg-red-100 text-red-800',
  property_pending_review: 'bg-amber-100 text-amber-800',
  new_seller: 'bg-sky-100 text-sky-800',
  seller_activated: 'bg-emerald-100 text-emerald-800',
}

// Shared with NotificationsList — kept here because both files import it.
export function formatRelative(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const diff = Date.now() - d.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'Tani'
  if (minutes === 1) return '1 minutë më parë'
  if (minutes < 60) return `${minutes} minuta më parë`
  if (hours === 1) return '1 orë më parë'
  if (hours < 24) return `${hours} orë më parë`
  if (days === 1) return 'Dje'
  if (days < 7) return `${days} ditë më parë`

  return new Intl.DateTimeFormat('sq-AL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

export function NotificationItem({
  notification,
  variant = 'list',
  onMarkRead,
  onDelete,
  onNavigate,
}: {
  notification: NotificationType
  variant?: 'list' | 'dropdown'
  onMarkRead?: (id: number) => void
  onDelete?: (id: number) => void
  onNavigate?: () => void
}) {
  const Icon = ICONS[notification.type] ?? Bell
  const tone = TONES[notification.type] ?? 'bg-gray-100 text-gray-700'

  const content = (
    <div className="flex items-start gap-3">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tone}`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p
            className={`text-sm leading-5 ${
              notification.is_read
                ? 'font-normal text-gray-600'
                : 'font-medium text-[#171310]'
            }`}
          >
            {notification.title}
          </p>
          {!notification.is_read && (
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6B4C3B]" />
          )}
        </div>

        <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-gray-500">
          {notification.message}
        </p>

        <p className="mt-1 text-[11px] text-gray-400">
          {formatRelative(notification.created_at)}
        </p>
      </div>

      {variant === 'list' && onDelete && (
        <button
          type="button"
          onClick={(e) => {
            // The row is often wrapped in a <Link>; stop both default
            // navigation and bubbling so delete doesn't open the target.
            e.preventDefault()
            e.stopPropagation()
            onDelete(notification.id)
          }}
          aria-label="Fshij njoftimin"
          className="shrink-0 rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )

  const handleClick = () => {
    if (!notification.is_read && onMarkRead) {
      onMarkRead(notification.id)
    }
    if (onNavigate) onNavigate()
  }

  if (notification.link) {
    return (
      <Link
        href={notification.link}
        onClick={handleClick}
        className={`block rounded-xl p-3 transition hover:bg-[#F7F3EE] ${
          !notification.is_read ? 'bg-[#FBF8F5]' : ''
        }`}
      >
        {content}
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`block w-full rounded-xl p-3 text-left transition hover:bg-[#F7F3EE] ${
        !notification.is_read ? 'bg-[#FBF8F5]' : ''
      }`}
    >
      {content}
    </button>
  )
}