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