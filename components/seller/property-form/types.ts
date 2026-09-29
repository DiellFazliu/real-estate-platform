// ═══════════════════════════════════════════════════════════════
// TYPES DHE KONSTANTE
// ═══════════════════════════════════════════════════════════════

export interface UploadedImage {
  assetId: string
  url: string
}

export interface PropertyFormInitialData {
  id: number
  title: string
  description: string
  price: number
  listingType: string
  propertyType: string
  bedrooms: number | null
  bathrooms: number | null
  area: number | null
  balconies: number | null
  floor: number | null
  totalFloors: number | null
  yearBuilt: number | null
  renovationYear: number | null
  condition: string | null
  orientation: string | null
  furnished: string | null
  energyClass: string | null
  location: string | null
  city: string | null
  neighborhood: string | null
  postalCode: string | null
  distanceFromCenter: number | null
  latitude: number | null
  longitude: number | null
  hasElevator: boolean
  hasParking: boolean
  hasGarden: boolean
  hasPool: boolean
  hasAirConditioning: boolean
  hasHeating: boolean
  hasSecurity: boolean
  hasInternet: boolean
  features: string[]
  images: UploadedImage[]
  contactPhone: string
  contactEmail: string
}

// ═══════════════════════════════════════════════════════════════
// KONFIGURIMI DINAMIK I FUSHAVE SIPAS TIPIT TË PRONËS
// ═══════════════════════════════════════════════════════════════

export interface PropertyTypeConfig {
  /** Ka dhoma gjumi? */
  hasBedrooms: boolean
  /** Ka banjo? */
  hasBathrooms: boolean
  /** Ka ballkone? */
  hasBalconies: boolean
  /** Ka kat / kate totale? */
  hasFloors: boolean
  /** Ka vit ndërtimi / rinovimi? */
  hasYearBuilt: boolean
  /** Ka orientim? */
  hasOrientation: boolean
  /** Ka mobilim? */
  hasFurnished: boolean
  /** Ka klasë energjetike? */
  hasEnergyClass: boolean
  /** Ka ashensor? */
  hasElevator: boolean
  /** Ka kopsht / pishinë? */
  hasGardenPool: boolean
  /** Etiketa e sipërfaqes (m² vs ha) */
  areaLabel: string
  /** Zgjidhja e dhoma gjumi (nëse ka) */
  bedroomsLabel?: string
}

export const PROPERTY_TYPE_CONFIG: Record<string, PropertyTypeConfig> = {
  apartment: {
    hasBedrooms: true,
    hasBathrooms: true,
    hasBalconies: true,
    hasFloors: true,
    hasYearBuilt: true,
    hasOrientation: true,
    hasFurnished: true,
    hasEnergyClass: true,
    hasElevator: true,
    hasGardenPool: false,
    areaLabel: 'Sipërfaqja (m²)',
  },
  house: {
    hasBedrooms: true,
    hasBathrooms: true,
    hasBalconies: false,
    hasFloors: false,
    hasYearBuilt: true,
    hasOrientation: true,
    hasFurnished: true,
    hasEnergyClass: true,
    hasElevator: false,
    hasGardenPool: true,
    areaLabel: 'Sipërfaqja (m²)',
  },
  villa: {
    hasBedrooms: true,
    hasBathrooms: true,
    hasBalconies: false,
    hasFloors: false,
    hasYearBuilt: true,
    hasOrientation: true,
    hasFurnished: true,
    hasEnergyClass: true,
    hasElevator: false,
    hasGardenPool: true,
    areaLabel: 'Sipërfaqja (m²)',
  },
  penthouse: {
    hasBedrooms: true,
    hasBathrooms: true,
    hasBalconies: true,
    hasFloors: true,
    hasYearBuilt: true,
    hasOrientation: true,
    hasFurnished: true,
    hasEnergyClass: true,
    hasElevator: true,
    hasGardenPool: false,
    areaLabel: 'Sipërfaqja (m²)',
  },
  studio: {
    hasBedrooms: true,
    hasBathrooms: true,
    hasBalconies: true,
    hasFloors: true,
    hasYearBuilt: true,
    hasOrientation: true,
    hasFurnished: true,
    hasEnergyClass: true,
    hasElevator: true,
    hasGardenPool: false,
    areaLabel: 'Sipërfaqja (m²)',
    bedroomsLabel: 'Dhoma (studio)',
  },
  land: {
    // ⭐ TRUALL — fusha minimale
    hasBedrooms: false,
    hasBathrooms: false,
    hasBalconies: false,
    hasFloors: false,
    hasYearBuilt: false,
    hasOrientation: false,
    hasFurnished: false,
    hasEnergyClass: false,
    hasElevator: false,
    hasGardenPool: false,
    areaLabel: 'Sipërfaqja (m²)',
  },
  commercial: {
    hasBedrooms: false,
    hasBathrooms: true,
    hasBalconies: false,
    hasFloors: true,
    hasYearBuilt: true,
    hasOrientation: true,
    hasFurnished: true,
    hasEnergyClass: true,
    hasElevator: true,
    hasGardenPool: false,
    areaLabel: 'Sipërfaqja (m²)',
  },
  office: {
    hasBedrooms: false,
    hasBathrooms: true,
    hasBalconies: false,
    hasFloors: true,
    hasYearBuilt: true,
    hasOrientation: true,
    hasFurnished: true,
    hasEnergyClass: true,
    hasElevator: true,
    hasGardenPool: false,
    areaLabel: 'Sipërfaqja (m²)',
  },
}

export function getPropertyTypeConfig(type: string): PropertyTypeConfig {
  return PROPERTY_TYPE_CONFIG[type] ?? PROPERTY_TYPE_CONFIG.apartment
}

// ═══════════════════════════════════════════════════════════════
// OPSIONET E FUSHAVE
// ═══════════════════════════════════════════════════════════════

export const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartament' },
  { value: 'house', label: 'Shtëpi' },
  { value: 'villa', label: 'Vilë' },
  { value: 'penthouse', label: 'Penthouse' },
  { value: 'studio', label: 'Studio' },
  { value: 'land', label: 'Truall' },
  { value: 'commercial', label: 'Komerciale' },
  { value: 'office', label: 'Zyrë' },
] as const

export const CONDITION_OPTIONS = [
  { value: 'new', label: 'I ri' },
  { value: 'excellent', label: 'Shumë i mirë' },
  { value: 'good', label: 'I mirë' },
  { value: 'needs_renovation', label: 'Kërkon rinovim' },
  { value: 'under_construction', label: 'Në ndërtim' },
] as const

export const ORIENTATION_OPTIONS = [
  { value: '', label: 'Zgjidh...' },
  { value: 'north', label: 'Veri' },
  { value: 'south', label: 'Jug' },
  { value: 'east', label: 'Lindje' },
  { value: 'west', label: 'Perëndim' },
] as const

export const FURNISHED_OPTIONS = [
  { value: 'unfurnished', label: 'Pa mobilje' },
  { value: 'semi_furnished', label: 'Gjysmë i mobiluar' },
  { value: 'fully_furnished', label: 'I mobiluar plotësisht' },
] as const

export const ENERGY_OPTIONS = ['', 'A+', 'A', 'B', 'C', 'D', 'E', 'F'] as const

export const BOOLEAN_FEATURES = [
  { name: 'hasElevator', label: 'Ashensor' },
  { name: 'hasParking', label: 'Parkim' },
  { name: 'hasGarden', label: 'Kopsht' },
  { name: 'hasPool', label: 'Pishinë' },
  { name: 'hasAirConditioning', label: 'Ajër i Kondicionuar' },
  { name: 'hasHeating', label: 'Ngrohje' },
  { name: 'hasSecurity', label: 'Siguri' },
  { name: 'hasInternet', label: 'Internet' },
] as const