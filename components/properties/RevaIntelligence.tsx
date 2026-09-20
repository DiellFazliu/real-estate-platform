import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Sparkles,
  MapPin,
  BarChart3,
} from 'lucide-react'
import Link from 'next/link'

interface RevaIntelligenceProps {
  intelligence: any
  comparables: any[]
}

export function RevaIntelligence({
  intelligence,
  comparables,
}: RevaIntelligenceProps) {
  if (!intelligence) return null

  const position = intelligence.market_position
  const diff = intelligence.price_difference_pct

  const TrendIcon =
    position === 'BELOW'
      ? TrendingDown
      : position === 'ABOVE'
      ? TrendingUp
      : Minus

  const positionColor =
    position === 'BELOW'
      ? 'text-green-400'
      : position === 'ABOVE'
      ? 'text-red-400'
      : 'text-yellow-400'

  const positionLabel =
    position === 'BELOW'
      ? 'Nën çmimet e ngjashme'
      : position === 'ABOVE'
      ? 'Mbi çmimet e ngjashme'
      : 'Në nivelin e çmimeve të ngjashme'

  const warnings = Array.isArray(intelligence.warnings)
    ? intelligence.warnings
    : []

  const locationInsights = intelligence.location_insights || {}

  return (
    <section className="space-y-5">
      {/* ═══════════════════════════════════════════════════════ */}
      {/* HEADER + MARKET POSITION                                */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="bg-gradient-to-br from-[#6B4C3B] to-[#4A342A] rounded-2xl p-6 md:p-8 text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">
              Reva Intelligence
            </h2>
            <p className="text-white/60 text-sm">
              Analizë automatike e pronës
            </p>
          </div>
        </div>

        {/* Market Position */}
        <div className="mb-6">
          <p className="text-white/60 text-sm mb-2">Pozicioni në treg</p>
          <div className="flex items-center gap-3">
            <TrendIcon size={28} className={positionColor} />
            <p className="text-2xl font-bold">{positionLabel}</p>
          </div>
        </div>

        {/* Price Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-white/50 text-xs mb-1">Çmimi / m²</p>
            <p className="text-xl font-bold">
              €{intelligence.price_per_m2?.toLocaleString() || '-'}
            </p>
          </div>
          {intelligence.comparable_average && (
            <div>
              <p className="text-white/50 text-xs mb-1">Mesatarja lokale</p>
              <p className="text-xl font-bold">
                €{intelligence.comparable_average.toLocaleString()}
              </p>
            </div>
          )}
          {diff !== null && diff !== undefined && (
            <div>
              <p className="text-white/50 text-xs mb-1">Diferenca</p>
              <p className={`text-xl font-bold ${positionColor}`}>
                {diff > 0 ? '+' : ''}
                {diff}%
              </p>
            </div>
          )}
          {intelligence.percentile !== null &&
            intelligence.percentile !== undefined && (
              <div>
                <p className="text-white/50 text-xs mb-1">Percentile</p>
                <p className="text-xl font-bold">
                  {Math.round(intelligence.percentile)}%
                </p>
              </div>
            )}
        </div>

        {/* Trend */}
        {(intelligence.trend_pct_12m !== null ||
          intelligence.trend_pct_5y !== null) && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 size={20} />
                <span className="text-sm text-white/60">
                  Trendi i tregut
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                {intelligence.trend_pct_12m !== null && (
                  <span className="flex items-center gap-1">
                    <span className="text-white/50">12m:</span>
                    <span
                      className={
                        intelligence.trend_pct_12m > 0
                          ? 'text-green-400 font-bold'
                          : 'text-red-400 font-bold'
                      }
                    >
                      {intelligence.trend_pct_12m > 0 ? '+' : ''}
                      {intelligence.trend_pct_12m}%
                    </span>
                  </span>
                )}
                {intelligence.trend_pct_5y !== null && (
                  <span className="flex items-center gap-1">
                    <span className="text-white/50">5v:</span>
                    <span
                      className={
                        intelligence.trend_pct_5y > 0
                          ? 'text-green-400 font-bold'
                          : 'text-red-400 font-bold'
                      }
                    >
                      {intelligence.trend_pct_5y > 0 ? '+' : ''}
                      {intelligence.trend_pct_5y}%
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* AI SUMMARY                                              */}
      {/* ═══════════════════════════════════════════════════════ */}
      {intelligence.ai_summary && (
        <div className="bg-white rounded-2xl border border-[#6B4C3B]/10 p-6 md:p-8">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <Sparkles size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-black mb-2">Analizë AI</h3>
              <p className="text-black/70 leading-relaxed">
                {intelligence.ai_summary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* LOCATION                                                */}
      {/* ═══════════════════════════════════════════════════════ */}
      {locationInsights.nearby_amenities?.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#6B4C3B]/10 p-6 md:p-8">
          <h3 className="font-bold text-black mb-4 flex items-center gap-2">
            <MapPin size={18} className="text-[#6B4C3B]" />
            Lokacioni
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {locationInsights.nearby_amenities.map(
              (amenity: any, i: number) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-[#F7F3EE] text-center"
                >
                  <div className="text-2xl mb-1">{amenity.icon}</div>
                  <p className="text-xs text-black/60">{amenity.type}</p>
                  <p className="text-sm font-bold text-black">
                    {amenity.estimated_distance}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* WARNINGS                                                */}
      {/* ═══════════════════════════════════════════════════════ */}
      {warnings.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#6B4C3B]/10 p-6 md:p-8">
          <h3 className="font-bold text-black mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-orange-500" />
            Për të verifikuar
          </h3>
          <ul className="space-y-2">
            {warnings.map((w: any, i: number) => (
              <li
                key={i}
                className={`flex items-start gap-3 p-3 rounded-lg text-sm ${
                  w.severity === 'WARNING'
                    ? 'bg-orange-50 text-orange-800'
                    : w.severity === 'DANGER'
                    ? 'bg-red-50 text-red-800'
                    : 'bg-gray-50 text-gray-700'
                }`}
              >
                <span className="text-lg shrink-0">{w.icon || '•'}</span>
                <span>{w.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* COMPARABLE PROPERTIES                                   */}
      {/* ═══════════════════════════════════════════════════════ */}
      {comparables.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#6B4C3B]/10 p-6 md:p-8">
          <h3 className="font-bold text-black mb-4">
            Prona të ngjashme ({comparables.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {comparables.slice(0, 3).map((c) => (
              <Link
                key={c.id}
                href={`/properties/${c.slug}`}
                className="group p-4 rounded-xl bg-[#F7F3EE] hover:bg-[#F3E9E0] transition"
              >
                <p className="font-semibold text-black text-sm mb-1 line-clamp-1">
                  {c.title}
                </p>
                <p className="text-xs text-black/50 mb-2">
                  📍 {c.neighborhood}
                </p>
                <p className="text-lg font-bold text-[#6B4C3B]">
                  €{c.price.toLocaleString()}
                </p>
                <p className="text-xs text-black/50">
                  €{c.price_per_m2}/m² · {c.area}m²
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}