// ═══════════════════════════════════════════════════════════════
// QYTETET E KOSOVËS ME KOORDINATA REALE
// ═══════════════════════════════════════════════════════════════

export interface CityData {
  name: string
  nameEn: string
  lat: number
  lng: number
  weight: number // Probabiliteti për gjenerim (0-100)
  postalCode: string
}

export const CITIES: CityData[] = [
  {
    name: 'Prishtina',
    nameEn: 'Pristina',
    lat: 42.6629,
    lng: 21.1655,
    weight: 40,
    postalCode: '10000',
  },
  {
    name: 'Prizren',
    nameEn: 'Prizren',
    lat: 42.2139,
    lng: 20.7397,
    weight: 15,
    postalCode: '20000',
  },
  {
    name: 'Peja',
    nameEn: 'Peja',
    lat: 42.6593,
    lng: 20.2887,
    weight: 10,
    postalCode: '30000',
  },
  {
    name: 'Gjakova',
    nameEn: 'Gjakova',
    lat: 42.3803,
    lng: 20.4308,
    weight: 10,
    postalCode: '50000',
  },
  {
    name: 'Ferizaj',
    nameEn: 'Ferizaj',
    lat: 42.3702,
    lng: 21.1553,
    weight: 8,
    postalCode: '70000',
  },
  {
    name: 'Gjilan',
    nameEn: 'Gjilan',
    lat: 42.4635,
    lng: 21.4694,
    weight: 7,
    postalCode: '60000',
  },
  {
    name: 'Mitrovica',
    nameEn: 'Mitrovica',
    lat: 42.8914,
    lng: 20.866,
    weight: 5,
    postalCode: '40000',
  },
  {
    name: 'Vushtrri',
    nameEn: 'Vushtrri',
    lat: 42.8231,
    lng: 20.9675,
    weight: 3,
    postalCode: '42000',
  },
  {
    name: 'Podujeva',
    nameEn: 'Podujeva',
    lat: 42.9108,
    lng: 21.1933,
    weight: 2,
    postalCode: '11000',
  },
]

/**
 * Kthen një qytet sipas peshës (weighted random)
 */
export function pickRandomCity(): CityData {
  const totalWeight = CITIES.reduce((sum, c) => sum + c.weight, 0)
  let random = Math.random() * totalWeight

  for (const city of CITIES) {
    random -= city.weight
    if (random <= 0) return city
  }

  return CITIES[0]
}

/**
 * Gjeneron koordinata të rastësishme afër qytetit
 * (brenda ~5km radius)
 */
export function randomCoordinatesNear(
  city: CityData,
  radiusKm = 5
): { lat: number; lng: number } {
  // 1 gradë ≈ 111km
  const radiusDeg = radiusKm / 111

  // Random point në rreth
  const angle = Math.random() * 2 * Math.PI
  const distance = Math.random() * radiusDeg

  return {
    lat: city.lat + Math.cos(angle) * distance,
    lng: city.lng + Math.sin(angle) * distance,
  }
}