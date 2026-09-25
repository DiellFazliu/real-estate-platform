import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'

export default async function AgentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // Not logged in
  if (!session?.user) {
    redirect('/login?callbackUrl=/agent')
  }

  // Only agents can access /agent/*
  if (session.user.role !== 'AGENT') {
    redirect('/')
  }

  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}