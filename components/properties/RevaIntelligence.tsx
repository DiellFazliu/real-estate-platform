import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  MapPin,
  Building2,
} from 'lucide-react'
import Link from 'next/link'
import { PropertyImage } from '@/components/properties/PropertyImage'

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface RevaIntelligenceProps {
  intelligence: any
  comparables: any[]
}

// ═══════════════════════════════════════════════════════════════
// HELPER: KONVERTO TË DHËNAT NË FJALI TË THJESHTA
// ═══════════════════════════════════════════════════════════════

function describeIntelligence(intelligence: any) {
  const position = intelligence.market_position
  const diff = intelligence.price_difference_pct
  const percentile = intelligence.percentile
  const pricePerM2 = intelligence.price_per_m2
  const comparableAvg = intelligence.comparable_average
  const area = intelligence.area

  // ─── Pozicioni ─────────────────────────────────────────────
  let positionTitle = 'Çmim në nivelin e tregut'
  let positionSubtitle =
    'Kjo pronë ka çmim të ngjashëm me pronat e tjera në këtë zonë.'
  let positionTone: 'good' | 'bad' | 'neutral' = 'neutral'

  if (position === 'BELOW' && diff !== null) {
    const savings =
      comparableAvg && area && pricePerM2
        ? Math.round((comparableAvg - pricePerM2) * area)
        : null

    positionTitle = 'Çmim i favorshëm për blerësin'
    positionSubtitle = savings
      ? `Kjo pronë kushton rreth ${savings.toLocaleString('sq-AL')} € më pak se prona të ngjashme në këtë zonë.`
      : `Rreth ${Math.abs(diff).toFixed(1)}% nën çmimin mesatar të zonës.`
    positionTone = 'good'
  } else if (position === 'ABOVE' && diff !== null) {
    const extra =
      comparableAvg && area && pricePerM2
        ? Math.round((pricePerM2 - comparableAvg) * area)
        : null

    positionTitle = 'Çmim mbi mesataren e zonës'
    positionSubtitle = extra
      ? `Kjo pronë kushton rreth ${extra.toLocaleString('sq-AL')} € më shumë se prona të ngjashme. Mund të justifikohet nga gjendja, lokacioni ose veçoritë.`
      : `Rreth ${Math.abs(diff).toFixed(1)}% mbi çmimin mesatar të zonës.`
    positionTone = 'bad'
  }

  // ─── Percentile ────────────────────────────────────────────
  let percentileText: string | null = null
  if (percentile !== null && percentile !== undefined) {
    const r = Math.round(percentile)
    if (r <= 25) {
      percentileText = `Kjo pronë është më e lirë se ${100 - r}% e pronave të ngjashme.`
    } else if (r >= 75) {
      percentileText = `Kjo pronë është më e shtrenjtë se ${r}% e pronave të ngjashme.`
    } else {
      percentileText = `Rreth ${r}% e pronave të ngjashme janë më të lira, ${100 - r}% më të shtrenjta.`
    }
  }

  return {
    positionTitle,
    positionSubtitle,
    positionTone,
    percentileText,
  }
}

// ═══════════════════════════════════════════════════════════════
// KOMPONENTI KRYESOR
// ═══════════════════════════════════════════════════════════════

export function RevaIntelligence({
  intelligence,
  comparables,
}: RevaIntelligenceProps) {
  if (!intelligence) return null

  const diff = intelligence.price_difference_pct
  const pricePerM2 = intelligence.price_per_m2
  const comparableAvg = intelligence.comparable_average

  const {
    positionTitle,
    positionSubtitle,
    positionTone,
    percentileText,
  } = describeIntelligence(intelligence)

  const positionColor = {
    good: 'text-green-400',
    bad: 'text-red-400',
    neutral: 'text-yellow-400',
  }[positionTone]

  const PositionIcon = {
    good: TrendingDown,
    bad: TrendingUp,
    neutral: Minus,
  }[positionTone]

  const locationInsights = intelligence.location_insights || {}

  return (
    <section className="space-y-5">
      {/* ═══ HEADER + MARKET POSITION ═══ */}
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

        {/* Pozicioni */}
        <div className="mb-6">
          <p className="text-white/60 text-sm mb-2">Pozicioni në treg</p>
          <div className="flex items-center gap-3 mb-3">
            <PositionIcon size={28} className={positionColor} />
            <p className="text-2xl font-bold">{positionTitle}</p>
          </div>
          <p className="text-sm text-white/70 leading-relaxed">
            {positionSubtitle}
          </p>
        </div>

        {/* Metrikat */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-white/50 text-xs mb-1">Çmimi / m²</p>
            <p className="text-xl font-bold">
              €{pricePerM2?.toLocaleString('sq-AL') ?? '-'}
            </p>
          </div>
          {comparableAvg && (
            <div>
              <p className="text-white/50 text-xs mb-1">Mesatarja lokale</p>
              <p className="text-xl font-bold">
                €{comparableAvg.toLocaleString('sq-AL')}
              </p>
            </div>
          )}
          {diff !== null && diff !== undefined && (
            <div>
              <p className="text-white/50 text-xs mb-1">Diferenca</p>
              <p className={`text-xl font-bold ${positionColor}`}>
                {diff > 0 ? '+' : ''}
                {diff.toFixed(1)}%
              </p>
            </div>
          )}
          {intelligence.percentile !== null &&
            intelligence.percentile !== undefined && (
              <div>
                <p className="text-white/50 text-xs mb-1">Krahasim</p>
                <p className="text-xl font-bold">
                  {Math.round(intelligence.percentile)}%
                </p>
              </div>
            )}
        </div>

        {/* Percentile si fjali */}
        {percentileText && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-start gap-3">
              <Building2 size={18} className="text-white/60 shrink-0 mt-0.5" />
              <p className="text-sm text-white/70 leading-relaxed">
                {percentileText}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ═══ LOKACIONI ═══ */}
      {locationInsights.nearby_amenities?.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#6B4C3B]/10 p-6 md:p-8">
          <h3 className="font-bold text-black mb-4 flex items-center gap-2">
            <MapPin size={18} className="text-[#6B4C3B]" />
            Lokacioni
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {locationInsights.nearby_amenities.map(
              (amenity: any, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-[#F7F3EE] text-center">
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

      {/* ═══ COMPARABLES ═══ */}
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
                className="group rounded-xl bg-[#F7F3EE] hover:bg-[#F3E9E0] transition overflow-hidden border border-[#6B4C3B]/5 hover:border-[#6B4C3B]/20"
              >
                <div className="relative h-40 overflow-hidden bg-[#F3E9E0]">
                  <PropertyImage
                    src={c.image || c.primary_image_url || ''}
                    alt={c.title}
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full text-white ${
                        c.listing_type === 'rent'
                          ? 'bg-blue-500'
                          : 'bg-green-500'
                      }`}
                    >
                      {c.listing_type === 'rent' ? 'Me Qira' : 'Në Shitje'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-semibold text-black text-sm mb-1 line-clamp-1">
                    {c.title}
                  </p>
                  <p className="text-xs text-black/50 mb-2">
                    📍 {c.neighborhood}
                  </p>
                  <p className="text-lg font-bold text-[#6B4C3B]">
                    €{c.price.toLocaleString('sq-AL')}
                  </p>
                  <p className="text-xs text-black/50">
                    €{c.price_per_m2}/m² · {c.area} m²
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}