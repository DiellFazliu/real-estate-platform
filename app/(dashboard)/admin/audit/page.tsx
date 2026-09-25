import { redirect } from 'next/navigation'
import { FileSearch } from 'lucide-react'

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
    <div className="p-8 lg:p-10">
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-[#6B4C3B]">
          Siguria
        </p>
        <h1 className="font-serif text-4xl text-[#171310]">Audit log</h1>
        <p className="mt-2 text-sm text-gray-500">
          Gjurmo veprimet sensitive në platformë.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-[#EEE5DC]">
            <tr>
              <th className="px-6 py-4 text-xs font-medium uppercase tracking-widest text-[#8B6B5A]">
                Koha
              </th>
              <th className="px-6 py-4 text-xs font-medium uppercase tracking-widest text-[#8B6B5A]">
                Aktori
              </th>
              <th className="px-6 py-4 text-xs font-medium uppercase tracking-widest text-[#8B6B5A]">
                Veprimi
              </th>
              <th className="px-6 py-4 text-xs font-medium uppercase tracking-widest text-[#8B6B5A]">
                Burimi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEE5DC]">
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td className="px-6 py-4 text-xs text-gray-500">
                  {entry.created_at.toLocaleString('sq-AL')}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-[#171310]">
                  {entry.user?.name || entry.user?.email || 'Sistemi'}
                </td>
                <td className="px-6 py-4 text-sm text-[#6B4C3B]">
                  {entry.action}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {entry.resource}
                  {entry.resource_id ? ` #${entry.resource_id}` : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {entries.length === 0 && (
          <div className="p-12 text-center">
            <FileSearch className="mx-auto h-7 w-7 text-[#6B4C3B]/40" />
            <p className="mt-3 text-sm text-gray-500">
              Nuk ka regjistrime.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}