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

export type PropertyType = 'sale' | 'rent'

export const PROPERTY_TYPE_LABELS = {
  apartment: 'Apartment',
  house: 'House',
  villa: 'Villa',
  penthouse: 'Penthouse',
  studio: 'Studio',
  land: 'Land',
  commercial: 'Commercial space',
  office: 'Office',
} as const

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