export interface LocationInsights {
  location_score: number
  has_neighborhood: boolean
  has_coordinates: boolean
  distance_from_center: number | null
  city_tier: 'CAPITAL' | 'MAJOR' | 'MINOR'
  nearby_amenities: {
    type: string
    estimated_distance: string
    icon: string
  }[]
}

// ═══════════════════════════════════════════════════════════════
// LOCATION ANALYSIS
// ═══════════════════════════════════════════════════════════════

export function analyzeLocation(property: any): LocationInsights {
  const city = property.city || ''
  const distance = property.distance_from_center
    ? Number(property.distance_from_center)
    : null

  // City tier
  const capitalCities = ['Prishtina', 'Prishtinë']
  const majorCities = ['Prizren', 'Peja', 'Gjakova', 'Ferizaj', 'Gjilan', 'Mitrovica']

  let cityTier: 'CAPITAL' | 'MAJOR' | 'MINOR' = 'MINOR'
  if (capitalCities.includes(city)) cityTier = 'CAPITAL'
  else if (majorCities.includes(city)) cityTier = 'MAJOR'

  // Calculate score (0-100)
  let score = 50 // Base

  // City tier bonus
  if (cityTier === 'CAPITAL') score += 20
  else if (cityTier === 'MAJOR') score += 10

  // Distance from center
  if (distance !== null) {
    if (distance < 1) score += 20
    else if (distance < 3) score += 15
    else if (distance < 5) score += 10
    else if (distance < 10) score += 5
  }

  // Has neighborhood
  if (property.neighborhood) score += 5

  // Has coordinates (enables map)
  if (property.latitude && property.longitude) score += 5

  score = Math.min(100, score)

  // Nearby amenities (estimated based on city tier and distance)
  const amenities = []
  if (cityTier === 'CAPITAL' || cityTier === 'MAJOR') {
    amenities.push(
      { type: 'Shkolla', estimated_distance: '~500m', icon: '🏫' },
      { type: 'Supermarketa', estimated_distance: '~300m', icon: '🛒' },
      { type: 'Transport publik', estimated_distance: '~200m', icon: '🚌' },
      { type: 'Kafene', estimated_distance: '~300m', icon: '☕' }
    )

    if (distance !== null && distance < 5) {
      amenities.push({
        type: 'Spital',
        estimated_distance: '~1.5km',
        icon: '🏥',
      })
    }
  } else {
    amenities.push(
      { type: 'Shkolla', estimated_distance: '~1km', icon: '🏫' },
      { type: 'Supermarketa', estimated_distance: '~700m', icon: '🛒' }
    )
  }

  return {
    location_score: score,
    has_neighborhood: !!property.neighborhood,
    has_coordinates: !!(property.latitude && property.longitude),
    distance_from_center: distance,
    city_tier: cityTier,
    nearby_amenities: amenities,
  }
}