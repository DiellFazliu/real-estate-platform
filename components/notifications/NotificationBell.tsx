'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Bell, Check, Loader2 } from 'lucide-react'

import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '@/app/actions/notifications'

import { NotificationItem, type NotificationType } from './NotificationItem'

const POLL_INTERVAL_MS = 30_000

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationType[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isMarkingAll, setIsMarkingAll] = useState(false)

  const wrapperRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications?limit=8', {
        cache: 'no-store',
      })
      if (!res.ok) return

      const data = await res.json()
      setNotifications(data.notifications ?? [])
      setUnreadCount(data.unreadCount ?? 0)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial fetch + polling
  useEffect(() => {
    fetchNotifications()

    const poll = () => {
      if (document.visibilityState === 'visible') fetchNotifications()
    }

    const interval = setInterval(poll, POLL_INTERVAL_MS)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchNotifications()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchNotifications])

  // Refetch on open
  useEffect(() => {
    if (isOpen) fetchNotifications()
  }, [isOpen, fetchNotifications])

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return

    const handler = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    const keyHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', keyHandler)

    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', keyHandler)
    }
  }, [isOpen])

  const handleMarkRead = useCallback(async (id: number) => {
    // Optimistic
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))

    const result = await markNotificationAsRead(id)
    if (!result.success) {
      // Revert on failure
      fetchNotifications()
    }
  }, [fetchNotifications])

  const handleMarkAll = useCallback(async () => {
    setIsMarkingAll(true)

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnreadCount(0)

    const result = await markAllNotificationsAsRead()
    setIsMarkingAll(false)

    if (!result.success) {
      fetchNotifications()
    }
  }, [fetchNotifications])

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={
          unreadCount > 0
            ? `Njoftime (${unreadCount} të palexuara)`
            : 'Njoftime'
        }
        className={`relative flex h-10 w-10 items-center justify-center rounded-full transition ${
          isOpen
            ? 'bg-[#6b4c3b] text-white'
            : 'text-foreground/70 hover:bg-primary/10'
        }`}
      >
        <Bell className="h-5 w-5 cursor-pointer" />

        {unreadCount > 0 && (
          <span
            className={`absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none ${
              isOpen
                ? 'bg-white text-[#6b4c3b]'
                : 'bg-red-500 text-white'
            }`}
            style={{ height: 18 }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-14 z-50 w-[360px] overflow-hidden rounded-2xl border border-[#E8DDD2] bg-white shadow-xl sm:w-[400px]">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 border-b border-[#EEE5DC] px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-base text-[#171310]">
                Njoftimet
              </h3>
              {unreadCount > 0 && (
                <span className="rounded-full bg-[#F3E9E0] px-2 py-0.5 text-[10px] font-semibold text-[#6B4C3B]">
                  {unreadCount} të reja
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                disabled={isMarkingAll}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#6B4C3B] transition hover:underline disabled:opacity-50"
              >
                {isMarkingAll ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Check className="h-3 w-3" />
                )}
                Shëno të gjitha
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-[#6B4C3B]" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Bell className="h-7 w-7 text-[#6B4C3B]/40" />
                <p className="mt-3 text-sm font-medium text-[#171310]">
                  Nuk ka njoftime
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Do të shfaqen këtu kur të kesh aktivitet.
                </p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {notifications.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    variant="dropdown"
                    onMarkRead={handleMarkRead}
                    onNavigate={() => setIsOpen(false)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-[#EEE5DC] p-2">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-center text-sm font-medium text-[#6B4C3B] transition hover:bg-[#F7F3EE]"
            >
              Shiko të gjitha njoftimet
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}