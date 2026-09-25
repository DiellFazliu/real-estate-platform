import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth/auth'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login?callbackUrl=/admin')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-[#F7F3EE]">
      <DashboardSidebar
        variant="admin"
        userName={session.user.name}
        userEmail={session.user.email}
      />

      <main className="ml-72 min-h-screen">{children}</main>
    </div>
  )
}