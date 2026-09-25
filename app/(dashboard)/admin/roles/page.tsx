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
    <div className="p-8 lg:p-10">
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-[#6B4C3B]">
          Siguria
        </p>
        <h1 className="font-serif text-4xl text-[#171310]">
          Rolet dhe lejet
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Modeli i qasjes së platformës.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {roles.map((role) => (
          <article
            key={role.id}
            className="rounded-2xl bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif text-xl text-[#171310]">
                  {role.name}
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Nivel {role.level}
                </p>
              </div>
              <span className="rounded-full bg-[#F3E9E0] px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-[#6B4C3B]">
                {role.is_system ? 'Sistem' : 'I personalizuar'}
              </span>
            </div>

            <p className="mt-4 text-sm text-gray-600">
              {role.description || 'Pa përshkrim.'}
            </p>

            <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-[#EEE5DC] pt-4 text-sm">
              <div>
                <dt className="text-xs text-gray-500">Përdorues</dt>
                <dd className="mt-1 font-serif text-lg text-[#171310]">
                  {role._count.users}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500">Leje</dt>
                <dd className="mt-1 font-serif text-lg text-[#171310]">
                  {role._count.permissions}
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </div>
  )
}