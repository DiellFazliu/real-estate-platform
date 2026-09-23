export type PropertyXRayContext = {
  slug: string
  title: string

  listingType: 'rent' | 'sale'
  propertyType: string
  price: number

  city: string | null
  neighborhood: string | null
  location: string | null
  postalCode: string | null

  area: number | null
  bedrooms: number | null
  bathrooms: number | null

  balconies: number | null
  floor: number | null
  totalFloors: number | null

  yearBuilt: number | null
  renovationYear: number | null
  condition: string | null
  orientation: string | null
  furnished: string | null

  hasParking: boolean
  hasHeating: boolean
  hasElevator: boolean
  hasGarden: boolean
  hasPool: boolean
  hasAirConditioning: boolean
  hasSecurity: boolean
  hasInternet: boolean

  features: string[]
  energyClass: string | null
}

export type DeterministicDecision = {
  listingCompleteness: {
    score: number
    missingCount: number
    totalChecks: number
    completedCount: number
  }

  cost: {
    type: 'monthly' | 'purchase'
    advertised: number
    budget: number | null
    remaining: number | null
  }

  offer: {
    target: number | null
    difference: number | null
    percentageDifference: number | null
    relation: 'below' | 'equal' | 'above' | null
  }
}

export type VerificationPriority = 'high' | 'medium' | 'low'

export type PropertyXRayResult = {
  missingInformation: string[]

  verificationPoints: Array<{
    title: string
    detail: string
    priority: VerificationPriority
  }>

  questionsToAsk: string[]

  visitChecklist: string[]

  negotiationPoints: string[]
}