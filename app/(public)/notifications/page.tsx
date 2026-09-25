import { redirect } from 'next/navigation'

import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { NotificationsList } from '@/components/notifications/NotificationsList'

export const dynamic = 'force-dynamic'

export default async function NotificationsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login?callbackUrl=/notifications')

  const userId = Number(session.user.id)
  if (!Number.isSafeInteger(userId) || userId <= 0) redirect('/login')

  const notifications = await prisma.notification.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
    take: 200,
    select: {
      id: true,
      type: true,
      title: true,
      message: true,
      link: true,
      is_read: true,
      created_at: true,
    },
  })

  return (
    <main className="min-h-screen bg-[#F7F3EE] px-5 pb-20 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-[#6B4C3B]">
            Llogaria
          </p>
          <h1 className="font-serif text-4xl text-[#171310]">Njoftimet</h1>
          <p className="mt-2 text-sm text-gray-500">
            Aktiviteti i fundit në llogarinë tuaj.
          </p>
        </header>

        <NotificationsList
          initialNotifications={notifications.map((n) => ({
            ...n,
            created_at: n.created_at.toISOString(),
          }))}
        />
      </div>
    </main>
  )
}