// ═══════════════════════════════════════════════════════════════
// FJALOR I PLOTË - TË GJITHA VARIACIONET
// ═══════════════════════════════════════════════════════════════

export const PROPERTY_TYPE_WORDS = [
  // Apartament
  'apartament', 'apartamenti', 'apartamente', 'apartamentet',
  'apartman', 'apartmani', 'apartmana',
  'banes', 'banesa', 'banese', 'banesë', 'banesat',
  'stan', 'stani', 'stane', 'stanovi', 'stanovа',
  'flat', 'flats',

  // Shtëpi
  'shtepi', 'shtëpi', 'shtepia', 'shpi', 'shpia', 'shpite',
  'kuća', 'kuca', 'kuce',
  'house', 'home',

  // Vilë
  'vil', 'vila', 'vile', 'villa', 'vilet', 'vilat',

  // Penthouse
  'penthouse', 'pent haus', 'pentaus',

  // Studio
  'studio', 'studjo', 'garsonjer', 'garsonjera', 'garsonjere',

  // Tokë
  'toke', 'tokë', 'tokа', 'truall', 'trualli', 'parcel', 'parcela',
  'land', 'plot',

  // Komerciale
  'lokal', 'lokali', 'dyqan', 'dyqani', 'biznes', 'biznesi',
  'commercial',

  // Zyrë
  'zyre', 'zyrë', 'zyra', 'zancana', 'office',
]

export const BEDROOM_WORDS = [
  'dhome', 'dhomë', 'dhoma', 'dhomat', 'dhomë', 'dhome gjumi',
  'sobe', 'soba', 'sobi',
  'bedroom', 'bedrooms', 'bed', 'beds',
  'kamare', 'kamarja',
]

export const BATHROOM_WORDS = [
  'banjo', 'banjë', 'banjо', 'banjot', 'banja',
  'tualet', 'tualeti', 'wc',
  'kupaon', 'kupaonica', 'kupatilo',
  'bathroom', 'bathrooms', 'bath', 'baths',
]

export const CITY_VARIANTS: Record<string, string[]> = {
  Prishtina: [
    'prishtin', 'prishtine', 'prishtinë', 'prishtina',
    'pristin', 'pristina', 'pristine',
    'priština', 'pristina',
  ],
  Prizren: [
    'prizren', 'prizreni', 'prizrena', 'prizrenit',
  ],
  Peja: [
    'pej', 'peja', 'peje', 'pejë', 'peć', 'pec',
  ],
  Gjakova: [
    'gjakov', 'gjakova', 'gjakove', 'gjakovë', 'djakovica',
  ],
  Ferizaj: [
    'ferizaj', 'ferizaji', 'ferizajit', 'urosevac',
  ],
  Gjilan: [
    'gjilan', 'gjilani', 'gnjilane', 'gnjilan',
  ],
  Mitrovica: [
    'mitrovic', 'mitrovica', 'mitrovice', 'mitrovicë', 'kosovska mitrovica',
  ],
  Vushtrri: ['vushtrri', 'vushtrria', 'vucitrn'],
  Podujeva: ['podujev', 'podujeva', 'podujeve', 'podujevë', 'besiana'],
  Suhareka: ['suhareka', 'suhareke', 'suharekë', 'theranda'],
  Rahovec: ['rahovec', 'rahoveci', 'orahovac'],
  Kamenica: ['kamenic', 'kamenica', 'kamenice', 'kamenicë'],
}

export const NEIGHBORHOOD_VARIANTS: Record<string, string[]> = {
  Qendra: ['qender', 'qendra', 'qendër', 'centar', 'center', 'qendre'],
  Dardania: ['dardani', 'dardania', 'dardani'],
  Dragodan: ['dragodan', 'dragodani', 'dragodan'],
  Ulpiana: ['ulpian', 'ulpiana', 'ulpiane'],
  'Bregu i Diellit': [
    'bregu i diellit', 'breg dielli', 'bregu diellit',
  ],
  Lakrishte: ['lakrisht', 'lakrishte', 'lakrishtja'],
  Kalabria: ['kalabri', 'kalabria', 'kalabrija'],
  Arberia: ['arberi', 'arberia', 'arbëria', 'arberi'],
  'Mati 1': ['mati 1', 'mati1', 'mati'],
  Aktash: ['aktash', 'aktashi'],
  Taslixhe: ['taslixhe', 'taslixhja'],
  Veternik: ['veternik', 'veterniku'],
  'Sunny Hill': ['sunny hill', 'sani hill'],
  Tophane: ['tophane', 'tophana'],
}

export const FEATURE_VARIANTS: Record<string, string[]> = {
  elevator: [
    'ashensor', 'ashensori', 'ashensora', 'lift', 'lifta', 'elevator',
  ],
  parking: [
    'parking', 'parking', 'parkim', 'parkimi', 'garazh', 'garazhi',
    'garage', 'parkingut',
  ],
  garden: [
    'kopsht', 'kopshti', 'kopshtin', 'oborr', 'oborri', 'garden',
  ],
  pool: [
    'pishin', 'pishina', 'pishinë', 'pishine', 'bazen', 'bazeni', 'pool',
  ],
  air_conditioning: [
    'kondicioner', 'kondicioneri', 'klimatizim', 'klimatizimi',
    'ac', 'air conditioning',
  ],
  heating: [
    'ngrohje', 'ngrohja', 'ngrohje qendrore', 'heating',
  ],
  security: [
    'siguri', 'siguria', 'alarm', 'alarmi', 'security',
  ],
  internet: [
    'internet', 'interneti', 'wifi', 'wi-fi',
  ],
  view: [
    'pamje', 'pamja', 'panoram', 'panorama', 'view', 'pamje panoramike',
  ],
  furnished: [
    'mobiluar', 'mobiluara', 'mobilje', 'furnished', 'inventar',
  ],
  balcony: [
    'ballkon', 'ballkoni', 'ballkone', 'terrace', 'tarrace', 'terasa',
  ],
}

export const LISTING_TYPE_VARIANTS: Record<string, string[]> = {
  sale: [
    'shitje', 'shitet', 'shiten', 'blej', 'blerje', 'shites',
    'sale', 'sell', 'shes',
  ],
  rent: [
    'qira', 'qera', 'qiramarrje', 'marr me qira', 'jepet me qira',
    'rent', 'rental', 'loyer',
  ],
}

export const PRICE_VARIANTS: Record<string, string[]> = {
  under: [
    'nën', 'nen', 'deri', 'maks', 'max', 'maksimum', 'maksimalisht',
    'under', 'below', 'up to', 'less than',
  ],
  over: [
    'mbi', 'nga', 'min', 'minimum', 'minimalisht',
    'over', 'above', 'more than',
  ],
  thousand: ['mijë', 'mije', 'mij', 'k', 'thousand'],
  million: ['milion', 'miliona', 'mil', 'm', 'million'],
}

// ═══════════════════════════════════════════════════════════════
// KOMBINO TË GJITHA VARIACIONET
// ═══════════════════════════════════════════════════════════════

export function getAllCityVariants(): string[] {
  const all: string[] = []
  for (const variants of Object.values(CITY_VARIANTS)) {
    all.push(...variants)
  }
  return all
}

export function getAllNeighborhoodVariants(): string[] {
  const all: string[] = []
  for (const variants of Object.values(NEIGHBORHOOD_VARIANTS)) {
    all.push(...variants)
  }
  return all
}

export function getAllFeatureVariants(): string[] {
  const all: string[] = []
  for (const variants of Object.values(FEATURE_VARIANTS)) {
    all.push(...variants)
  }
  return all
}

// ═══════════════════════════════════════════════════════════════
// GHET NORMALIZED VALUE
// ═══════════════════════════════════════════════════════════════

import { normalizeAlbanian } from './normalize'

/**
 * Kthen vlerën e normalizuar (p.sh., "prishtine" → "Prishtina")
 */
export function getCanonicalCity(word: string): string | null {
  const normalized = normalizeAlbanian(word)

  for (const [city, variants] of Object.entries(CITY_VARIANTS)) {
    if (
      variants.some((v) => normalizeAlbanian(v) === normalized) ||
      normalizeAlbanian(city) === normalized
    ) {
      return city
    }
  }

  return null
}

export function getCanonicalNeighborhood(word: string): string | null {
  const normalized = normalizeAlbanian(word)

  for (const [neighborhood, variants] of Object.entries(
    NEIGHBORHOOD_VARIANTS
  )) {
    if (
      variants.some((v) => normalizeAlbanian(v) === normalized) ||
      normalizeAlbanian(neighborhood) === normalized
    ) {
      return neighborhood
    }
  }

  return null
}

export function getCanonicalFeature(word: string): string | null {
  const normalized = normalizeAlbanian(word)

  for (const [feature, variants] of Object.entries(FEATURE_VARIANTS)) {
    if (
      variants.some((v) => normalizeAlbanian(v) === normalized) ||
      normalizeAlbanian(feature) === normalized
    ) {
      return feature
    }
  }

  return null
}

export function getCanonicalPropertyType(word: string): string | null {
  const normalized = normalizeAlbanian(word)

  const map: Record<string, string[]> = {
    apartment: ['apartament', 'banes', 'stan', 'flat'],
    house: ['shtepi', 'shpi', 'kuce', 'house', 'home'],
    villa: ['vil', 'vila', 'vile', 'villa'],
    penthouse: ['penthouse', 'pentaus'],
    studio: ['studio', 'garsonjer'],
    land: ['toke', 'truall', 'parcel', 'land', 'plot'],
    commercial: ['lokal', 'dyqan', 'biznes', 'commercial'],
    office: ['zyre', 'zyra', 'office'],
  }

  for (const [type, variants] of Object.entries(map)) {
    if (variants.some((v) => normalized.includes(normalizeAlbanian(v)))) {
      return type
    }
  }

  return null
}