// ═══════════════════════════════════════════════════════════════
// RREGULLA GRAMATIKORE TË SHQIPES
// Për NLP parsing më të mirë
// ═══════════════════════════════════════════════════════════════

/**
 * RREGULLA KRYESORE TË SHQIPES
 */
export const ALBANIAN_GRAMMAR_RULES = {
  // ═══════════════════════════════════════════════════════════
  // NUMRAT (Numbers)
  // ═══════════════════════════════════════════════════════════
  numbers: {
    'një': 1, 'nje': 1, '1': 1,
    'dy': 2, '2': 2,
    'tre': 3, 'tri': 3, '3': 3,
    'katër': 4, 'kater': 4, '4': 4,
    'pesë': 5, 'pese': 5, '5': 5,
    'gjashtë': 6, 'gjashte': 6, '6': 6,
    'shtatë': 7, 'shtate': 7, '7': 7,
    'tetë': 8, 'tete': 8, '8': 8,
    'nëntë': 9, 'nente': 9, '9': 9,
    'dhjetë': 10, 'dhjete': 10, '10': 10,
  },

  // ═══════════════════════════════════════════════════════════
  // PARAFJALËT (Prepositions)
  // ═══════════════════════════════════════════════════════════
  prepositions: [
    'në', 'ne', 'nëpër', 'neper', 'mbi', 'nën', 'nen',
    'pranë', 'prane', 'afër', 'afer', 'larg', 'brenda',
    'jashtë', 'jashte', 'midis', 'ndërmjet', 'ndermjet',
    'nga', 'deri', 'për', 'per', 'me', 'pa',
  ],

  // ═══════════════════════════════════════════════════════════
  // LIDHËZAT (Conjunctions)
  // ═══════════════════════════════════════════════════════════
  conjunctions: [
    'dhe', 'ose', 'por', 'edhe', 'as', 'as',
    'që', 'qe', 'sepse', 'pasi', 'kur', 'nëse', 'nese',
  ],

  // ═══════════════════════════════════════════════════════════
  // PËREMRA (Pronouns)
  // ═══════════════════════════════════════════════════════════
  pronouns: [
    'unë', 'une', 'ti', 'ai', 'ajo', 'ne', 'ju', 'ata', 'ato',
    'ky', 'kjo', 'këta', 'keta', 'këto', 'keto',
    'ai', 'ajo', 'ata', 'ato',
  ],

  // ═══════════════════════════════════════════════════════════
  // PASAZHE TË ZAKONSHME (Common Patterns)
  // ═══════════════════════════════════════════════════════════
  patterns: {
    // "X bedroom" → bedrooms: X
    bedroom: /(\d+|një|dy|tre|tri|katër|kater|pesë|pese|gjashtë|gjashte|shtatë|shtate|tetë|tete|nëntë|nente|dhjetë|dhjete)\s*(dhomë|dhome|dhoma|dhomat|dhomash|sobe|soba|bedroom|bed|bedrooms)/i,
    
    // "X bathroom" → bathrooms: X
    bathroom: /(\d+|një|dy|tre|tri|katër|kater|pesë|pese|gjashtë|gjashte|shtatë|shtate|tetë|tete|nëntë|nente|dhjetë|dhjete)\s*(banjo|banjë|banje|banjot|tualet|bathroom|bath)/i,
    
    // "under X" → maxPrice: X
    maxPrice: /(?:nën|nen|deri|maks|max|maksimum|under|below|më pak se|me pak se)\s*[$€]?\s*(\d+(?:[.,]\d+)?)\s*(k|mijë|mije|mij|milion|miliona|m|thousand|million)?/i,
    
    // "over X" → minPrice: X
    minPrice: /(?:mbi|min|minimum|over|above|më shumë se|me shume se)\s*[$€]?\s*(\d+(?:[.,]\d+)?)\s*(k|mijë|mije|mij|milion|miliona|m|thousand|million)?/i,
  },
}

// ═══════════════════════════════════════════════════════════════
// FUNKSIONET
// ═══════════════════════════════════════════════════════════════

/**
 * Konverton numrin shqip në numër
 */
export function parseAlbanianNumber(word: string): number | null {
  const lower = word.toLowerCase().trim()
  
  // Nëse është numër direkt
  const num = parseInt(lower, 10)
  if (!isNaN(num)) return num
  
  // Nëse është numër shqip
  return ALBANIAN_GRAMMAR_RULES.numbers[lower as keyof typeof ALBANIAN_GRAMMAR_RULES.numbers] || null
}

/**
 * Heq parafjalët dhe lidhëzat nga fillimi
 */
export function stripPrepositions(text: string): string {
  const words = text.split(/\s+/)
  const result: string[] = []
  
  for (const word of words) {
    if (
      ALBANIAN_GRAMMAR_RULES.prepositions.includes(word.toLowerCase()) ||
      ALBANIAN_GRAMMAR_RULES.conjunctions.includes(word.toLowerCase())
    ) {
      continue
    }
    result.push(word)
  }
  
  return result.join(' ')
}

/**
 * Kontrollo nëse fjala është stop word
 */
export function isStopWord(word: string): boolean {
  const lower = word.toLowerCase()
  return (
    ALBANIAN_GRAMMAR_RULES.prepositions.includes(lower) ||
    ALBANIAN_GRAMMAR_RULES.conjunctions.includes(lower) ||
    ALBANIAN_GRAMMAR_RULES.pronouns.includes(lower)
  )
}