/**
 * API fetch helpers për properties
 */

export interface PropertyListItem {
  id: number
  slug: string
  title: string
  price: number
  city: string | null
  neighborhood: string | null
  bedrooms: number | null
  bathrooms: number | null
  area: number | null
  primary_image_url: string | null
  listing_type: string
}

export async function fetchFeaturedProperties(): Promise<PropertyListItem[]> {
  try {
    const res = await fetch('/api/properties/featured')
    if (!res.ok) throw new Error('Failed to fetch featured')
    return await res.json()
  } catch (error) {
    console.error('Error fetching featured:', error)
    return []
  }
}

export async function fetchRentProperties(): Promise<PropertyListItem[]> {
  try {
    const res = await fetch('/api/properties/rent')
    if (!res.ok) throw new Error('Failed to fetch rent')
    return await res.json()
  } catch (error) {
    console.error('Error fetching rent:', error)
    return []
  }
}