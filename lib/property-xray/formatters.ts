export function formatPropertyType(value: string) {
  const labels: Record<string, string> = {
    apartment: 'Apartament',
    house: 'Shtëpi',
    villa: 'Vilë',
    penthouse: 'Penthouse',
    studio: 'Studio',
    land: 'Truall',
    commercial: 'Komerciale',
    office: 'Zyrë',
  }

  return labels[value] ?? value
}

export function formatCondition(value: string | null) {
  const labels: Record<string, string> = {
    new: 'E re',
    excellent: 'Shumë e mirë',
    good: 'E mirë',
    needs_renovation: 'Kërkon rinovim',
    under_construction: 'Në ndërtim',
  }

  return value ? labels[value] ?? value : 'Mungon'
}

export function formatOrientation(value: string | null) {
  const labels: Record<string, string> = {
    north: 'Veri',
    south: 'Jug',
    east: 'Lindje',
    west: 'Perëndim',
    north_east: 'Verilindje',
    north_west: 'Veriperëndim',
    south_east: 'Juglindje',
    south_west: 'Jugperëndim',
  }

  return value ? labels[value] ?? value : 'Mungon'
}

export function formatFurnished(value: string | null) {
  const labels: Record<string, string> = {
    unfurnished: 'E pamobiluar',
    semi_furnished: 'Gjysmë e mobiluar',
    fully_furnished: 'Plotësisht e mobiluar',
  }

  return value ? labels[value] ?? value : 'Mungon'
}