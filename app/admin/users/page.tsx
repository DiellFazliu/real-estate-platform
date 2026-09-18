import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { UserAccessForm } from '@/components/admin/UserAccessForm'

type PageProps = { searchParams: Promise<{ q?: string }> }

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user) redirect('/login')
  if (session.user.role !== 'ADMIN') redirect('/')

  const query = (await searchParams).q?.trim() || ''
  const users = await prisma.user.findMany({
    where: query ? { OR: [{ email: { contains: query, mode: 'insensitive' } }, { name: { contains: query, mode: 'insensitive' } }] } : undefined,
    include: { role: { select: { id: true, name: true } } },
    orderBy: { created_at: 'desc' },
    take: 100,
  })
  const roles = await prisma.role.findMany({ select: { id: true, name: true }, orderBy: { level: 'asc' } })

  return (
    <main className="min-h-screen bg-[#F7F3EE]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="border-b border-[#E8DDD2] pb-8">
          <h1 className="text-3xl font-bold text-black">Users</h1>
          <p className="mt-2 text-[#6B4C3B]/65">Manage account status and role access.</p>
        </header>
        <form className="mt-6 flex gap-2" method="get">
          <input name="q" defaultValue={query} placeholder="Search name or email" className="flex-1 rounded-lg border border-[#D8C4B3] bg-white px-3 py-2 text-black" />
          <button className="rounded-lg bg-[#6B4C3B] px-4 py-2 font-semibold text-white">Search</button>
        </form>
        <section className="mt-6 overflow-x-auto rounded-xl border border-[#E8DDD2] bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-[#E8DDD2] bg-[#F3E9E0] text-[#6B4C3B]"><tr><th className="px-5 py-4">User</th><th className="px-5 py-4">Role</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Access</th></tr></thead>
            <tbody className="divide-y divide-[#EEE5DC]">
              {users.map((user) => <tr key={user.id}>
                <td className="px-5 py-4"><p className="font-semibold text-black">{user.name || 'Unnamed user'}</p><p className="text-[#6B4C3B]/60">{user.email}</p></td>
                <td className="px-5 py-4 font-medium text-[#6B4C3B]">{user.role.name}</td>
                <td className="px-5 py-4"><span className={user.is_active ? 'text-emerald-700' : 'text-red-700'}>{user.is_active ? 'Active' : 'Inactive'}</span></td>
                <td className="px-5 py-4"><UserAccessForm userId={user.id} roleId={user.role.id} isActive={user.is_active} roles={roles} /></td>
              </tr>)}
            </tbody>
          </table>
          {users.length === 0 && <p className="p-8 text-center text-[#6B4C3B]/60">No users found.</p>}
        </section>
      </div>
    </main>
  )
}
