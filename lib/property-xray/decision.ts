import type {
  DeterministicDecision,
  PropertyXRayContext,
} from './types'

function isSpecified(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false
  }

  if (typeof value === 'string') {
    return value.trim().length > 0
  }

  return true
}

function isApartmentLike(propertyType: string): boolean {
  const value = propertyType.toLowerCase()

  return (
    value.includes('apartment') ||
    value.includes('penthouse') ||
    value.includes('studio') ||
    value.includes('banes') ||
    value.includes('apartament')
  )
}

function isHouseLike(propertyType: string): boolean {
  const value = propertyType.toLowerCase()

  return (
    value.includes('house') ||
    value.includes('villa') ||
    value.includes('shtëpi') ||
    value.includes('vile')
  )
}

export function buildDecision(
  property: PropertyXRayContext,
  budget: number | null,
  targetOffer: number | null,
): DeterministicDecision {
  const apartmentLike = isApartmentLike(
    property.propertyType,
  )

  const houseLike = isHouseLike(
    property.propertyType,
  )

  const checks: boolean[] = [
    isSpecified(property.city) ||
      isSpecified(property.location),

    isSpecified(property.neighborhood),
    isSpecified(property.propertyType),
    isSpecified(property.area),
    isSpecified(property.condition),
    isSpecified(property.furnished),
    isSpecified(property.yearBuilt),
    isSpecified(property.energyClass),
    isSpecified(property.bedrooms),
    isSpecified(property.bathrooms),

    isSpecified(property.hasHeating),
    isSpecified(property.hasParking),
  ]

  if (apartmentLike) {
    checks.push(
      isSpecified(property.floor),
      isSpecified(property.totalFloors),
      isSpecified(property.hasElevator),
      isSpecified(property.balconies),
    )
  }

  if (houseLike) {
    checks.push(
      isSpecified(property.hasGarden),
      isSpecified(property.balconies),
    )
  }

  if (!houseLike) {
    checks.push(
      isSpecified(property.orientation),
    )
  }

  const completedCount =
    checks.filter(Boolean).length

  const totalChecks = checks.length

  const score =
    totalChecks > 0
      ? Math.round(
          (completedCount / totalChecks) * 100,
        )
      : 0

  const missingCount =
    totalChecks - completedCount

  const isRent =
    property.listingType === 'rent'

  const costType: 'monthly' | 'purchase' =
    isRent ? 'monthly' : 'purchase'

  const advertised = property.price

  const remaining =
    budget !== null
      ? budget - advertised
      : null

  let offerDifference: number | null = null

  let offerPercentageDifference:
    | number
    | null = null

  let offerRelation:
    | 'below'
    | 'equal'
    | 'above'
    | null = null

  if (targetOffer !== null) {
    offerDifference =
      targetOffer - advertised

    offerPercentageDifference =
      advertised > 0
        ? (offerDifference / advertised) * 100
        : null

    if (offerDifference < 0) {
      offerRelation = 'below'
    } else if (offerDifference > 0) {
      offerRelation = 'above'
    } else {
      offerRelation = 'equal'
    }
  }

  let offerVsBudgetDifference:
    | number
    | null = null

  let offerVsBudgetRelation:
    | 'within'
    | 'above'
    | null = null

  if (
    targetOffer !== null &&
    budget !== null
  ) {
    offerVsBudgetDifference =
      targetOffer - budget

    offerVsBudgetRelation =
      offerVsBudgetDifference > 0
        ? 'above'
        : 'within'
  }

  return {
    listingCompleteness: {
      score,
      missingCount,
      totalChecks,
      completedCount,
    },

    cost: {
      type: costType,
      advertised,
      budget,
      remaining,
    },

    offer: {
      target: targetOffer,
      difference: offerDifference,
      percentageDifference:
        offerPercentageDifference,
      relation: offerRelation,
    },

    offerVsBudget: {
      difference: offerVsBudgetDifference,
      relation: offerVsBudgetRelation,
    },
  }
}