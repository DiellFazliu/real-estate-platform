'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Check, Loader2, Trash2 } from 'lucide-react'

import {
  deleteAllReadNotifications,
  deleteNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '@/app/actions/notifications'

import { NotificationItem, type NotificationType } from './NotificationItem'

type Filter = 'all' | 'unread'

export function NotificationsList({
  initialNotifications,
}: {
  initialNotifications: NotificationType[]
}) {
  const router = useRouter()
  const [filter, setFilter] = useState<Filter>('all')
  const [items, setItems] = useState<NotificationType[]>(initialNotifications)
  const [isPending, startTransition] = useTransition()

  const unreadCount = useMemo(
    () => items.filter((n) => !n.is_read).length,
    [items],
  )

  const readCount = useMemo(
    () => items.filter((n) => n.is_read).length,
    [items],
  )

  const visible = useMemo(() => {
    if (filter === 'unread') return items.filter((n) => !n.is_read)
    return items
  }, [items, filter])

  const handleMarkRead = (id: number) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    )

    startTransition(async () => {
      const result = await markNotificationAsRead(id)
      if (!result.success) {
        router.refresh()
      }
    })
  }

  const handleDelete = (id: number) => {
    setItems((prev) => prev.filter((n) => n.id !== id))

    startTransition(async () => {
      const result = await deleteNotification(id)
      if (!result.success) {
        router.refresh()
      }
    })
  }

  const handleMarkAll = () => {
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })))

    startTransition(async () => {
      const result = await markAllNotificationsAsRead()
      if (!result.success) {
        router.refresh()
      }
    })
  }

  const handleDeleteAllRead = () => {
    if (readCount === 0) return
    if (
      !window.confirm(
        `Të fshihen ${readCount} njoftime të lexuara? Ky veprim nuk mund të kthehet.`,
      )
    ) {
      return
    }

    setItems((prev) => prev.filter((n) => !n.is_read))

    startTransition(async () => {
      const result = await deleteAllReadNotifications()
      if (!result.success) {
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === 'all'
                ? 'bg-[#6B4C3B] text-white'
                : 'bg-[#F3E9E0] text-[#6B4C3B] hover:bg-[#E8DDD2]'
            }`}
          >
            Të gjitha ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              filter === 'unread'
                ? 'bg-[#6B4C3B] text-white'
                : 'bg-[#F3E9E0] text-[#6B4C3B] hover:bg-[#E8DDD2]'
            }`}
          >
            Të palexuara ({unreadCount})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl border border-[#E8DDD2] bg-white px-4 py-2 text-sm font-medium text-[#6B4C3B] transition hover:bg-[#F7F3EE] disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              Shëno të gjitha si të lexuara
            </button>
          )}

          {readCount > 0 && (
            <button
              type="button"
              onClick={handleDeleteAllRead}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl border border-[#E8DDD2] bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              Fshij të lexuarat
            </button>
          )}
        </div>
      </div>

      {/* List */}
      {visible.length === 0 ? (
        <div className="rounded-2xl bg-white p-16 text-center shadow-sm">
          <Bell className="mx-auto h-8 w-8 text-[#6B4C3B]/40" />
          <p className="mt-4 font-serif text-xl text-[#171310]">
            {filter === 'unread'
              ? 'Nuk ka njoftime të palexuara'
              : 'Nuk ka njoftime'}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Aktiviteti i ri do të shfaqet këtu.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="divide-y divide-[#EEE5DC]">
            {visible.map((n) => (
              <div key={n.id} className="p-2">
                <NotificationItem
                  notification={n}
                  variant="list"
                  onMarkRead={handleMarkRead}
                  onDelete={handleDelete}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {isPending && (
        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <Loader2 className="h-3 w-3 animate-spin" />
          Duke përditësuar…
        </div>
      )}
    </div>
  )
}