import { prisma } from '@/lib/db/prisma'

// ═══════════════════════════════════════════════════════════════
// 38 KOMUNAT E KOSOVËS
// ═══════════════════════════════════════════════════════════════

export const MUNICIPALITIES = [
  { id: 1, name: 'Deçan', slug: 'decan' },
  { id: 2, name: 'Gjakovë', slug: 'gjakove' },
  { id: 3, name: 'Gllogoc', slug: 'gllogoc' },
  { id: 4, name: 'Gjilan', slug: 'gjilan' },
  { id: 5, name: 'Dragash', slug: 'dragash' },
  { id: 6, name: 'Istog', slug: 'istog' },
  { id: 7, name: 'Kaçanik', slug: 'kacanik' },
  { id: 8, name: 'Klinë', slug: 'kline' },
  { id: 9, name: 'Fushë Kosovë', slug: 'fushe-kosove' },
  { id: 10, name: 'Kamenicë', slug: 'kamenice' },
  { id: 11, name: 'Mitrovicë', slug: 'mitrovice' },
  { id: 12, name: 'Leposaviq', slug: 'leposaviq' },
  { id: 13, name: 'Lipjan', slug: 'lipjan' },
  { id: 14, name: 'Novobërdë', slug: 'novoberde' },
  { id: 15, name: 'Obiliq', slug: 'obiliq' },
  { id: 16, name: 'Rahovec', slug: 'rahovec' },
  { id: 17, name: 'Pejë', slug: 'peje' },
  { id: 18, name: 'Podujevë', slug: 'podujeve' },
  { id: 19, name: 'Prizren', slug: 'prizren' },
  { id: 20, name: 'Prishtinë', slug: 'prishtine' },
  { id: 21, name: 'Skënderaj', slug: 'skenderaj' },
  { id: 22, name: 'Shtime', slug: 'shtime' },
  { id: 23, name: 'Shtërpcë', slug: 'shterpce' },
  { id: 24, name: 'Suharekë', slug: 'suhareke' },
  { id: 25, name: 'Ferizaj', slug: 'ferizaj' },
  { id: 26, name: 'Viti', slug: 'viti' },
  { id: 27, name: 'Vushtrri', slug: 'vushtrri' },
  { id: 28, name: 'Zubin Potok', slug: 'zubin-potok' },
  { id: 29, name: 'Zveçan', slug: 'zvecan' },
  { id: 30, name: 'Malishevë', slug: 'malisheve' },
  { id: 31, name: 'Hani i Elezit', slug: 'hani-elezit' },
  { id: 32, name: 'Mamushë', slug: 'mamushe' },
  { id: 33, name: 'Junik', slug: 'junik' },
  { id: 34, name: 'Kllokot', slug: 'kllokot' },
  { id: 35, name: 'Graçanicë', slug: 'gracanice' },
  { id: 36, name: 'Ranillug', slug: 'ranillug' },
  { id: 37, name: 'Partesh', slug: 'partesh' },
  { id: 38, name: 'Mitrovica e Veriut', slug: 'mitrovica-veriut' },
] as const

export interface MunicipalityStats {
  id: number
  name: string
  slug: string
  count: number
  avgPriceM2: number
  medianPriceM2: number
  minPriceM2: number
  maxPriceM2: number
  avgPrice: number
  minPrice: number
  maxPrice: number
  avgArea: number
  avgBedrooms: number
  avgYearBuilt: number
  intensity: number
}

// Map city names → municipality (duke mbuluar të gjitha variantet)
const CITY_TO_MUNICIPALITY: Record<string, string> = {
  'Prishtina': 'Prishtinë', 'Prishtinë': 'Prishtinë', 'Prishtine': 'Prishtinë',
  'Prizren': 'Prizren', 'Prizreni': 'Prizren',
  'Peja': 'Pejë', 'Pejë': 'Pejë', 'Peje': 'Pejë',
  'Gjakova': 'Gjakovë', 'Gjakovë': 'Gjakovë', 'Gjakove': 'Gjakovë',
  'Ferizaj': 'Ferizaj', 'Ferizaji': 'Ferizaj',
  'Gjilan': 'Gjilan', 'Gjilani': 'Gjilan',
  'Mitrovica': 'Mitrovicë', 'Mitrovicë': 'Mitrovicë', 'Mitrovice': 'Mitrovicë',
  'Vushtrri': 'Vushtrri', 'Vushtrria': 'Vushtrri',
  'Podujeva': 'Podujevë', 'Podujevë': 'Podujevë', 'Podujeve': 'Podujevë',
  'Suhareka': 'Suharekë', 'Suharekë': 'Suharekë', 'Suhareke': 'Suharekë',
  'Rahovec': 'Rahovec', 'Rahoveci': 'Rahovec',
  'Kamenica': 'Kamenicë', 'Kamenicë': 'Kamenicë', 'Kamenice': 'Kamenicë',
  'Deçan': 'Deçan', 'Decan': 'Deçan', 'Deçani': 'Deçan',
  'Gllogoc': 'Gllogoc', 'Drenas': 'Gllogoc', 'Drenasi': 'Gllogoc',
  'Dragash': 'Dragash', 'Dragashi': 'Dragash',
  'Istog': 'Istog', 'Istogu': 'Istog',
  'Kaçanik': 'Kaçanik', 'Kacanik': 'Kaçanik', 'Kaçaniku': 'Kaçanik',
  'Klinë': 'Klinë', 'Kline': 'Klinë', 'Klina': 'Klinë',
  'Fushë Kosovë': 'Fushë Kosovë', 'Fushe Kosove': 'Fushë Kosovë',
  'Leposaviq': 'Leposaviq', 'Leposaviqi': 'Leposaviq',
  'Lipjan': 'Lipjan', 'Lipjani': 'Lipjan',
  'Novobërdë': 'Novobërdë', 'Novoberde': 'Novobërdë',
  'Obiliq': 'Obiliq', 'Obiliqi': 'Obiliq',
  'Skënderaj': 'Skënderaj', 'Skenderaj': 'Skënderaj',
  'Shtime': 'Shtime', 'Shtimja': 'Shtime',
  'Shtërpcë': 'Shtërpcë', 'Shterpce': 'Shtërpcë',
  'Viti': 'Viti', 'Vitia': 'Viti',
  'Zubin Potok': 'Zubin Potok',
  'Zveçan': 'Zveçan', 'Zvecan': 'Zveçan',
  'Malishevë': 'Malishevë', 'Malisheve': 'Malishevë', 'Malisheva': 'Malishevë',
  'Hani i Elezit': 'Hani i Elezit', 'Elez Han': 'Hani i Elezit',
  'Mamushë': 'Mamushë', 'Mamushe': 'Mamushë', 'Mamusha': 'Mamushë',
  'Junik': 'Junik', 'Juniku': 'Junik',
  'Kllokot': 'Kllokot',
  'Graçanicë': 'Graçanicë', 'Gracanice': 'Graçanicë',
  'Ranillug': 'Ranillug',
  'Partesh': 'Partesh',
  'Mitrovica e Veriut': 'Mitrovica e Veriut', 'Mitrovica Veriore': 'Mitrovica e Veriut',
}

export async function getMunicipalityStats(
  listingType: 'sale' | 'rent' = 'sale'
): Promise<MunicipalityStats[]> {
  // 1. Merr të gjitha pronat e publikuara me review_status APPROVED
  const properties = await prisma.property.findMany({
    where: {
      status: 'PUBLISHED',
      review_status: 'APPROVED',
      listing_type: listingType,
      city: { not: null },
      area: { not: null, gt: 0 },
      price: { gt: 0 },
    },
    select: {
      city: true,
      price: true,
      area: true,
      bedrooms: true,
      year_built: true,
    },
  })

  // 2. Group by municipality
  const grouped = new Map<
    string,
    {
      pricesM2: number[]
      prices: number[]
      areas: number[]
      bedrooms: number[]
      years: number[]
    }
  >()

  for (const p of properties) {
    if (!p.city || !p.area || p.area <= 0) continue
    const municipality = CITY_TO_MUNICIPALITY[p.city] || p.city
    const existing = grouped.get(municipality) || {
      pricesM2: [], prices: [], areas: [], bedrooms: [], years: [],
    }
    const priceNum = Number(p.price)
    existing.pricesM2.push(priceNum / p.area)
    existing.prices.push(priceNum)
    existing.areas.push(p.area)
    if (p.bedrooms) existing.bedrooms.push(p.bedrooms)
    if (p.year_built) existing.years.push(p.year_built)
    grouped.set(municipality, existing)
  }

  // 3. Calculate averages
  const avg = (arr: number[]): number =>
    arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length

  const stats: MunicipalityStats[] = []

  for (const municipality of MUNICIPALITIES) {
    const data = grouped.get(municipality.name)

    if (!data || data.pricesM2.length === 0) {
      stats.push({
        ...municipality,
        count: 0, avgPriceM2: 0, medianPriceM2: 0,
        minPriceM2: 0, maxPriceM2: 0, avgPrice: 0,
        minPrice: 0, maxPrice: 0, avgArea: 0,
        avgBedrooms: 0, avgYearBuilt: 0, intensity: 0,
      })
      continue
    }

    const sorted = [...data.pricesM2].sort((a, b) => a - b)
    const median =
      sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)]

    stats.push({
      ...municipality,
      count: data.pricesM2.length,
      avgPriceM2: Math.round(avg(data.pricesM2)),
      medianPriceM2: Math.round(median),
      minPriceM2: Math.round(Math.min(...data.pricesM2)),
      maxPriceM2: Math.round(Math.max(...data.pricesM2)),
      avgPrice: Math.round(avg(data.prices)),
      minPrice: Math.round(Math.min(...data.prices)),
      maxPrice: Math.round(Math.max(...data.prices)),
      avgArea: Math.round(avg(data.areas)),
      avgBedrooms: Math.round(avg(data.bedrooms) * 10) / 10,
      avgYearBuilt: Math.round(avg(data.years)),
      intensity: 0,
    })
  }

  // 4. Calculate intensity (0-1) për heatmap
  const withData = stats.filter((s) => s.count > 0)
  if (withData.length > 0) {
    const min = Math.min(...withData.map((s) => s.avgPriceM2))
    const max = Math.max(...withData.map((s) => s.avgPriceM2))
    stats.forEach((s) => {
      if (s.count > 0 && max > min) {
        s.intensity = (s.avgPriceM2 - min) / (max - min)
      }
    })
  }

  return stats
}

export async function getMunicipalityBySlug(
  slug: string,
  listingType: 'sale' | 'rent' = 'sale'
): Promise<MunicipalityStats | null> {
  const all = await getMunicipalityStats(listingType)
  return all.find((m) => m.slug === slug) || null
}