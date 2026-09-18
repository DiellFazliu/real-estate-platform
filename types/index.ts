// ═══════════════════════════════════════════════════════════════
// HERO SLIDE
// ═══════════════════════════════════════════════════════════════

export interface HeroSlide {
  _id: string
  title: string
  subtitle?: string
  price?: string
  description?: string
  badge?: string
  imageUrl: string
  propertySlug?: string
  propertyId?: string
  propertyStatus?: string
}

// ═══════════════════════════════════════════════════════════════
// PROPERTY (për Sanity - content)
// ═══════════════════════════════════════════════════════════════

export interface Property {
  _id: string
  title: string
  price: number
  location: string
  bedrooms: number
  bathrooms: number
  area: number
  status: string
  image: string
  slug: { current: string }
  featured?: boolean
}

// ═══════════════════════════════════════════════════════════════
// LISTING TYPES (sale/rent - NUK është PropertyType)
// ═══════════════════════════════════════════════════════════════

export type ListingType = 'sale' | 'rent'

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  sale: 'Për Shitje',
  rent: 'Me Qira',
}

// ═══════════════════════════════════════════════════════════════
// PROPERTY TYPES (apartment/house/villa - NUK është ListingType)
// ═══════════════════════════════════════════════════════════════

export type PropertyType =
  | 'apartment'
  | 'house'
  | 'villa'
  | 'penthouse'
  | 'studio'
  | 'land'
  | 'commercial'
  | 'office'

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  apartment: 'Apartament',
  house: 'Shtëpi',
  villa: 'Vilë',
  penthouse: 'Penthouse',
  studio: 'Studio',
  land: 'Truall',
  commercial: 'Komerciale',
  office: 'Zyrë',
}

// ═══════════════════════════════════════════════════════════════
// NEIGHBORHOODS
// ═══════════════════════════════════════════════════════════════

export const NEIGHBORHOODS = [
  'Qendra',
  'Dardania',
  'Dragodan',
  'Ulpiana',
  'Bregu i Diellit',
  'Lakrishte',
  'Kalabria',
  'Arberia',
  'Mati 1',
  'Aktash',
  'Taslixhe',
  'Veternik',
  'Sunny Hill',
  'Tophane',
] as const

export type Neighborhood = (typeof NEIGHBORHOODS)[number]

// ═══════════════════════════════════════════════════════════════
// CONDITIONS
// ═══════════════════════════════════════════════════════════════

export type PropertyCondition =
  | 'new'
  | 'excellent'
  | 'good'
  | 'needs_renovation'
  | 'under_construction'

export const CONDITION_LABELS: Record<PropertyCondition, string> = {
  new: 'I ri',
  excellent: 'Shumë i mirë',
  good: 'I mirë',
  needs_renovation: 'Kërkon rinovim',
  under_construction: 'Në ndërtim',
}

// ═══════════════════════════════════════════════════════════════
// ORIENTATION
// ═══════════════════════════════════════════════════════════════

export type Orientation =
  | 'north'
  | 'south'
  | 'east'
  | 'west'
  | 'north_east'
  | 'north_west'
  | 'south_east'
  | 'south_west'

export const ORIENTATION_LABELS: Record<Orientation, string> = {
  north: 'Veri',
  south: 'Jug',
  east: 'Lindje',
  west: 'Perëndim',
  north_east: 'Veri-Lindje',
  north_west: 'Veri-Perëndim',
  south_east: 'Jug-Lindje',
  south_west: 'Jug-Perëndim',
}

// ═══════════════════════════════════════════════════════════════
// FURNISHED
// ═══════════════════════════════════════════════════════════════

export type Furnished =
  | 'unfurnished'
  | 'semi_furnished'
  | 'fully_furnished'

export const FURNISHED_LABELS: Record<Furnished, string> = {
  unfurnished: 'Pa mobilje',
  semi_furnished: 'Gjysmë i mobiluar',
  fully_furnished: 'I mobiluar plotësisht',
}

// ═══════════════════════════════════════════════════════════════
// ENERGY CLASS
// ═══════════════════════════════════════════════════════════════

export type EnergyClass = 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F'

// ═══════════════════════════════════════════════════════════════
// SOURCE
// ═══════════════════════════════════════════════════════════════

export type PropertySource = 'OWNER' | 'AGENT' | 'USER'

export const PROPERTY_SOURCE_LABELS: Record<PropertySource, string> = {
  OWNER: 'Listed by Owner',
  AGENT: 'Listed by Agent',
  USER: 'Listed by User',
}

// ═══════════════════════════════════════════════════════════════
// REVIEW STATUS
// ═══════════════════════════════════════════════════════════════

export type ReviewStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'

export const REVIEW_STATUS_LABELS: Record<ReviewStatus, string> = {
  PENDING_REVIEW: 'Në Pritje',
  APPROVED: 'I Aprovuar',
  REJECTED: 'I Refuzuar',
}

export const REVIEW_STATUS_COLORS: Record<ReviewStatus, string> = {
  PENDING_REVIEW: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
}

// ═══════════════════════════════════════════════════════════════
// SELLER STATUS
// ═══════════════════════════════════════════════════════════════

export interface SellerStatus {
  is_seller: boolean
  seller_since: Date | null
  seller_verified: boolean
}

// ═══════════════════════════════════════════════════════════════
// PROPERTY IMAGE
// ═══════════════════════════════════════════════════════════════

export interface PropertyImage {
  asset: {
    url: string
    metadata?: {
      dimensions?: {
        width: number
        height: number
      }
    }
  }
  alt?: string
}

// ═══════════════════════════════════════════════════════════════
// PROPERTY FROM SANITY (i plotë)
// ═══════════════════════════════════════════════════════════════

export interface SanityProperty {
  _id: string
  title: string
  slug: { current: string }
  description?: string
  price: number
  pricePerM2?: number
  listingType?: ListingType
  status: string
  featured?: boolean

  // Location
  location?: string
  neighborhood?: string
  city?: string
  postalCode?: string
  latitude?: number
  longitude?: number
  distanceFromCenter?: number

  // Characteristics
  propertyType?: PropertyType
  bedrooms?: number
  bathrooms?: number
  area?: number
  balconies?: number
  floor?: number
  totalFloors?: number
  yearBuilt?: number
  renovationYear?: number
  condition?: PropertyCondition
  orientation?: Orientation
  furnished?: Furnished

  // Features
  hasElevator?: boolean
  hasParking?: boolean
  hasGarden?: boolean
  hasPool?: boolean
  hasAirConditioning?: boolean
  hasHeating?: boolean
  hasSecurity?: boolean
  hasInternet?: boolean
  features?: string[]
  energyClass?: EnergyClass

  // Marketplace
  source?: PropertySource
  reviewStatus?: ReviewStatus
  listedBy?: string
  contactPhone?: string
  contactEmail?: string

  // Images
  images?: PropertyImage[]
}