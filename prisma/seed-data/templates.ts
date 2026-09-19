// ═══════════════════════════════════════════════════════════════
// TITUJ TË LARMISHËM - PA ":" - TË NDRYSHËM SI NË REAL ESTATE
// ═══════════════════════════════════════════════════════════════

const PROPERTY_TYPE_SQ: Record<string, string> = {
  apartment: 'Apartament',
  house: 'Shtëpi',
  villa: 'Vilë',
  studio: 'Studio',
  penthouse: 'Penthouse',
  land: 'Truall',
  commercial: 'Lokal Komercial',
  office: 'Zyrë',
}

const CITY_LOCATIVE: Record<string, string> = {
  Prishtina: 'Prishtinë',
  Prizren: 'Prizren',
  Peja: 'Pejë',
  Gjakova: 'Gjakovë',
  Ferizaj: 'Ferizaj',
  Gjilan: 'Gjilan',
  Mitrovica: 'Mitrovicë',
  Vushtrri: 'Vushtrri',
  Podujeva: 'Podujevë',
}

const CITY_GENITIVE: Record<string, string> = {
  Prishtina: 'Prishtinës',
  Prizren: 'Prizrenit',
  Peja: 'Pejës',
  Gjakova: 'Gjakovës',
  Ferizaj: 'Ferizajt',
  Gjilan: 'Gjilanit',
  Mitrovica: 'Mitrovicës',
  Vushtrri: 'Vushtrrisë',
  Podujeva: 'Podujevës',
}

// ═══════════════════════════════════════════════════════════════
// DESCRIPTORS
// ═══════════════════════════════════════════════════════════════

const MASCULINE_DESCRIPTORS = [
  'Modern',
  'Luksoz',
  'Komod',
  'I Ri',
  'I Rinovuar',
  'Funksional',
  'I Bollshëm',
  'I Ndriçuar',
  'Kompakt',
  'Elegant',
  'Klasik',
  'Premium',
  'I Mobiluar',
  'I Pajisur',
  'I Qetë',
  'Sofistikuar',
  'I Përsosur',
  'I Veçantë',
  'Bashkëkohor',
  'I Jashtëzakonshëm',
]

const FEMININE_DESCRIPTORS = [
  'Moderne',
  'Luksoze',
  'Komode',
  'E Re',
  'E Rinovuar',
  'Funksionale',
  'E Bollshme',
  'E Ndriçuar',
  'Elegante',
  'Klasike',
  'Premium',
  'E Mobiluar',
  'E Pajisur',
  'E Qetë',
  'Sofistikuar',
  'E Përsosur',
  'E Veçantë',
  'Bashkëkohore',
  'E Jashtëzakonshme',
  'E Gjelbëruar',
]

// ═══════════════════════════════════════════════════════════════
// FEATURE PHRASES
// ═══════════════════════════════════════════════════════════════

const MASCULINE_FEATURES = [
  'me Ballkon',
  'me Terracë',
  'me Pamje Panoramike',
  'me Parkim',
  'me Ashensor',
  'me 2 Ballkone',
  'me Pamje nga Qyteti',
  'me Verandë',
  'me Depo',
  'me Kopsht',
  'në Kat të Lartë',
  'me Dysheme Druri',
  'me Kuzhinë Moderne',
  'me Sistem Sigurie',
  'me Ajër të Kondicionuar',
  'me Ngrohje Qendrore',
  'me Internet Fibër',
]

const FEMININE_FEATURES = [
  'me Kopsht',
  'me Oborr',
  'me Pishinë',
  'me Garazh',
  'me 2 Kate',
  'me Tarracë',
  'me Pamje Panoramike',
  'me Sistem Sigurie',
  'me Ngrohje Qendrore',
  'me Ajër të Kondicionuar',
  'me Ballkon',
  'me Verandë',
  'me Depo',
  'me Barbecue',
  'me Pemë Frutore',
]

// ═══════════════════════════════════════════════════════════════
// LOCATION PHRASES
// ═══════════════════════════════════════════════════════════════

const LOCATION_PHRASES = [
  'në Qendër',
  'afër Qendrës',
  'në Zonë të Qetë',
  'në Zemër të Qytetit',
  'në Lagje Familjare',
  'afër Parkut',
  'afër Shkollës',
  'afër Spitalit',
  'afër Transportit Publik',
  'në Zonë Premium',
  'në Zonë Turistike',
  'me Akses të Lehtë',
]

// ═══════════════════════════════════════════════════════════════
// GENERATE TITLE - PA ":" - TË LARMISHËM
// ═══════════════════════════════════════════════════════════════

export function generateTitle(
  propertyType: string,
  bedrooms: number | null,
  neighborhood: string,
  city: string,
  condition: string,
  area: number,
  listingType: string
): string {
  const cityLocative = CITY_LOCATIVE[city] || city
  const typeLabel = PROPERTY_TYPE_SQ[propertyType] || 'Pronë'
  const isFeminine = ['house', 'villa', 'office'].includes(propertyType)

  const style = Math.random()

  // ═══════════════════════════════════════════════════════════
  // STILI 1: DESCRIPTOR + TYPE + SIZE + LOCATION
  // "Modern Apartament 3+1 në Qendër"
  // ═══════════════════════════════════════════════════════════
  if (style < 0.15) {
    const descriptor = isFeminine
      ? pickRandom(FEMININE_DESCRIPTORS)
      : pickRandom(MASCULINE_DESCRIPTORS)
    const size = bedrooms ? ` ${bedrooms}+1` : ''
    const location = pickRandom(LOCATION_PHRASES)

    return `${descriptor} ${typeLabel}${size} ${location}`
  }

  // ═══════════════════════════════════════════════════════════
  // STILI 2: DESCRIPTOR + TYPE + SIZE + NEIGHBORHOOD
  // "Luksoz Vilë 4+1 në Dragodan"
  // ═══════════════════════════════════════════════════════════
  if (style < 0.3) {
    const descriptor = isFeminine
      ? pickRandom(FEMININE_DESCRIPTORS)
      : pickRandom(MASCULINE_DESCRIPTORS)
    const size = bedrooms ? ` ${bedrooms}+1` : ''
    const neighborhoodText = neighborhood ? ` në ${neighborhood}` : ''

    return `${descriptor} ${typeLabel}${size}${neighborhoodText}`
  }

  // ═══════════════════════════════════════════════════════════
  // STILI 3: TYPE + SIZE + FEATURE + LOCATION
  // "Apartament 3+1 me Ballkon në Qendër"
  // ═══════════════════════════════════════════════════════════
  if (style < 0.45) {
    const feature = isFeminine
      ? pickRandom(FEMININE_FEATURES)
      : pickRandom(MASCULINE_FEATURES)
    const size = bedrooms ? ` ${bedrooms}+1` : ''
    const location = pickRandom(LOCATION_PHRASES)

    return `${typeLabel}${size} ${feature} ${location}`
  }

  // ═══════════════════════════════════════════════════════════
  // STILI 4: DESCRIPTOR + TYPE + FEATURE + NEIGHBORHOOD
  // "Luksoze Shtëpi me Kopsht në Ulpiana"
  // ═══════════════════════════════════════════════════════════
  if (style < 0.6) {
    const descriptor = isFeminine
      ? pickRandom(FEMININE_DESCRIPTORS)
      : pickRandom(MASCULINE_DESCRIPTORS)
    const feature = isFeminine
      ? pickRandom(FEMININE_FEATURES)
      : pickRandom(MASCULINE_FEATURES)
    const neighborhoodText = neighborhood ? ` në ${neighborhood}` : ''

    return `${descriptor} ${typeLabel} ${feature}${neighborhoodText}`
  }

  // ═══════════════════════════════════════════════════════════
  // STILI 5: SIZE + TYPE + NEIGHBORHOOD + CITY
  // "3+1 Apartament në Qendra, Prishtinë"
  // ═══════════════════════════════════════════════════════════
  if (style < 0.75) {
    const size = bedrooms ? `${bedrooms}+1 ` : ''
    const neighborhoodText = neighborhood ? ` në ${neighborhood}` : ''
    const cityText = `, ${cityLocative}`

    return `${size}${typeLabel}${neighborhoodText}${cityText}`
  }

  // ═══════════════════════════════════════════════════════════
  // STILI 6: TYPE + NEIGHBORHOOD + FEATURE
  // "Apartament në Qendra me Ballkon"
  // ═══════════════════════════════════════════════════════════
  if (style < 0.85) {
    const feature = isFeminine
      ? pickRandom(FEMININE_FEATURES)
      : pickRandom(MASCULINE_FEATURES)
    const neighborhoodText = neighborhood ? ` në ${neighborhood}` : ''

    return `${typeLabel}${neighborhoodText} ${feature}`
  }

  // ═══════════════════════════════════════════════════════════
  // STILI 7: TYPE + SIZE + CITY + FEATURE (marketing)
  // "Apartament 3+1 në Prishtinë me Pamje Panoramike"
  // ═══════════════════════════════════════════════════════════
  const size = bedrooms ? ` ${bedrooms}+1` : ''
  const feature = isFeminine
    ? pickRandom(FEMININE_FEATURES)
    : pickRandom(MASCULINE_FEATURES)

  return `${typeLabel}${size} në ${cityLocative} ${feature}`
}

// ═══════════════════════════════════════════════════════════════
// GENERATE DESCRIPTION
// ═══════════════════════════════════════════════════════════════

export function generateDescription(property: {
  propertyType: string
  bedrooms: number | null
  bathrooms: number | null
  area: number | null
  floor: number | null
  totalFloors: number | null
  yearBuilt: number | null
  condition: string
  furnished: string
  orientation: string | null
  neighborhood: string
  city: string
  hasElevator: boolean
  hasParking: boolean
  hasGarden: boolean
  hasPool: boolean
  hasAirConditioning: boolean
  hasHeating: boolean
  hasSecurity: boolean
  hasInternet: boolean
  features: string[]
  listingType: string
  price: number
}): string {
  const cityLocative = CITY_LOCATIVE[property.city] || property.city
  const cityGenitive = CITY_GENITIVE[property.city] || property.city
  const typeLower =
    PROPERTY_TYPE_SQ[property.propertyType]?.toLowerCase() || 'pronë'
  const isFeminine = ['house', 'villa', 'office'].includes(
    property.propertyType
  )

  const parts: string[] = []

  // Intro
  const introVariants = [
    `${typeLower} në ${property.neighborhood}, ${cityLocative}.`,
    `Zbuloni këtë ${typeLower} të bukur në ${property.neighborhood}, ${cityLocative}.`,
    `Kjo ${typeLower} ndodhet në zemër të ${property.neighborhood}, ${cityLocative}.`,
    `${typeLower} e veçantë në ${property.neighborhood}, ${cityLocative}.`,
    `Në zemër të ${property.neighborhood}, ${cityLocative}, ndodhet kjo ${typeLower} e mrekullueshme.`,
  ]
  parts.push(pickRandom(introVariants))

  // Details
  const details: string[] = []
  if (property.bedrooms) details.push(`${property.bedrooms} dhoma gjumi`)
  if (property.bathrooms) details.push(`${property.bathrooms} banjo`)
  if (property.area) details.push(`${property.area}m² sipërfaqe`)

  if (details.length > 0) {
    const detailVariants = [
      `Prona përfshin ${details.join(', ')}.`,
      `Ofron ${details.join(', ')}.`,
      `Organizimi përfshin ${details.join(', ')}.`,
      `Karakterizohet nga ${details.join(', ')}.`,
    ]
    parts.push(pickRandom(detailVariants))
  }

  if (property.floor && property.totalFloors) {
    const floorVariants = [
      `Ndodhet në katin e ${property.floor}-të nga gjithsej ${property.totalFloors} kate.`,
      `Pozicionohet në katin ${property.floor} të një ndërtese me ${property.totalFloors} kate.`,
      `Kati ${property.floor} i një godine me ${property.totalFloors} kate.`,
    ]
    parts.push(pickRandom(floorVariants))
  }

  if (property.yearBuilt) {
    const yearVariants = [
      `E ndërtuar në vitin ${property.yearBuilt}.`,
      `Viti i ndërtimit ${property.yearBuilt}.`,
      `Ndërtesa daton nga viti ${property.yearBuilt}.`,
    ]
    parts.push(pickRandom(yearVariants))
  }

  // Condition
  const condText: Record<string, string[]> = {
    new: [
      "Prona është e re, e gatshme për t'u banuar.",
      'E sapo ndërtuar, çelësat gati për dorëzim.',
      'E re dhe e papërdorur më parë.',
    ],
    excellent: [
      'Prona është në gjendje shumë të mirë.',
      'Gjendje e shkëlqyer, e mirëmbajtur me kujdes.',
      'Shumë mirë e ruajtur ndër vite.',
    ],
    good: [
      'Prona është në gjendje të mirë.',
      'Gjendje e mirë, e banueshme menjëherë.',
      'E mirëmbajtur dhe funksionale.',
    ],
    needs_renovation: [
      'Prona kërkon rinovim.',
      'Mundësi e shkëlqyer për rinovim dhe personalizim.',
      'Ideale për ata që duan të krijojnë hapësirën e tyre.',
    ],
    under_construction: [
      'Prona është në ndërtim e sipër.',
      'Në fazë ndërtimi, e gatshme së shpejti.',
      'Projekt i ri në zhvillim.',
    ],
  }
  parts.push(
    pickRandom(
      condText[property.condition] || ['Prona është në gjendje të mirë.']
    )
  )

  // Furnished
  if (property.furnished === 'fully_furnished') {
    parts.push(
      isFeminine
        ? 'Ofrohet plotësisht e mobiluar me orendi cilësore.'
        : 'Ofrohet plotësisht i mobiluar me orendi cilësore.'
    )
  } else if (property.furnished === 'semi_furnished') {
    parts.push(
      isFeminine
        ? 'Ofrohet gjysmë e mobiluar, ideale për personalizim.'
        : 'Ofrohet gjysmë i mobiluar, ideal për personalizim.'
    )
  }

  // Features
  const featureList: string[] = []
  if (property.hasElevator) featureList.push('ashensor')
  if (property.hasParking) featureList.push('parking')
  if (property.hasGarden) featureList.push('kopsht')
  if (property.hasPool) featureList.push('pishinë')
  if (property.hasAirConditioning) featureList.push('ajër të kondicionuar')
  if (property.hasHeating) featureList.push('ngrohje qendrore')
  if (property.hasSecurity) featureList.push('sistem sigurie')
  if (property.hasInternet) featureList.push('internet me fibër')

  if (featureList.length > 0) {
    const featureVariants = [
      `Prona përfshin ${featureList.join(', ')}.`,
      `Komoditetet përfshijnë ${featureList.join(', ')}.`,
      `Pajisur me ${featureList.join(', ')}.`,
      `Ofron ${featureList.join(', ')}.`,
    ]
    parts.push(pickRandom(featureVariants))
  }

  // Orientation
  const orientationText: Record<string, string> = {
    north: 'orientim verior',
    south: 'orientim jugor',
    east: 'orientim lindor',
    west: 'orientim perëndimor',
    north_east: 'orientim veri-lindor',
    north_west: 'orientim veri-perëndimor',
    south_east: 'orientim jug-lindor',
    south_west: 'orientim jug-perëndimor',
  }
  if (property.orientation && orientationText[property.orientation]) {
    parts.push(`Ka ${orientationText[property.orientation]}.`)
  }

  // Location closing
  const locationVariants = [
    `Ndodhet në një zonë të qetë të ${property.neighborhood}, afër qendrës së ${cityGenitive}.`,
    `Pozicion i shkëlqyer në ${property.neighborhood}, me akses të lehtë në qendrën e ${cityGenitive}.`,
    `Lokacion ideal në ${property.neighborhood}, vetëm pak minuta nga qendra e ${cityGenitive}.`,
    `Zona e ${property.neighborhood} ofron qetësi dhe komoditet, afër të gjitha shërbimeve të ${cityGenitive}.`,
  ]
  parts.push(pickRandom(locationVariants))

  return parts.join(' ')
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function generateSlug(title: string, id: string): string {
  const base = title
    .toLowerCase()
    .replace(/[ë]/g, 'e')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80)

  return `${base}-${id}`
}