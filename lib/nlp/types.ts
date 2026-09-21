/**
 * Rezultati i parsing-ut të një query
 * Përdoret nga të gjithë parser-at (regex, groq, hybrid)
 */
export interface ParsedQuery {
  // Filtra numerik
  bedrooms?: number
  bathrooms?: number
  minPrice?: number
  maxPrice?: number

  // Lokacioni
  city?: string
  neighborhood?: string

  // Tipi
  propertyType?:
    | 'apartment'
    | 'house'
    | 'villa'
    | 'penthouse'
    | 'studio'
    | 'land'
    | 'commercial'
    | 'office'
  listingType?: 'sale' | 'rent'

  // Veçoritë
  features?: string[]

  // Keywords (për search në title)
  keywords?: string[]

  // Sa i sigurt është parser
  confidence?: number
}

/**
 * Rezultati i search-it
 */
export interface SearchResult {
  properties: any[]
  total: number
  totalPages: number
  parsed: ParsedQuery
  meta: {
    parseTime: number
    queryTime: number
    totalTime: number
  }
}