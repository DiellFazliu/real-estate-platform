// ═══════════════════════════════════════════════════════════════
// GJENERIMI I TITUJVE PËR PRONA
// 7 stile të ndryshme për larmi realiste
// ═══════════════════════════════════════════════════════════════

import { randomElement } from './random'

// ═══════════════════════════════════════════════════════════════
// FJALOR
// ═══════════════════════════════════════════════════════════════

const TYPE_LABELS: Record<string, string> = {
  apartment: 'Apartament',
  house: 'Shtëpi',
  villa: 'Vilë',
  studio: 'Studio',
  penthouse: 'Penthouse',
  commercial: 'Lokal Komercial',
  office: 'Zyrë',
}

const MASCULINE_DESCRIPTORS = [
  'Modern', 'Luksoz', 'Komod', 'I Ri', 'I Rinovuar',
  'Funksional', 'I Bollshëm', 'I Ndriçuar', 'Kompakt',
  'Elegant', 'Klasik', 'Premium', 'I Mobiluar', 'I Pajisur',
  'I Qetë', 'Sofistikuar', 'I Përsosur', 'I Veçantë',
  'Bashkëkohor', 'I Jashtëzakonshëm',
]

const FEMININE_DESCRIPTORS = [
  'Moderne', 'Luksoze', 'Komode', 'E Re', 'E Rinovuar',
  'Funksionale', 'E Bollshme', 'E Ndriçuar', 'Elegante',
  'Klasike', 'Premium', 'E Mobiluar', 'E Pajisur', 'E Qetë',
  'Sofistikuar', 'E Përsosur', 'E Veçantë', 'Bashkëkohore',
  'E Jashtëzakonshme', 'E Gjelbëruar',
]

const MASCULINE_FEATURES = [
  'me Ballkon', 'me Terracë', 'me Pamje Panoramike',
  'me Parkim', 'me Ashensor', 'me 2 Ballkone',
  'me Pamje nga Qyteti', 'me Verandë', 'me Depo',
  'me Kopsht', 'në Kat të Lartë', 'me Dysheme Druri',
  'me Kuzhinë Moderne', 'me Sistem Sigurie',
  'me Ajër të Kondicionuar', 'me Ngrohje Qendrore',
  'me Internet Fibër',
]

const FEMININE_FEATURES = [
  'me Kopsht', 'me Oborr', 'me Pishinë', 'me Garazh',
  'me 2 Kate', 'me Tarracë', 'me Pamje Panoramike',
  'me Sistem Sigurie', 'me Ngrohje Qendrore',
  'me Ajër të Kondicionuar', 'me Ballkon', 'me Verandë',
  'me Depo', 'me Barbecue', 'me Pemë Frutore',
]

const LOCATION_PHRASES = [
  'në Qendër', 'afër Qendrës', 'në Zonë të Qetë',
  'në Zemër të Qytetit', 'në Lagje Familjare',
  'afër Parkut', 'afër Shkollës', 'afër Spitalit',
  'afër Transportit Publik', 'në Zonë Premium',
  'në Zonë Turistike', 'me Akses të Lehtë',
]

// ═══════════════════════════════════════════════════════════════
// GJENERATORI KRYESOR
// ═══════════════════════════════════════════════════════════════

const FEMININE_TYPES = new Set(['house', 'villa', 'office'])

interface TitleParams {
  propertyType: string
  bedrooms: number | null
  neighborhood: string
  cityLocative: string
}

export function generateTitle(params: TitleParams): string {
  const { propertyType, bedrooms, neighborhood, cityLocative } = params
  const typeLabel = TYPE_LABELS[propertyType] ?? 'Pronë'
  const isFeminine = FEMININE_TYPES.has(propertyType)

  const descriptor = isFeminine
    ? randomElement(FEMININE_DESCRIPTORS)
    : randomElement(MASCULINE_DESCRIPTORS)
  const feature = isFeminine
    ? randomElement(FEMININE_FEATURES)
    : randomElement(MASCULINE_FEATURES)
  const location = randomElement(LOCATION_PHRASES)
  const size = bedrooms ? ` ${bedrooms}+1` : ''
  const neighborhoodText = neighborhood ? ` në ${neighborhood}` : ''

  const style = Math.random()

  if (style < 0.15) {
    // "Modern Apartament 3+1 në Qendër"
    return `${descriptor} ${typeLabel}${size} ${location}`
  }
  if (style < 0.30) {
    // "Luksoz Vilë 4+1 në Dragodan"
    return `${descriptor} ${typeLabel}${size}${neighborhoodText}`
  }
  if (style < 0.45) {
    // "Apartament 3+1 me Ballkon në Qendër"
    return `${typeLabel}${size} ${feature} ${location}`
  }
  if (style < 0.60) {
    // "Luksoze Shtëpi me Kopsht në Ulpiana"
    return `${descriptor} ${typeLabel} ${feature}${neighborhoodText}`
  }
  if (style < 0.75) {
    // "3+1 Apartament në Qendra, Prishtinë"
    return `${bedrooms ?? ''}+1 ${typeLabel}${neighborhoodText}, ${cityLocative}`
      .replace(/^\+1/, '')
      .trim()
  }
  if (style < 0.85) {
    // "Apartament në Qendra me Ballkon"
    return `${typeLabel}${neighborhoodText} ${feature}`
  }

  // "Apartament 3+1 në Prishtinë me Pamje Panoramike"
  return `${typeLabel}${size} në ${cityLocative} ${feature}`
}

// ═══════════════════════════════════════════════════════════════
// SLUG
// ═══════════════════════════════════════════════════════════════

export function generateSlug(title: string, id: string): string {
  const base = title
    .toLowerCase()
    .replace(/ë/g, 'e')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80)

  return `${base}-${id}`
}