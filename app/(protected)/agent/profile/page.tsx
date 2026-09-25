import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { getAgentById } from '@/lib/db/queries/agent'
import { updateAgentProfile } from './actions'

export default async function AgentProfilePage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const agent = await getAgentById(Number(session.user.id))

  if (!agent) {
    redirect('/')
  }

  return (
    <div className="p-8 lg:p-10">
      {/* Header */}
      <div className="mb-8">
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-[#6B4C3B]">
          Llogaria
        </p>

        <h1 className="font-serif text-4xl text-[#171310]">
          Profili
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Menaxho informacionet e profilit tënd si agjent.
        </p>
      </div>

      <div className="max-w-4xl">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          {/* Profile header */}
          <div className="bg-black px-8 py-10">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F3E9E0] text-2xl font-semibold text-[#6B4C3B]">
                {agent.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>

              <div>
                <h2 className="font-serif text-2xl text-white">
                  {agent.name || 'Agent'}
                </h2>

                <p className="mt-1 text-sm text-white/50">
                  {agent.email}
                </p>

                <span className="mt-3 inline-block rounded-full bg-[#6B4C3B] px-3 py-1 text-xs font-medium text-white">
                  Agent
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form action={updateAgentProfile} className="p-8">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Emri i plotë
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  defaultValue={agent.name || ''}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-[#F7F3EE] px-4 py-3 text-sm outline-none transition focus:border-[#6B4C3B] focus:ring-2 focus:ring-[#6B4C3B]/10"
                  placeholder="Emri dhe mbiemri"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={agent.email}
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500"
                />

                <p className="mt-1.5 text-xs text-gray-400">
                  Email-i nuk mund të ndryshohet këtu.
                </p>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Telefoni
                </label>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={agent.phone || ''}
                  className="w-full rounded-xl border border-gray-200 bg-[#F7F3EE] px-4 py-3 text-sm outline-none transition focus:border-[#6B4C3B] focus:ring-2 focus:ring-[#6B4C3B]/10"
                  placeholder="+383 44 123 456"
                />
              </div>

              {/* Status */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Statusi
                </label>

                <div className="flex h-[46px] items-center rounded-xl border border-gray-200 bg-gray-50 px-4">
                  <span className="mr-2 h-2.5 w-2.5 rounded-full bg-green-500" />

                  <span className="text-sm text-gray-600">
                    Aktiv
                  </span>
                </div>
              </div>

              {/* Bio */}
              <div className="md:col-span-2">
                <label
                  htmlFor="bio"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Biografia
                </label>

                <textarea
                  id="bio"
                  name="bio"
                  rows={5}
                  defaultValue={agent.bio || ''}
                  className="w-full resize-none rounded-xl border border-gray-200 bg-[#F7F3EE] px-4 py-3 text-sm outline-none transition focus:border-[#6B4C3B] focus:ring-2 focus:ring-[#6B4C3B]/10"
                  placeholder="Shkruaj disa fjalë rreth vetes..."
                />
              </div>
            </div>

            {/* Save */}
            <div className="mt-8 flex justify-end border-t border-gray-100 pt-6">
              <button
                type="submit"
                className="rounded-xl bg-[#6B4C3B] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#573c2f]"
              >
                Ruaj ndryshimet
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}