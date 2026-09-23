import Link from 'next/link'
import {
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  CalendarDays,
} from 'lucide-react'

const navigation = [
  { href: '/owner', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/owner/properties/pending', label: 'Review queue', icon: ClipboardCheck },
  { href: '/owner/appointments', label: 'Takimet', icon: CalendarDays },
]

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F3EE] text-black pt-28 lg:flex">
      <aside className="w-full border-b border-[#E8DDD2] bg-[#F3E9E0] shadow-sm lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-72 lg:flex-col lg:border-b-0 lg:border-r lg:shadow-none lg:pt-28">
        <div className="flex items-center justify-between px-6 py-6 lg:block">
          <Link href="/owner" className="text-2xl font-bold tracking-tight text-[#6B4C3B]">
            Villaron <span className="text-sm font-normal text-[#8B6B5A]">Operations</span>
          </Link>
          <span className="hidden text-xs uppercase tracking-[0.18em] text-[#8B6B5A] lg:mt-2 lg:block">
            Owner workspace
          </span>
        </div>

        <nav className="flex gap-2 overflow-x-auto px-4 pb-4 lg:block lg:flex-1 lg:space-y-2 lg:px-4 lg:py-8">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#6B4C3B]/75 transition hover:bg-[#E8DDD2] hover:text-[#6B4C3B]"
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden border-t border-[#E8DDD2] p-4 lg:block">
          <Link href="/" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#6B4C3B]/65 transition hover:bg-[#E8DDD2] hover:text-[#6B4C3B]">
            <LogOut className="h-5 w-5" />
            Back to website
          </Link>
        </div>
      </aside>

      <div className="min-w-0 flex-1 lg:ml-72">
        {children}
      </div>
    </div>
  )
}