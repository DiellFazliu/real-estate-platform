/**
 * Konverton Prisma Decimal objects në plain numbers
 * Për t'i dërguar në Client Components
 */

export function serializeProperty(property: any) {
  return {
    ...property,
    price: property.price ? Number(property.price) : null,
    price_per_m2: property.price_per_m2 ? Number(property.price_per_m2) : null,
    latitude: property.latitude ? Number(property.latitude) : null,
    longitude: property.longitude ? Number(property.longitude) : null,
    distance_from_center: property.distance_from_center
      ? Number(property.distance_from_center)
      : null,
  }
}

export function serializeProperties(properties: any[]) {
  return properties.map(serializeProperty)
}