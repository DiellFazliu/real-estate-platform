import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export default async function AdminAuditPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/')

  const entries = await prisma.auditLog.findMany({
    include: { user: { select: { name: true, email: true } } },
    orderBy: { created_at: 'desc' },
    take: 100,
  })

  return (
    <main className="min-h-screen bg-[#F7F3EE]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="border-b border-[#E8DDD2] pb-8"><h1 className="text-3xl font-bold text-black">Audit log</h1><p className="mt-2 text-[#6B4C3B]/65">Track sensitive actions across the platform.</p></header>
        <section className="mt-6 overflow-x-auto rounded-xl border border-[#E8DDD2] bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-[#E8DDD2] bg-[#F3E9E0] text-[#6B4C3B]"><tr><th className="px-5 py-4">Time</th><th className="px-5 py-4">Actor</th><th className="px-5 py-4">Action</th><th className="px-5 py-4">Resource</th></tr></thead><tbody className="divide-y divide-[#EEE5DC]">{entries.map((entry) => <tr key={entry.id}><td className="px-5 py-4 text-[#6B4C3B]/65">{entry.created_at.toLocaleString('en-GB')}</td><td className="px-5 py-4 font-medium text-black">{entry.user?.name || entry.user?.email || 'System'}</td><td className="px-5 py-4 text-[#6B4C3B]">{entry.action}</td><td className="px-5 py-4 text-[#6B4C3B]/70">{entry.resource}{entry.resource_id ? ` #${entry.resource_id}` : ''}</td></tr>)}</tbody></table>
          {entries.length === 0 && <p className="p-8 text-center text-[#6B4C3B]/60">No audit entries yet.</p>}
        </section>
      </div>
    </main>
  )
}
