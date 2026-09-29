'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Building2,
  CalendarDays,
  ClipboardCheck,
  FileSearch,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react'

type Variant = 'owner' | 'admin'

interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

interface DashboardSidebarProps {
  variant: Variant
  userName?: string | null
  userEmail?: string | null
}

const NAVIGATION: Record<Variant, NavItem[]> = {
  owner: [
    { href: '/owner', label: 'Paneli', icon: LayoutDashboard },
    {
      href: '/owner/properties/pending',
      label: 'Radha e review',
      icon: ClipboardCheck,
    },
    { href: '/owner/appointments', label: 'Takimet', icon: CalendarDays },
  ],
  admin: [
    { href: '/admin', label: 'Paneli', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Përdoruesit', icon: Users },
    {
      href: '/admin/roles',
      label: 'Rolet dhe lejet',
      icon: ShieldCheck,
    },
    {
      href: '/admin/reviews',
      label: 'Review-t e pronave',
      icon: ClipboardCheck,
    },
    { href: '/admin/audit', label: 'Regjistri i auditimit', icon: FileSearch },
  ],
}

const CONFIG: Record<Variant, { subtitle: string; sectionLabel: string }> = {
  owner: {
    subtitle: 'Owner Portal',
    sectionLabel: 'Menaxhimi',
  },
  admin: {
    subtitle: 'Admin Portal',
    sectionLabel: 'Platforma',
  },
}

export function DashboardSidebar({
  variant,
  userName,
  userEmail,
}: DashboardSidebarProps) {
  const pathname = usePathname()
  const navigation = NAVIGATION[variant]
  const { subtitle, sectionLabel } = CONFIG[variant]

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 bg-black text-white">
      <div className="flex h-20 items-center border-b border-white/10 px-7">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#6B4C3B]">
            <Building2 size={21} />
          </div>

          <div>
            <div className="font-serif text-xl tracking-wide">Villaron</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/50">
              {subtitle}
            </div>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-widest text-white/40">
          {sectionLabel}
        </p>

        <nav className="space-y-1.5">
          {navigation.map((item) => {
            const Icon = item.icon
            const isExact = pathname === item.href
            const isNested =
              item.href !== `/${variant}` &&
              pathname.startsWith(`${item.href}/`)
            const isActive = isExact || isNested

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
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="mb-2 flex items-center gap-3 rounded-xl p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F3E9E0] text-sm font-semibold text-[#6B4C3B]">
            {userName?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {userName || 'Përdorues'}
            </p>
            <p className="truncate text-xs text-white/40">{userEmail}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/50 transition hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={18} />
          Dil
        </button>
      </div>
    </aside>
  )
}