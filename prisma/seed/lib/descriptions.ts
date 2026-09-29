// ═══════════════════════════════════════════════════════════════
// GJENERIMI I PËRSHKRIMEVE TË PRONAVE
// Struktura: Intro + Details + Condition + Features + Location
// ═══════════════════════════════════════════════════════════════

import { randomElement } from './random'

const TYPE_LABELS: Record<string, string> = {
  apartment: 'apartament',
  house: 'shtëpi',
  villa: 'vilë',
  studio: 'studio',
  penthouse: 'penthouse',
  commercial: 'lokal komercial',
  office: 'zyrë',
}

const FEMININE_TYPES = new Set(['house', 'villa', 'office'])

const CONDITION_TEXTS: Record<string, string[]> = {
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

const ORIENTATION_TEXTS: Record<string, string> = {
  north: 'orientim verior',
  south: 'orientim jugor',
  east: 'orientim lindor',
  west: 'orientim perëndimor',
  north_east: 'orientim veri-lindor',
  north_west: 'orientim veri-perëndimor',
  south_east: 'orientim jug-lindor',
  south_west: 'orientim jug-perëndimor',
}

// ═══════════════════════════════════════════════════════════════
// TIPI I PARAMETRAVE
// ═══════════════════════════════════════════════════════════════

export interface DescriptionParams {
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
  cityLocative: string
  cityGenitive: string
  hasElevator: boolean
  hasParking: boolean
  hasGarden: boolean
  hasPool: boolean
  hasAirConditioning: boolean
  hasHeating: boolean
  hasSecurity: boolean
  hasInternet: boolean
  features: string[]
}

// ═══════════════════════════════════════════════════════════════
// GJENERATORI KRYESOR
// ═══════════════════════════════════════════════════════════════

export function generateDescription(params: DescriptionParams): string {
  const {
    propertyType, bedrooms, bathrooms, area, floor, totalFloors,
    yearBuilt, condition, furnished, orientation, neighborhood,
    cityLocative, cityGenitive, hasElevator, hasParking, hasGarden,
    hasPool, hasAirConditioning, hasHeating, hasSecurity, hasInternet,
  } = params

  const typeLower = TYPE_LABELS[propertyType] ?? 'pronë'
  const isFeminine = FEMININE_TYPES.has(propertyType)
  const parts: string[] = []

  // ─── 1. INTRO ────────────────────────────────────────────────
  parts.push(randomElement([
    `${typeLower} në ${neighborhood}, ${cityLocative}.`,
    `Zbuloni këtë ${typeLower} të bukur në ${neighborhood}, ${cityLocative}.`,
    `Kjo ${typeLower} ndodhet në zemër të ${neighborhood}, ${cityLocative}.`,
    `${typeLower} e veçantë në ${neighborhood}, ${cityLocative}.`,
    `Në zemër të ${neighborhood}, ${cityLocative}, ndodhet kjo ${typeLower} e mrekullueshme.`,
  ]))

  // ─── 2. DETAJET ──────────────────────────────────────────────
  const details: string[] = []
  if (bedrooms) details.push(`${bedrooms} dhoma gjumi`)
  if (bathrooms) details.push(`${bathrooms} banjo`)
  if (area) details.push(`${area}m² sipërfaqe`)

  if (details.length > 0) {
    parts.push(randomElement([
      `Prona përfshin ${details.join(', ')}.`,
      `Ofron ${details.join(', ')}.`,
      `Organizimi përfshin ${details.join(', ')}.`,
      `Karakterizohet nga ${details.join(', ')}.`,
    ]))
  }

  // ─── 3. KATI ─────────────────────────────────────────────────
  if (floor && totalFloors) {
    parts.push(randomElement([
      `Ndodhet në katin e ${floor}-të nga gjithsej ${totalFloors} kate.`,
      `Pozicionohet në katin ${floor} të një ndërtese me ${totalFloors} kate.`,
      `Kati ${floor} i një godine me ${totalFloors} kate.`,
    ]))
  }

  // ─── 4. VITI ─────────────────────────────────────────────────
  if (yearBuilt) {
    parts.push(randomElement([
      `E ndërtuar në vitin ${yearBuilt}.`,
      `Viti i ndërtimit ${yearBuilt}.`,
      `Ndërtesa daton nga viti ${yearBuilt}.`,
    ]))
  }

  // ─── 5. GJENDJA ──────────────────────────────────────────────
  parts.push(
    randomElement(CONDITION_TEXTS[condition] ?? ['Prona është në gjendje të mirë.'])
  )

  // ─── 6. MOBILIMI ─────────────────────────────────────────────
  if (furnished === 'fully_furnished') {
    parts.push(
      isFeminine
        ? 'Ofrohet plotësisht e mobiluar me orendi cilësore.'
        : 'Ofrohet plotësisht i mobiluar me orendi cilësore.'
    )
  } else if (furnished === 'semi_furnished') {
    parts.push(
      isFeminine
        ? 'Ofrohet gjysmë e mobiluar, ideale për personalizim.'
        : 'Ofrohet gjysmë i mobiluar, ideal për personalizim.'
    )
  }

  // ─── 7. VEÇORITË ─────────────────────────────────────────────
  const featureList: string[] = []
  if (hasElevator) featureList.push('ashensor')
  if (hasParking) featureList.push('parking')
  if (hasGarden) featureList.push('kopsht')
  if (hasPool) featureList.push('pishinë')
  if (hasAirConditioning) featureList.push('ajër të kondicionuar')
  if (hasHeating) featureList.push('ngrohje qendrore')
  if (hasSecurity) featureList.push('sistem sigurie')
  if (hasInternet) featureList.push('internet me fibër')

  if (featureList.length > 0) {
    parts.push(randomElement([
      `Prona përfshin ${featureList.join(', ')}.`,
      `Komoditetet përfshijnë ${featureList.join(', ')}.`,
      `Pajisur me ${featureList.join(', ')}.`,
      `Ofron ${featureList.join(', ')}.`,
    ]))
  }

  // ─── 8. ORIENTIMI ────────────────────────────────────────────
  if (orientation && ORIENTATION_TEXTS[orientation]) {
    parts.push(`Ka ${ORIENTATION_TEXTS[orientation]}.`)
  }

  // ─── 9. LOKACIONI ────────────────────────────────────────────
  parts.push(randomElement([
    `Ndodhet në një zonë të qetë të ${neighborhood}, afër qendrës së ${cityGenitive}.`,
    `Pozicion i shkëlqyer në ${neighborhood}, me akses të lehtë në qendrën e ${cityGenitive}.`,
    `Lokacion ideal në ${neighborhood}, vetëm pak minuta nga qendra e ${cityGenitive}.`,
    `Zona e ${neighborhood} ofron qetësi dhe komoditet, afër të gjitha shërbimeve të ${cityGenitive}.`,
  ]))

  return parts.join(' ')
}