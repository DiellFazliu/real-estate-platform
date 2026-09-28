import { CalendarDays, Heart } from 'lucide-react'

interface AgentPropertyStatsProps {
    favoritesCount: number
    appointmentsCount: number
    futureAppointmentsCount: number
    pastAppointmentsCount: number
}

export function AgentPropertyStats({
  favoritesCount,
  appointmentsCount,
  futureAppointmentsCount,
  pastAppointmentsCount,
}: AgentPropertyStatsProps) {
  return (
    <section className="rounded-2xl border border-[#6B4C3B]/10 bg-white p-6">
      <h2 className="mb-5 text-lg font-bold text-black">
        Statistikat e pronës
      </h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl bg-[#F7F3EE] p-4">
          <div className="mb-2 flex items-center gap-2 text-[#6B4C3B]">
            <Heart size={18} />
            <span className="text-sm">
              Të preferuara
            </span>
          </div>

          <p className="text-2xl font-bold text-black">
            {favoritesCount}
          </p>
        </div>

        <div className="rounded-xl bg-[#F7F3EE] p-4">
          <div className="mb-2 flex items-center gap-2 text-[#6B4C3B]">
            <CalendarDays size={18} />
            <span className="text-sm">
              Takime të ardhshme
            </span>
          </div>

          <p className="text-2xl font-bold text-black">
            {futureAppointmentsCount}
          </p>
        </div>

        <div className="rounded-xl bg-[#F7F3EE] p-4">
          <div className="mb-2 flex items-center gap-2 text-[#6B4C3B]">
            <CalendarDays size={18} />
            <span className="text-sm">
              Takime të kaluara
            </span>
          </div>

          <p className="text-2xl font-bold text-black">
            {pastAppointmentsCount}
          </p>
        </div>
      </div>
    </section>
  )
}