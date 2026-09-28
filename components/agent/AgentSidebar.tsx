'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
 import {
   Building2,
   CalendarDays,
   Heart,
   Home,
   LogOut,
  MessageSquare,
   User,
   ChevronLeft,
 } from 'lucide-react'
import { signOut } from 'next-auth/react'

interface AgentSidebarProps {
  agentName?: string | null
  agentEmail?: string | null
  unreadCount?: number

}

 const navigation = [
   {
     name: 'Pronat e mia',
     href: '/agent/my-properties',
     icon: Home,
   },
   {
     name: 'Takimet',
     href: '/agent/appointments',
     icon: CalendarDays,
   },
  {
    name: 'Bisedat',
    href: '/agent/conversations',
    icon: MessageSquare,
  },
   {
     name: 'Profili',
     href: '/agent/profile',
     icon: User,
   },
 ]

export default function AgentSidebar({
  agentName,
  agentEmail,
  unreadCount = 0,

}: AgentSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 bg-black text-white">
      {/* Logo */}
      <div className="flex h-20 items-center border-b border-white/10 px-7">
        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6B4C3B]">
            <Building2 size={21} />
          </div>

          <div>
            <div className="font-serif text-xl tracking-wide">
              Villaron
            </div>

            <div className="text-[10px] uppercase tracking-[0.2em] text-white/50">
              Agent Portal
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-8">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-white/40">
          Menaxhimi
        </p>

        <nav className="space-y-1.5">
          {navigation.map((item) => {
            const Icon = item.icon

            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`)

              const showBadge = item.href === '/agent/conversations' && unreadCount > 0

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-[#6B4C3B] text-white'
                    : 'text-white/65 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon
                  size={19}
                  className={
                    isActive
                      ? 'text-white'
                      : 'text-white/50 group-hover:text-white'
                  }
                />

                <span>{item.name}</span>
                {showBadge && (
  <span className="ml-auto rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
    {unreadCount > 99 ? '99+' : unreadCount}
  </span>
)}
              </Link>
            )
          })}
        </nav>

        <div className="my-8 h-px bg-white/10" />

      </div>

      {/* Agent */}
      <div className="border-t border-white/10 p-4">
        <Link
          href="/agent/profile"
          className="mb-2 flex items-center gap-3 rounded-xl p-3 transition hover:bg-white/5"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F3E9E0] text-sm font-semibold text-[#6B4C3B]">
            {agentName?.charAt(0)?.toUpperCase() || 'A'}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {agentName || 'Agent'}
            </p>

            <p className="truncate text-xs text-white/40">
              {agentEmail}
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/50 transition hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={18} />
          Dil
        </button>
      </div>
    </aside>
  )
}