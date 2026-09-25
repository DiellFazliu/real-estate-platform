import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth/auth'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'

export default async function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login?callbackUrl=/owner')
  }

  const isAdmin = session.user.role === 'ADMIN'
  const isOwner = session.user.role === 'OWNER'
  const hasReviewPermission =
    session.user.permissions?.includes('properties:review') ?? false

  if (!isAdmin && !(isOwner && hasReviewPermission)) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-[#F7F3EE]">
      <DashboardSidebar
        variant="owner"
        userName={session.user.name}
        userEmail={session.user.email}
      />

      <main className="ml-72 min-h-screen">{children}</main>
    </div>
  )
}