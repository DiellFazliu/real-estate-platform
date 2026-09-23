import type {
  DeterministicDecision,
  PropertyXRayContext,
} from './types'

type Check = {
  key: string
  label: string
  value: unknown
}

function isSpecified(value: unknown): boolean {
  if (value === null || value === undefined) return false

  if (typeof value === 'string') {
    return value.trim().length > 0
  }

  return true
}

function getExpectedChecks(
  property: PropertyXRayContext
): Check[] {
  const checks: Check[] = [
    {
      key: 'city',
      label: 'Qyteti',
      value: property.city,
    },
    {
      key: 'neighborhood',
      label: 'Lagjja',
      value: property.neighborhood,
    },
    {
      key: 'propertyType',
      label: 'Lloji i pronës',
      value: property.propertyType,
    },
    {
      key: 'area',
      label: 'Sipërfaqja',
      value: property.area,
    },
    {
      key: 'condition',
      label: 'Gjendja',
      value: property.condition,
    },
    {
      key: 'furnished',
      label: 'Mobilimi',
      value: property.furnished,
    },
    {
      key: 'yearBuilt',
      label: 'Viti i ndërtimit',
      value: property.yearBuilt,
    },
    {
      key: 'energyClass',
      label: 'Klasa energjetike',
      value: property.energyClass,
    },
  ]

  const residentialTypes = [
    'apartment',
    'house',
    'villa',
    'penthouse',
    'studio',
  ]

  if (residentialTypes.includes(property.propertyType)) {
    checks.push(
      {
        key: 'bedrooms',
        label: 'Dhomat e gjumit',
        value: property.bedrooms,
      },
      {
        key: 'bathrooms',
        label: 'Banjo',
        value: property.bathrooms,
      },
      {
        key: 'heating',
        label: 'Ngrohja',
        value: property.hasHeating,
      },
      {
        key: 'parking',
        label: 'Parkimi',
        value: property.hasParking,
      }
    )
  }

  const apartmentLikeTypes = [
    'apartment',
    'penthouse',
    'studio',
  ]

  if (apartmentLikeTypes.includes(property.propertyType)) {
    checks.push(
      {
        key: 'floor',
        label: 'Kati',
        value: property.floor,
      },
      {
        key: 'totalFloors',
        label: 'Numri i kateve',
        value: property.totalFloors,
      },
      {
        key: 'elevator',
        label: 'Ashensori',
        value: property.hasElevator,
      }
    )
  }

  const houseLikeTypes = ['house', 'villa']

  if (houseLikeTypes.includes(property.propertyType)) {
    checks.push(
      {
        key: 'garden',
        label: 'Kopshti',
        value: property.hasGarden,
      },
      {
        key: 'balconies',
        label: 'Ballkonet',
        value: property.balconies,
      }
    )
  }

  if (property.propertyType !== 'land') {
    checks.push({
      key: 'orientation',
      label: 'Orientimi',
      value: property.orientation,
    })
  }

  return checks
}

export function getMissingListingInformation(
  property: PropertyXRayContext
): string[] {
  return getExpectedChecks(property)
    .filter((check) => !isSpecified(check.value))
    .map((check) => check.label)
}

export function buildDecision(
  property: PropertyXRayContext,
  budget?: number,
  targetOffer?: number
): DeterministicDecision {
  const checks = getExpectedChecks(property)

  const completedCount = checks.filter((check) =>
    isSpecified(check.value)
  ).length

  const missingCount = checks.length - completedCount

  const score =
    checks.length === 0
      ? 100
      : Math.round(
          (completedCount / checks.length) * 100
        )

  const advertised = property.price

  const costRemaining =
    budget === undefined
      ? null
      : budget - advertised

  let offerDifference: number | null = null
  let percentageDifference: number | null = null
  let relation: 'below' | 'equal' | 'above' | null = null

  if (targetOffer !== undefined) {
    offerDifference = targetOffer - advertised

    percentageDifference =
      advertised === 0
        ? null
        : Math.abs(
            (offerDifference / advertised) * 100
          )

    if (targetOffer < advertised) {
      relation = 'below'
    } else if (targetOffer > advertised) {
      relation = 'above'
    } else {
      relation = 'equal'
    }
  }

  return {
    listingCompleteness: {
      score,
      missingCount,
      totalChecks: checks.length,
      completedCount,
    },

    cost: {
      type:
        property.listingType === 'rent'
          ? 'monthly'
          : 'purchase',
      advertised,
      budget:
        budget !== undefined
          ? budget
          : null,
      remaining: costRemaining,
    },

    offer: {
      target:
        targetOffer !== undefined
          ? targetOffer
          : null,
      difference: offerDifference,
      percentageDifference,
      relation,
    },
  }
}