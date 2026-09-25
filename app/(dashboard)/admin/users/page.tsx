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

  const [users, roles] = await Promise.all([
    prisma.user.findMany({
      where: query
        ? {
            OR: [
              { email: { contains: query, mode: 'insensitive' } },
              { name: { contains: query, mode: 'insensitive' } },
            ],
          }
        : undefined,
      include: { role: { select: { id: true, name: true } } },
      orderBy: { created_at: 'desc' },
      take: 100,
    }),
    prisma.role.findMany({
      select: { id: true, name: true },
      orderBy: { level: 'asc' },
    }),
  ])

  return (
    <div className="p-8 lg:p-10">
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-[#6B4C3B]">
          Përdoruesit
        </p>
        <h1 className="font-serif text-4xl text-[#171310]">Përdoruesit</h1>
        <p className="mt-2 text-sm text-gray-500">
          Menaxho statusin dhe rolet e llogarive.
        </p>
      </div>

      {/* Search */}
      <form className="mb-6" method="get">
        <div className="flex gap-2 rounded-2xl bg-white p-2 shadow-sm">
          <input
            name="q"
            defaultValue={query}
            placeholder="Kërko emër ose email"
            className="min-w-0 flex-1 rounded-xl border-0 bg-transparent px-4 py-2 text-[#171310] outline-none placeholder:text-gray-400"
          />
          <button className="rounded-xl bg-[#6B4C3B] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#4A3328]">
            Kërko
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-[#EEE5DC]">
            <tr>
              <th className="px-6 py-4 text-xs font-medium uppercase tracking-widest text-[#8B6B5A]">
                Përdoruesi
              </th>
              <th className="px-6 py-4 text-xs font-medium uppercase tracking-widest text-[#8B6B5A]">
                Roli
              </th>
              <th className="px-6 py-4 text-xs font-medium uppercase tracking-widest text-[#8B6B5A]">
                Statusi
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-widest text-[#8B6B5A]">
                Qasja
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEE5DC]">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4">
                  <p className="font-medium text-[#171310]">
                    {user.name || 'Pa emër'}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">{user.email}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-[#6B4C3B]">
                    {user.role.name}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs ${
                      user.is_active ? 'text-emerald-700' : 'text-gray-400'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        user.is_active ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}
                    />
                    {user.is_active ? 'Aktiv' : 'Joaktiv'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <UserAccessForm
                    userId={user.id}
                    roleId={user.role.id}
                    isActive={user.is_active}
                    roles={roles}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="p-12 text-center text-sm text-gray-500">
            Nuk u gjet asnjë përdorues.
          </p>
        )}
      </div>
    </div>
  )
}