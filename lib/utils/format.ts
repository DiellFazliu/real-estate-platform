export function formatPrice(price: number, listingType?: string): string {
  const formatted = `€${price.toLocaleString()}`
  return listingType === 'rent' ? `${formatted}/muaj` : formatted
}

export function formatLocation(
  neighborhood?: string | null,
  city?: string | null
): string {
  const parts = [neighborhood, city].filter(Boolean)
  return parts.join(', ') || 'Location'
}