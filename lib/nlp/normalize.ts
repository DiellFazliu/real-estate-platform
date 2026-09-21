// ═══════════════════════════════════════════════════════════════
// NORMALIZIMI I TEKSTIT SHQIP
// ═══════════════════════════════════════════════════════════════

/**
 * Normalizon tekstin shqip:
 * - Heq diakritikat (ë → e, ç → c)
 * - Konverton në lowercase
 * - Heq karaktere speciale
 */
export function normalizeAlbanian(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Heq diakritikat
    .replace(/[ë]/g, 'e')
    .replace(/[ç]/g, 'c')
    .replace(/[Ë]/g, 'E')
    .replace(/[Ç]/g, 'C')
    // Heq karaktere speciale
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// ═══════════════════════════════════════════════════════════════
// LEVENSHTEIN DISTANCE (Fuzzy Match)
// ═══════════════════════════════════════════════════════════════

/**
 * Llogarit distancën Levenshtein midis dy stringjeve
 * Sa më e vogël, aq më shumë të ngjashme
 */
export function levenshtein(a: string, b: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

/**
 * Kontrollo nëse dy fjalë janë të ngjashme
 * threshold: 0-1 (0.7 = 70% e ngjashme)
 */
export function isSimilar(word1: string, word2: string, threshold = 0.7): boolean {
  const w1 = normalizeAlbanian(word1)
  const w2 = normalizeAlbanian(word2)

  if (w1 === w2) return true

  const maxLen = Math.max(w1.length, w2.length)
  if (maxLen === 0) return true

  const distance = levenshtein(w1, w2)
  const similarity = 1 - distance / maxLen

  return similarity >= threshold
}

/**
 * Gjej fjalën më të ngjashme nga një listë
 */
export function findBestMatch(
  word: string,
  options: string[],
  threshold = 0.7
): string | null {
  const normalized = normalizeAlbanian(word)
  let bestMatch: string | null = null
  let bestScore = 0

  for (const option of options) {
    const normalizedOption = normalizeAlbanian(option)

    if (normalized === normalizedOption) {
      return option // Match i saktë
    }

    const maxLen = Math.max(normalized.length, normalizedOption.length)
    const distance = levenshtein(normalized, normalizedOption)
    const similarity = maxLen > 0 ? 1 - distance / maxLen : 0

    if (similarity >= threshold && similarity > bestScore) {
      bestScore = similarity
      bestMatch = option
    }
  }

  return bestMatch
}

// ═══════════════════════════════════════════════════════════════
// STEMMING I THJESHTË (Heq mbaresat shqip)
// ═══════════════════════════════════════════════════════════════

const SUFFIXES_SQ = [
  'et', 'at', 'it', 'ut', 'in', 'en', 'an', 'on', 'un',
  'e', 'a', 'i', 'u', 'o', 't', 'n',
]

/**
 * Heq mbaresat e zakonshme shqip
 * "dhomë" → "dhom"
 * "dhomat" → "dhom"
 * "dhoma" → "dhom"
 */
export function stemAlbanian(word: string): string {
  let stem = normalizeAlbanian(word)

  // Provo të heqësh mbaresat nga më e gjata në më të shkurtër
  for (const suffix of SUFFIXES_SQ) {
    if (stem.length > suffix.length + 2 && stem.endsWith(suffix)) {
      stem = stem.slice(0, -suffix.length)
      break
    }
  }

  return stem
}

// ═══════════════════════════════════════════════════════════════
// NORMALIZIMI I KËRKIMIT
// ═══════════════════════════════════════════════════════════════

/**
 * Normalizon një query të plotë
 * Kthen fjalët e normalizuara
 */
export function normalizeQuery(query: string): string[] {
  const normalized = normalizeAlbanian(query)
  return normalized.split(/\s+/).filter((w) => w.length > 1)
}