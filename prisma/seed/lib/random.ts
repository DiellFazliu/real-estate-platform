// ═══════════════════════════════════════════════════════════════
// FUNKSIONE PËR GJENERIM TË DHËNASH TË RASTËSISHME
// ═══════════════════════════════════════════════════════════════

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

export function randomElement<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function randomBoolean(probability = 0.5): boolean {
  return Math.random() < probability
}

export function round2(num: number): number {
  return Math.round(num * 100) / 100
}

export function shuffle<T>(arr: readonly T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

/**
 * Zgjedh një element sipas peshës (weighted random)
 * @example pickWeighted({ a: 0.5, b: 0.3, c: 0.2 }) → 'a' 50% e kohës
 */
export function pickWeighted<T extends Record<string, number>>(
  distribution: T
): keyof T {
  const random = Math.random()
  let cumulative = 0

  for (const [key, weight] of Object.entries(distribution)) {
    cumulative += weight
    if (random <= cumulative) return key as keyof T
  }

  return Object.keys(distribution)[0] as keyof T
}