import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export default async function AdminRolesPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/')

  const roles = await prisma.role.findMany({
    include: { _count: { select: { users: true, permissions: true } } },
    orderBy: { level: 'asc' },
  })

  return (
    <main className="min-h-screen bg-[#F7F3EE]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="border-b border-[#E8DDD2] pb-8">
          <h1 className="text-3xl font-bold text-black">Roles and permissions</h1>
          <p className="mt-2 text-[#6B4C3B]/65">Review the access model used by the platform.</p>
        </header>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {roles.map((role) => <article key={role.id} className="rounded-xl border border-[#E8DDD2] bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between"><div><h2 className="text-xl font-bold text-black">{role.name}</h2><p className="mt-1 text-sm text-[#6B4C3B]/60">Level {role.level}</p></div><span className="rounded-full bg-[#F3E9E0] px-3 py-1 text-xs font-medium text-[#6B4C3B]">{role.is_system ? 'System role' : 'Custom role'}</span></div>
            <p className="mt-4 text-sm text-[#6B4C3B]/75">{role.description || 'No description.'}</p>
            <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-[#EEE5DC] pt-4 text-sm"><div><dt className="text-[#6B4C3B]/55">Users</dt><dd className="mt-1 font-bold text-black">{role._count.users}</dd></div><div><dt className="text-[#6B4C3B]/55">Permissions</dt><dd className="mt-1 font-bold text-black">{role._count.permissions}</dd></div></dl>
          </article>)}
        </div>
      </div>
    </main>
  )
}
