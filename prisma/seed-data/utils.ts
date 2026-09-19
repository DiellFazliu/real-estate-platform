// ═══════════════════════════════════════════════════════════════
// UTILS PËR SEED
// ═══════════════════════════════════════════════════════════════

/**
 * Random integer në [min, max]
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/**
 * Random float në [min, max]
 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

/**
 * Random element nga array
 */
export function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Random boolean me probabilitet
 */
export function randomBoolean(probability = 0.5): boolean {
  return Math.random() < probability
}

/**
 * Round në 2 decimals
 */
export function round2(num: number): number {
  return Math.round(num * 100) / 100
}

// ═══════════════════════════════════════════════════════════════
// PRICES SIPAS TREGUT
// ═══════════════════════════════════════════════════════════════

export const PRICE_RANGES: Record<
  string,
  Record<string, { min: number; max: number }>
> = {
  apartment: {
    Prishtina: { min: 60000, max: 300000 },
    Prizren: { min: 45000, max: 180000 },
    Peja: { min: 40000, max: 150000 },
    Gjakova: { min: 40000, max: 150000 },
    Ferizaj: { min: 35000, max: 130000 },
    Gjilan: { min: 35000, max: 130000 },
    Mitrovica: { min: 30000, max: 100000 },
    Vushtrri: { min: 25000, max: 80000 },
    Podujeva: { min: 25000, max: 80000 },
  },
  house: {
    Prishtina: { min: 120000, max: 500000 },
    Prizren: { min: 80000, max: 250000 },
    Peja: { min: 70000, max: 200000 },
    Gjakova: { min: 70000, max: 200000 },
    Ferizaj: { min: 60000, max: 180000 },
    Gjilan: { min: 60000, max: 180000 },
    Mitrovica: { min: 50000, max: 150000 },
    Vushtrri: { min: 40000, max: 120000 },
    Podujeva: { min: 40000, max: 120000 },
  },
  villa: {
    Prishtina: { min: 250000, max: 1500000 },
    Prizren: { min: 180000, max: 800000 },
    Peja: { min: 150000, max: 600000 },
    Gjakova: { min: 150000, max: 600000 },
    Ferizaj: { min: 120000, max: 500000 },
    Gjilan: { min: 120000, max: 500000 },
    Mitrovica: { min: 100000, max: 400000 },
    Vushtrri: { min: 80000, max: 300000 },
    Podujeva: { min: 80000, max: 300000 },
  },
  studio: {
    Prishtina: { min: 30000, max: 120000 },
    Prizren: { min: 25000, max: 80000 },
    Peja: { min: 20000, max: 70000 },
    Gjakova: { min: 20000, max: 70000 },
    Ferizaj: { min: 18000, max: 60000 },
    Gjilan: { min: 18000, max: 60000 },
    Mitrovica: { min: 15000, max: 50000 },
    Vushtrri: { min: 15000, max: 40000 },
    Podujeva: { min: 15000, max: 40000 },
  },
  penthouse: {
    Prishtina: { min: 200000, max: 800000 },
    Prizren: { min: 150000, max: 500000 },
    Peja: { min: 120000, max: 400000 },
    Gjakova: { min: 120000, max: 400000 },
    Ferizaj: { min: 100000, max: 350000 },
    Gjilan: { min: 100000, max: 350000 },
    Mitrovica: { min: 80000, max: 250000 },
    Vushtrri: { min: 60000, max: 200000 },
    Podujeva: { min: 60000, max: 200000 },
  },
  commercial: {
    Prishtina: { min: 80000, max: 500000 },
    Prizren: { min: 60000, max: 300000 },
    Peja: { min: 50000, max: 250000 },
    Gjakova: { min: 50000, max: 250000 },
    Ferizaj: { min: 40000, max: 200000 },
    Gjilan: { min: 40000, max: 200000 },
    Mitrovica: { min: 30000, max: 150000 },
    Vushtrri: { min: 25000, max: 100000 },
    Podujeva: { min: 25000, max: 100000 },
  },
  office: {
    Prishtina: { min: 60000, max: 400000 },
    Prizren: { min: 45000, max: 250000 },
    Peja: { min: 40000, max: 200000 },
    Gjakova: { min: 40000, max: 200000 },
    Ferizaj: { min: 35000, max: 150000 },
    Gjilan: { min: 35000, max: 150000 },
    Mitrovica: { min: 25000, max: 120000 },
    Vushtrri: { min: 20000, max: 80000 },
    Podujeva: { min: 20000, max: 80000 },
  },
}

/**
 * Gjeneron çmim realist
 */
export function randomPrice(
  propertyType: string,
  cityName: string,
  area: number
): number {
  const ranges =
    PRICE_RANGES[propertyType]?.[cityName] || PRICE_RANGES.apartment.Prishtina

  const basePrice = randomInt(ranges.min, ranges.max)
  const pricePerM2 = basePrice / (area || 100)

  // Round në 1000
  return Math.round((pricePerM2 * area) / 1000) * 1000
}

/**
 * Gjeneron çmim mujor për qira (afërsisht 0.4% e çmimit total)
 */
export function randomRentPrice(price: number): number {
  return Math.round((price * 0.004) / 10) * 10
}