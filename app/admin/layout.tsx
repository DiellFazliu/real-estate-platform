import Link from 'next/link'
import { ClipboardCheck, FileSearch, LayoutDashboard, LogOut, ShieldCheck, Users } from 'lucide-react'

const navigation = [
  { href: '/admin', label: 'Admin dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/roles', label: 'Roles and permissions', icon: ShieldCheck },
  { href: '/admin/audit', label: 'Audit log', icon: FileSearch },
  { href: '/admin/reviews', label: 'Property review', icon: ClipboardCheck },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mt-20 min-h-screen bg-[#F7F3EE] text-black lg:flex">
      <aside className="w-full border-b border-[#E8DDD2] bg-[#F3E9E0] shadow-sm lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-72 lg:flex-col lg:border-b-0 lg:border-r lg:shadow-none">
        <div className="px-6 py-6">
          <Link href="/admin" className="flex items-center gap-2 text-2xl font-bold text-[#6B4C3B]">
            <ShieldCheck className="h-6 w-6" />
            Villaron
          </Link>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#8B6B5A]">Admin workspace</p>
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

      <div className="min-w-0 flex-1 lg:ml-72">{children}</div>
    </div>
  )
}
